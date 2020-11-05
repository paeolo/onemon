import path from 'path';
import fs from 'fs';
import { fork } from 'child_process';
import * as exits from 'exits';

import npm from './npm';
import { getPKG, getSocketName } from './manager';

export enum SocketMessageType {
  PRINT = 'PRINT',
  CLOSE = 'CLOSE'
}

interface ConnectOptions {
  socket: string;
  pkg: string;
  deamon: string;
  retry?: boolean;
};

export const READY_MSG = 'READY_MSG';

const xpipe = require('xpipe');
const IPCClient = require('@crussell52/socket-ipc').Client;

export const run = async (deamon: string, script?: string, silent?: boolean) => {
  const pkg = await getPKG(deamon);
  const socket = getSocketName(deamon);

  let pkgScript: string | undefined;

  if (script)
    pkgScript = await getPKG(script);

  const client = await connectToDeamon({ socket, pkg, deamon, retry: true });

  console.log(`IPC connected on ${socket}`);

  exits.attach();
  exits.add(() => client.close());

  if (script && pkgScript) {
    npm().stdio('inherit').cwd(pkgScript).spawn(script);
  }

  if (!silent) {
    client.on(`message.${SocketMessageType.PRINT}`, (message: any) => {
      process.stdout.write(Buffer.from(message.data))
    });
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
    pkg,
    socket,
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
      deamon,
      pkg,
      socket,
    } = options;

    const proc = fork(
      path.join(__dirname, 'deamon.js'),
      [deamon, socket],
      {
        detached: true,
        stdio: 'ignore',
        cwd: pkg,
      }
    );

    proc.once('message', async () => {
      proc.disconnect();
      proc.unref();
      resolve();
    });
  });
