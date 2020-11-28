import {
  fork,
  spawn,
  StdioOptions,
} from 'child_process';

interface RunnerOptions {
  stdio?: StdioOptions;
  detached?: boolean;
  cwd?: string;
  shell?: boolean;
};

/**
 * @description
 * Wrapper arround child_process.
 */
class Runner {
  private stdio: StdioOptions;
  private detached: boolean;
  private cwd: string;
  private shell: boolean;

  constructor(options: RunnerOptions) {
    this.stdio = options.stdio || 'inherit';
    this.detached = options.detached || false;
    this.cwd = options.cwd || process.cwd();
    this.shell = options.shell || false;
  }

  public spawn(script: string) {

    const PATHES = [];

    if (process.env.PATH)
      PATHES.push(process.env.PATH);
    if (this.cwd)
      PATHES.push(`${this.cwd}/node_modules/.bin`);

    return spawn(script, [], {
      shell: this.shell,
      detached: this.detached,
      cwd: this.cwd,
      stdio: this.stdio,
      env: {
        ...process.env,
        PATH: PATHES.join(':')
      }
    })
  }

  public fork(filePath: string, args: string[]) {
    return fork(
      filePath,
      args,
      {
        detached: this.detached,
        stdio: this.stdio,
        cwd: this.cwd,
      })
  }
}

export default (options: RunnerOptions) => new Runner(options);
