/**
 * @module
 */
export enum CommandType {
  KILL = 'kill',
  RUN = 'run'
};

export interface Command {
  type: CommandType,
  deamon: string,
  script?: string
};

export const getCommand = (input: string[]): Command => {

  const commandType = Object.values(CommandType).find(value => value.toString() === input[0]);

  if (commandType !== undefined) {

    return {
      type: commandType,
      deamon: input[1],
      script: input[2]
    }
  }
  else {

    return {
      type: CommandType.RUN,
      deamon: input[0],
      script: input[1]
    }
  }
}
