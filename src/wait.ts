/**
 * @module
 *
 */
import { IPCMessageType } from './deamonize';

export const notifyReady = () => {
  if (process.send)
    process.send(IPCMessageType.DEAMON_READY);
}
