import net from 'net';
import { EventEmitter } from 'events';

import {
  attachDataListener,
  createDecoder,
  createEncoder,
  socketEncoding,
} from './ipc-transcoder';

const xpipe = require('xpipe');

interface IPCClientOptions {
  socketPath: string;
}

export class IPCClient extends EventEmitter {

  private socket: net.Socket | undefined;
  private socketPath: string;
  private encoder;
  private closing = false;

  constructor(options: IPCClientOptions) {
    super();
    this.socketPath = xpipe.eq(options.socketPath);
    this.encoder = createEncoder();
  }

  public connect() {
    return new Promise<void>((resolve, reject) => {
      if (this.socket) {
        resolve();
        return;
      }

      const socket = net.createConnection({ path: this.socketPath });

      socket.setEncoding(socketEncoding);
      attachDataListener({
        emitter: this,
        socket,
        createDecoder,
      });

      socket.once('connect', () => {
        this.socket = socket;
        socket.on('error', (err) => this.emit('error', err));
        resolve();
      });

      socket.once('error', (err) => reject(err));

      socket.on('close', () => {
        if (!this.closing)
          this.emit('disconnect');

        this.closing = false;
        delete this.socket;
      })
    })
  }

  public close() {
    return new Promise<void>(async (resolve) => {
      if (!this.socket) {
        resolve();
        return;
      }
      this.closing = true;
      this.socket.once('close', () => resolve());
      this.socket.end();
    })
  }

  public send(topic: string, message?: string) {
    if (!this.socket) {
      throw new Error('Cannot send message, no active connection');
    }

    const data = this.encoder({ topic, message });
    this.socket.write(data);
  }
}
