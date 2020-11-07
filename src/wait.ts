/**
 * @module
 *
 */
const CHILD_READY_BUFFER = Buffer.from('__ONEMON__RDY__');

export const checkReady = (chunk: Buffer) => chunk.equals(CHILD_READY_BUFFER);
export const notifyReady = () => process.stdout.write(CHILD_READY_BUFFER);
