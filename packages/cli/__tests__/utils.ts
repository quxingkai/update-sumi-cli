import { Cli, CommandClass } from 'clipanion';
import { PassThrough } from 'stream';
import getStream from 'get-stream';

export const runCli = async (cli: Cli | (() => CommandClass[]), args: string[]) => {
  let finalCli;

  if (typeof cli === `function`) {
    finalCli = new Cli();

    for (const command of cli()) {
      finalCli.register(command);
    }
  } else {
    finalCli = cli;
  }

  const stream = new PassThrough();
  const promise = getStream(stream);

  const exitCode = await finalCli.run(args, {
    stdin: process.stdin,
    stdout: stream,
    stderr: stream,
  });

  stream.end();

  const output = await promise;

  if (exitCode !== 0)
    throw new Error(output);

  return output;
};
