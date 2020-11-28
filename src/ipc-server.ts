import net from 'net';
import fs from 'fs';
import { v4 as uuid } from 'uuid'
import { EventEmitter } from 'events';

import {
  attachDataListener,
  createDecoder,
  createEncoder,
  socketEncoding,
} from './ipc-transcoder';

const xpipe = require('xpipe');

interface IPCServerOptions {
  socketPath: string;
}

export class IPCServer extends EventEmitter {

  private server: net.Server | undefined;
  private socketPath: string;
  private encoder;
  private socketToClient: Map<net.Socket, string>;
  private clientToSocket: Map<string, net.Socket>;

  constructor(options: IPCServerOptions) {
    super();
    this.socketPath = xpipe.eq(options.socketPath);
    this.encoder = createEncoder();
    this.socketToClient = new Map();
    this.clientToSocket = new Map();
  }

  public listen() {
    return new Promise<void>((resolve, reject) => {
      if (this.server) {
        resolve();
        return;
      }

      const server = net.createServer();
      this.socketToClient = new Map();
      this.clientToSocket = new Map();

      server.once('listening', () => {
        this.server = server;
        server.on('error', (err) => this.emit('error', err));
        resolve()
      });

      server.once('error', (err: Error & { code: string }) => {
        if (err.code !== 'EADDRINUSE') {
          reject(err);
          return;
        }

        // Handle the case of a dead socket.
        const testSocket = net.createConnection({ path: this.socketPath });

        testSocket.once('connect', () => reject(err));
        testSocket.once('error', (testErr: Error & { code: string }) => {
          if (testErr.code !== 'ECONNREFUSED') {
            reject(err);
            return;
          }

          if (process.platform === 'win32') {
            reject(err)
            return;
          }

          try {
            fs.unlinkSync(this.socketPath);
          } catch (unlinkErr) {
            reject(err);
            return;
          }
          server.listen(this.socketPath);
        });
      });

      server.on('connection', socket => {
        const id = uuid();
        this.socketToClient.set(socket, id);
        this.clientToSocket.set(id, socket);

        const forgetClient = () => {
          this.socketToClient.delete(socket);
          this.clientToSocket.delete(id);
        };

        socket.setEncoding(socketEncoding);
        attachDataListener({
          emitter: this,
          socket,
          createDecoder,
          clientId: id
        });

        socket.on('end', forgetClient);
        socket.on('close', forgetClient);
        this.emit('connection', id, socket);
      });

      server.on('close', () => {
        this.emit('close');
        delete this.server;
      });

      server.listen(this.socketPath);
    })
  }

  public close() {
    return new Promise<void>(async (resolve) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.socketToClient.forEach((id, socket) => {
        socket.end();
      });

      this.server.once('close', () => resolve());
      this.server.close();
    })
  }

  public send(clientId: string, topic: string, message?: string) {
    if (!this.server) {
      throw new Error('Cannot send message, no active server');
    }

    const socket = this.clientToSocket.get(clientId);
    if (!socket) {
      throw new Error('Cannot send message, invalid clientId');
    }

    const data = this.encoder({ topic, message });
    socket.write(data);
  }

  public broadcast(topic: string, message?: string) {
    if (!this.server) {
      throw new Error('Cannot send message, no active server');
    }

    const data = this.encoder({ topic, message });

    this.socketToClient.forEach((id, socket) => {
      socket.write(data);
    });
  }
}
