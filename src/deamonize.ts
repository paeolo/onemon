import path from 'path';
import fs from 'fs';
import { fork } from 'child_process';
import * as exits from 'exits';

import shell from './shell';
import {
  getPKG,
  getShellScript,
  getSocketName
} from './manager';

export const enum SocketMessageType {
  PRINT = 'PRINT',
  CLOSE = 'CLOSE',
  DEAMON_READY = 'DEAMON_READY'
};

export const enum IPCMessageType {
  SERVER_READY = 'SERVER_READY',
};

interface ConnectOptions {
  socket: string;
  pkg: string;
  deamon: string;
  retry?: boolean;
};

interface RunOptions {
  script?: string;
  silent?: boolean;
  wait?: boolean;
};

const xpipe = require('xpipe');
const IPCClient = require('@crussell52/socket-ipc').Client;

export const run = async (deamon: string, options: RunOptions) => {
  const {
    script,
    silent,
    wait
  } = options;

  const socket = getSocketName(deamon);
  const pkg = await getPKG(deamon);

  const client = await connectToDeamon({ socket, pkg, deamon, retry: true });

  console.log(`IPC connected on ${socket}`);

  exits.attach();
  exits.add(() => client.close());

  if (!silent) {
    client.on(`message.${SocketMessageType.PRINT}`, (message: any) => {
      process.stdout.write(Buffer.from(message.data))
    });
  }

  if (script) {
    if (wait)
      await deamonIsReady(client);

    const pkgScript = await getPKG(script);
    const shellScript = getShellScript(pkgScript, script);

    shell({ stdio: 'inherit', cwd: pkgScript })
      .spawn(shellScript)
      .on('exit', (code: number) => exits.terminate('exit', code));
  }

  client.on('disconnect', () => {
    console.log(`IPC disconnected from ${socket}`)
  });
}

export const kill = async (deamon: string) => {
  const pkg = await getPKG(deamon);
  const socket = getSocketName(deamon);

  const client = await connectToDeamon({ socket, pkg, deamon, retry: false });

  exits.attach();
  exits.add(() => client.close());

  client.send(SocketMessageType.CLOSE);
  client.close();
}

const connectToDeamon = async (options: ConnectOptions) => {
  const {
    socket,
    pkg,
    retry
  } = options;

  const socketFile = xpipe.eq(path.join(pkg, socket));

  try {
    fs.accessSync(socketFile, fs.constants.F_OK);
    return await connectToSocket(socketFile);

  } catch (error) {
    if (retry) {
      await createDeamon(options);
      return connectToSocket(socketFile);
    }
  }
}

const connectToSocket = (socketFile: string) =>
  new Promise<any>((resolve, reject) => {
    const client = new IPCClient({ socketFile: socketFile });

    client.on('connectError', () => {
      client.close();
      reject();
    });
    client.on('connect', () => resolve(client));

    client.connect();
  });

const createDeamon = async (options: ConnectOptions) =>
  new Promise((resolve) => {
    const {
      socket,
      pkg,
      deamon,
    } = options;

    const shellScript = getShellScript(pkg, deamon);

    const proc = fork(
      path.join(__dirname, 'deamon.js'),
      [shellScript, socket],
      {
        detached: true,
        stdio: 'ignore',
        cwd: pkg,
      }
    );

    proc.on('message', async message => {
      if (message === IPCMessageType.SERVER_READY) {
        proc.disconnect();
        proc.unref();
        resolve();
      }
    });
  });

const deamonIsReady = (client: any) => new Promise(
  resolve => client.on(
    `message.${SocketMessageType.DEAMON_READY}`,
    () => resolve()
  )
);
