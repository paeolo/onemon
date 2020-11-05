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

export const READY_MSG = 'READY_MSG';

const xpipe = require('xpipe');
const IPCClient = require('@crussell52/socket-ipc').Client;

export const run = async (deamon: string, script?: string) => {
  exits.attach();

  let client: any;
  let pkgScript: string | undefined;
  const pkg = await getPKG(deamon);
  const socket = getSocketName(deamon);

  if (script)
    pkgScript = await getPKG(script);

  const proc = await createDeamonIfNeeded(deamon, pkg, socket);

  if (proc) {
    proc.once('message', async () => {
      proc.disconnect();
      proc.unref();
      client = await createClient(pkg, socket);
      await runScript(client, socket, pkgScript, script);
    });
  }
  else {
    client = await createClient(pkg, socket);
    await runScript(client, socket, pkgScript, script);
  }
}

export const kill = async (deamon: string) => {
  const pkg = await getPKG(deamon);
  const socket = getSocketName(deamon)
  const client = await createClient(pkg, socket);

  client.on('connect', async () => {
    client.send(SocketMessageType.CLOSE);
    client.close();
  });

  client.connect();
}

const runScript = async (client: any, socket: string, pkgScript?: string, script?: string) => {

  client.on('connect', () => {
    console.log(`IPC connected on ${socket}`);

    if (script && pkgScript) {
      npm().stdio('inherit').cwd(pkgScript).spawn(script);
    }

    client.on(`message.${SocketMessageType.PRINT}`, (message: any) => {
      process.stdout.write(Buffer.from(message.data))
    });
  });

  client.on('disconnect', () => {
    console.log(`IPC disconnected from ${socket}`)
  });

  client.connect();
}

const createDeamonIfNeeded = async (deamon: string, pkg: string, socket: string) => {
  const socketFile = xpipe.eq(path.join(pkg, socket));
  try {
    fs.accessSync(socketFile, fs.constants.F_OK);
    return;
  } catch (error) {
    return fork(
      path.join(__dirname, 'deamon.js'),
      [deamon, socket],
      {
        detached: true,
        stdio: 'ignore',
        cwd: pkg,
      });
  }
}

const createClient = async (pkg: string, socket: string) => {
  const socketFile = xpipe.eq(path.join(pkg, socket));
  const client = new IPCClient({ socketFile: socketFile });

  exits.add(() => {
    client.close();
  });

  return client;
}
