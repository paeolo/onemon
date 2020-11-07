import { assertIsDefined } from './utils';
import { FlagsType } from './cli';
import {
  Command,
  CommandType
} from './getCommand';
import {
  run,
  kill
} from './deamonize';

export { notifyReady } from './wait';

export default async (command: Command, flags: FlagsType) => {

  switch (command.type) {
    case CommandType.RUN:
      assertIsDefined('deamon', command.deamon);
      await run(
        command.deamon,
        { script: command.script, silent: flags.silent, wait: flags.wait }
      );
      break;
    case CommandType.KILL:
      assertIsDefined('deamon', command.deamon);
      await kill(command.deamon);
      break;
  }
}
