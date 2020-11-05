import path from 'path';
import assert from 'assert';
import crypto from 'crypto';
import findUp from 'find-up';

export const getPKG = async (script: string) => {

  const matcher = (directory: string) => {
    let candidate = path.join(directory, 'package.json');
    if (findUp.sync.exists(candidate)) {
      const pkg = require(candidate);
      if (pkg.scripts && pkg.scripts[script]) {
        return directory;
      }
    }
  }

  const result = await findUp(matcher, { type: 'directory' });
  assert(result, `Couldn't find a script called "${script}"`);

  return result;
}

export const getHash = (deamon: string) => {
  return crypto
    .createHash('sha1')
    .update(deamon)
    .digest('hex')
    .substring(0, 10);
}

export const getSocketName = (deamon: string) => {
  return `.onemon.${getHash(deamon)}.socket`
}
