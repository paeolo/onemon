import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import * as exits from 'exits';

import runner from './runner';
import {
  getPKG,
  getShellScript,
  getSocketName
} from './manager';
import { IPCClient } from './ipc-client';

export const enum SocketMessageType {
  PRINT = 'PRINT',
  CLOSE = 'CLOSE',
  DEAMON_READY = 'DEAMON_READY'
};

export const enum IPCMessageType {
  SERVER_READY = 'SERVER_READY',
  DEAMON_READY = 'DEAMON_READY'
};

export const enum SerializedBoolean {
  TRUE = 'TRUE',
  FALSE = 'FALSE'
}

interface ConnectOptions {
  socketPath: string;
  deamonPath: string;
  waitDeamonReady?: boolean;
  retry?: boolean;
};

interface RunOptions {
  script?: string;
  silent?: boolean;
  wait?: boolean;
};

export const run = async (deamonPath: string, options: RunOptions) => {
  const {
    script,
    silent,
    wait
  } = options;

  let pkgScript: string | undefined;
  if (script) {
    if (script.split('.').pop() !== 'js') {
      pkgScript = await getPKG(script)
    }
  }

  const socketName = getSocketName(deamonPath);
  const socketPath = path.join('/tmp', socketName);

  const { client, deamonReady } = await connectToDeamon({
    socketPath,
    deamonPath,
    waitDeamonReady: wait,
    retry: true
  });

  console.log(chalk.yellow(`[ONEMON] IPC connected on ${socketName}`));

  exits.attach();
  exits.add(() => client.close());

  client.on('disconnect', () => {
    console.log(chalk.yellow(`[ONEMON] IPC disconnected from ${socketName}`))
  });

  if (!silent) {
    client.on(`message.${SocketMessageType.PRINT}`, (message: any) => {
      process.stdout.write(Buffer.from(message.data))
    });
  }

  if (wait)
    await deamonReady;

  if (script) {
    console.log(chalk.yellow('[ONEMON] Launching script'));

    if (pkgScript) {
      runner({ stdio: 'inherit', cwd: pkgScript, shell: true })
        .spawn(getShellScript(pkgScript, script))
        .on('exit', (code: number) => exits.terminate('exit', code));
    } else {
      runner({ stdio: 'inherit' })
        .fork(script, [])
        .on('exit', (code: number) => exits.terminate('exit', code));
    }
  } else if (wait) {
    console.log(chalk.yellow('[ONEMON] Notified ready'));
  }
}

export const kill = async (deamonPath: string) => {
  const socketName = getSocketName(deamonPath);
  const socketPath = path.join('/tmp', socketName);

  const { client } = await connectToDeamon({
    socketPath,
    deamonPath,
    retry: false
  });

  exits.attach();
  exits.add(() => client.close());

  client.send(SocketMessageType.CLOSE);
  client.close();
}

const connectToDeamon = async (options: ConnectOptions) => {
  const {
    socketPath,
    retry
  } = options;

  try {
    return await connectToSocket(socketPath);
  } catch (error) {
    if (retry) {
      await createDeamon(options);
      return connectToSocket(socketPath);
    } else {
      throw error;
    }
  }
}

const connectToSocket = async (socketPath: string) => {
  const client = new IPCClient({ socketPath });

  const deamonReady = new Promise<void>(
    resolve => client
      .on(`message.${SocketMessageType.DEAMON_READY}`, () => resolve())
  );

  await client.connect();

  return {
    client,
    deamonReady
  };
}

const createDeamon = async (options: ConnectOptions) =>
  new Promise<void>((resolve) => {
    const {
      deamonPath,
      socketPath,
      waitDeamonReady
    } = options;

    const resolved = path.resolve(deamonPath);
    const proc = runner(
      {
        detached: true,
        stdio: 'ignore',
        cwd: path.dirname(resolved)
      })
      .fork(path.resolve(__dirname, 'deamon.js'),
        [
          resolved,
          socketPath,
          waitDeamonReady ? SerializedBoolean.TRUE : SerializedBoolean.FALSE
        ]
      );

    proc.on('message', message => {
      if (message === IPCMessageType.SERVER_READY) {
        proc.disconnect();
        proc.unref();
        resolve();
      }
    });
  });
