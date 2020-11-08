/**
 * @module
 *
 */
import fs from 'fs';

const CHILD_READY_BUFFER = Buffer.from('__ONEMON__RDY__');
let notified = false;

export const checkReady = (chunk: Buffer) => chunk.equals(CHILD_READY_BUFFER);

export const notifyReady = () => {
  if (!notified) {
    try {
      fs.createWriteStream('', { fd: 3 }).write(CHILD_READY_BUFFER);
    } finally {
      notified = true;
    }
  }
}
