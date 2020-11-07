#!/usr/bin/env node

import meow from 'meow';
import chalk from 'chalk';
import program from '.';

import { getCommand } from './getCommand';

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
    wait: {
      type: 'boolean',
      alias: 'w',
    },
  },
});

if (cli.input.length === 0) {
  cli.showHelp(0);
}

export type FlagsType = typeof cli.flags;

const main = async () => {
  const command = getCommand(cli.input);
  await program(command, cli.flags);
}

main()
  .catch((err: Error) => {
    console.error(chalk.yellow(err.message));
    process.exit(1);
  });
