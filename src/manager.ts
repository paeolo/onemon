import path from 'path';
import assert from 'assert';
import crypto from 'crypto';
import findUp from 'find-up';
import fs from 'fs';

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

export const getShellScript = (pkg: string, script: string) => {
  const pkgJSON = require(`${pkg}/package.json`);

  assert(
    pkgJSON.scripts && pkgJSON.scripts[script],
    `Couldn't find a script called "${script}"`
  );

  return pkgJSON.scripts[script];
}

export const getHash = (value: string) => {
  return crypto
    .createHash('sha1')
    .update(value)
    .digest('hex')
    .substring(0, 10);
}

export const getSocketName = (filePath: string) => {
  fs.accessSync(filePath, fs.constants.F_OK);
  return `onemon.${getHash(path.resolve(filePath))}.socket`
}
