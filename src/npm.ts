
import { spawn, SpawnOptions } from 'child_process';

class npm {

  private options: SpawnOptions;

  constructor() {
    this.options = {
      cwd: undefined,
      stdio: undefined
    }
  }

  public cwd(directory: string) {
    this.options.cwd = directory;
    return this;
  }

  public stdio(mode: 'ignore' | 'inherit' | 'pipe') {
    this.options.stdio = mode;
    return this;
  }

  public spawn(script: string) {
    return spawn(`npm run ${script}`, [], {
      shell: true,
      cwd: this.options.cwd,
      stdio: this.options.stdio
    })
  }
}

export default () => new npm();
