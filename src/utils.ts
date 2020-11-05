import assert from 'assert';

export const assertIsDefined = (key: string, value: any) => assert(
  value !== undefined,
  `Missing required parameter "${key}".`
);
