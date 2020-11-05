import { FlagsType } from './cli';
import { getCommand } from './getCommand';
import { assertIsDefined } from './utils';
import { run, kill } from './deamonize'
export enum CommandType {
  KILL = 'kill',
  RUN = 'run'
}

export interface Command {
  type: CommandType,
  deamon: string,
  script?: string
}

export default async (input: string[], flags: FlagsType) => {

  const command = getCommand(input);

  switch (command.type) {
    case CommandType.RUN:
      assertIsDefined('deamon', command.deamon);
      await run(command.deamon, command.script, flags.silent);
      break;
    case CommandType.KILL:
      assertIsDefined('deamon', command.deamon);
      await kill(command.deamon);
      break;
  }
}
