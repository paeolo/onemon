import { spawn, SpawnOptions } from 'child_process';

type STDIOType = 'ignore' | 'inherit' | 'pipe';

interface ShellOptions {
  stdio: STDIOType;
  cwd?: string;
};

/**
 * @description
 * Spawn a script like the "npm run" command.
 */
class shell {

  private options: SpawnOptions;

  constructor(options: ShellOptions) {
    this.options = {
      stdio: options.stdio,
      cwd: options.cwd || process.cwd()
    }
  }

  public spawn(script: string) {

    const PATHES = [];

    if (process.env.PATH)
      PATHES.push(process.env.PATH);
    if (this.options.cwd)
      PATHES.push(`${this.options.cwd}/node_modules/.bin`);

    return spawn(script, [], {
      shell: true,
      cwd: this.options.cwd,
      stdio: this.options.stdio,
      env: {
        ...process.env,
        PATH: PATHES.join(':')
      }
    })
  }
}

export default (options: ShellOptions) => new shell(options);
