import net from 'net';
import { EventEmitter } from 'events';

interface MessageData {
  topic: string;
  message?: string;
}

const delimiter = "\0\0";
export const socketEncoding = 'utf8';

/**
 * @description
 * Create a function that stringify JSON
 */
export const createEncoder = () => {
  return (data: MessageData) => {
    return JSON.stringify(data) + delimiter;
  };
};

/**
 * @description
 * Create a function that parse JSON
 */
export const createDecoder = () => {
  let buffer: string | undefined = '';

  return (chunk: any) => {
    let data = buffer += chunk;
    let raw = data.split(delimiter);

    // Pop the last element off of the message array.
    // It is either an incomplete message or an empty string.
    buffer = raw.pop();
    return raw.map((data: any) => JSON.parse(data));
  }
}

interface DataListenerOptions {
  socket: net.Socket;
  emitter: EventEmitter;
  createDecoder: () => (chunk: any) => any[];
  clientId?: string;
}

/**
 * @description
 * Attach listener to emit event on message received
 */
export const attachDataListener = (options: DataListenerOptions) => {
  const decoder = options.createDecoder();
  const {
    socket,
    emitter
    , clientId
  } = options;

  const emitError = (err: Error) => {
    socket.destroy(err);
    emitter.emit('error', err, clientId);
  };

  const emitMessage = (data: MessageData) => {
    emitter.emit('message', data.message, data.topic, clientId);
    emitter.emit(`message.${data.topic}`, data.message, clientId);
  };

  socket.on('data', chunk => {
    try {
      decoder(chunk).forEach((data) => emitMessage(data))
    } catch (error) {
      emitError(error);
    }
  });
};
