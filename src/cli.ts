#!/usr/bin/env node

import meow from 'meow';
import chalk from 'chalk';
import main from '.';

const cli = meow(`
  Usage
    $ onemon <command> [deamon-script] <script>

  List of commands
    - kill |> Kill the deamon
    - start (default) |> start the deamon and launch script with deamon attached
`, {
  flags: {
    silent: {
      type: 'boolean',
      alias: 's',
    },
  },
});

if (cli.input.length === 0) {
  cli.showHelp(0);
}

export type FlagsType = typeof cli.flags;

main(cli.input, cli.flags)
  .catch((err: Error) => {
    console.error(chalk.yellow(err.message));
    process.exit(1);
  });
