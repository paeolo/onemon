import * as exits from 'exits';
import npm from './npm';

import { ChildProcess } from 'child_process';
import {
  SocketMessageType,
  READY_MSG
} from './deamonize';
import { Socket } from 'dgram';

const main = async () => {
  let proc: ChildProcess;
  let clientCount = 0;

  // NOTE:
  // By default, attach() will intercept signals, exceptions,
  // unhandled rejections, and end of execution events.
  exits.attach();
  exits.add(async () => server.close());

  const xpipe = require('xpipe');
  const IPCServer = require('@crussell52/socket-ipc').Server;
  const script = process.argv[2];
  const socket = process.argv[3];

  const socketFile = xpipe.eq(socket);
  const server = new IPCServer({ socketFile: socketFile });

  server.on('connection', (id: number, socket: Socket) => {
    clientCount += 1;
    socket.on('close', () => {
      clientCount += -1;
      if (clientCount <= 0) {
        server.close();
      }
    });
  });

  server.on(
    `message.${SocketMessageType.CLOSE}`,
    () => {
      server.close();
    });

  server.on('listening', () => {
    console.log(`IPC listening on ${socket}`);

    if (process.send)
      process.send(READY_MSG);

    setTimeout(
      () => {
        if (clientCount === 0)
          throw new Error('No one connected within the second.')
      },
      1000
    );

    proc = npm().stdio('pipe').spawn(script);

    if (proc.stdout)
      proc.stdout.on('data', chunk => { server.broadcast(SocketMessageType.PRINT, chunk) });
  });

  server.on('close', () => {
    if (proc)
      proc.kill();
    process.exit();
  })

  server.listen();
}

if (require.main === module) {
  main();
}
