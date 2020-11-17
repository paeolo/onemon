import * as exits from 'exits';
import shell from './shell';

import { ChildProcess } from 'child_process';
import { Socket } from 'net';
import {
  SocketMessageType,
  IPCMessageType,
  SerializedBoolean,
} from './deamonize';

const startListening = (server: any) => new Promise((resolve, reject) => {
  server.on('listening', () => resolve());
  server.on('error', (err: Error) => reject(err));

  server.listen();
});

const main = async () => {
  let proc: ChildProcess;
  let clientCount = 0;

  const xpipe = require('xpipe');
  const IPCServer = require('@crussell52/socket-ipc').Server;
  const [
    shellScript,
    socket,
    waitDeamonReady
  ] = process.argv.slice(2);

  const state = {
    DeamonReady: waitDeamonReady === SerializedBoolean.FALSE
  }
  const socketFile = xpipe.eq(socket);
  const server = new IPCServer({ socketFile: socketFile });

  server.on('connection', (clientId: number, socket: Socket) => {
    if (state.DeamonReady) {
      server.send(SocketMessageType.DEAMON_READY, undefined, clientId);
    }

    socket.on('close', () => {
      clientCount += -1;
      if (clientCount <= 0) {
        server.close();
      }
    });
    clientCount += 1;
  });

  server.on(`message.${SocketMessageType.CLOSE}`, () => server.close());

  server.on('close', () => {
    if (proc)
      proc.kill();
    process.exit();
  });

  await startListening(server);

  exits.attach();
  exits.add(() => server.close());

  if (process.send)
    process.send(IPCMessageType.SERVER_READY);

  setTimeout(
    () => {
      if (clientCount === 0)
        throw new Error('No one connected within the second.')
    },
    1000
  );

  proc = shell({ stdio: ['pipe', 'pipe', 'pipe', 'ipc'] }).spawn(shellScript);

  proc.on('message', message => {
    if (message === IPCMessageType.DEAMON_READY) {
      state.DeamonReady = true;
      server.broadcast(SocketMessageType.DEAMON_READY);
    }
  });

  if (proc.stdout)
    proc.stdout.on('data', chunk => server.broadcast(SocketMessageType.PRINT, chunk));
}

if (require.main === module) {
  main();
}
