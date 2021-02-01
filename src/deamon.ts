import * as exits from 'exits';
import { ChildProcess } from 'child_process';
import { Socket } from 'net';

import runner from './runner';
import {
  SocketMessageType,
  IPCMessageType,
  SerializedBoolean,
} from './deamonize';
import { IPCServer } from './ipc-server';

const main = async () => {
  let proc: ChildProcess;
  let clientCount = 0;

  const [
    deamonPath,
    socketPath,
    waitDeamonReady,
    supportsColor
  ] = process.argv.slice(2);

  const forceColor = supportsColor === SerializedBoolean.TRUE;
  const state = {
    DeamonReady: waitDeamonReady === SerializedBoolean.FALSE
  };

  const server = new IPCServer({ socketPath });

  server.on('connection', (clientId: string, socket: Socket) => {
    if (state.DeamonReady) {
      server.send(clientId, SocketMessageType.DEAMON_READY, undefined);
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

  await server.listen();

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

  proc = runner({ detached: true, stdio: 'pipe', })
    .fork(deamonPath, [], forceColor);

  proc.on('message', message => {
    if (message === IPCMessageType.DEAMON_READY) {
      state.DeamonReady = true;
      server.broadcast(SocketMessageType.DEAMON_READY);
    }
  });

  if (proc.stdout)
    proc.stdout.on(
      'data',
      chunk => server.broadcast(SocketMessageType.PRINT, chunk)
    );
}

if (require.main === module) {
  main();
}
