import { Cli, Command } from 'clipanion';
import * as yup from 'yup';

class InitCommand extends Command {
  static usage = Command.Usage({
    description: 'init a new extension powered by kaitian',
    examples: [
      [
        'Initialize a kaitian extension project in target-folder',
        'cd target-folder && kaitian init',
      ],
    ],
  });

  @Command.String({ required: false })
  public targetDir?: string;

  get realTargetDir() {
    if (this.targetDir) {
      if (this.targetDir === '.') {
        return process.cwd();
      } else if (this.targetDir.startsWith('..')) {
        return path.join(process.cwd(), this.targetDir);
      }
    }

    return process.cwd();
  }

  @Command.Path('init')
  async execute() {
    try {
      // eslint-disable-next-line global-require
      await require('../lib/command/init')(this.realTargetDir);
    } catch (err) {
      console.error('kaitian init error:', err);
      process.exit(1);
    }
  }
}

class FibonacciCommand extends Command {
  @Command.String({ required: true })
  public a!: number;

  @Command.String({ required: true })
  public b!: number;

  @Command.Path(`fibo`)
  async execute() {
    // ...
  }

  static schema = yup.object().shape({
    a: yup.number().integer(),
    b: yup.number().integer(),
  })
}

const cli = new Cli({
  binaryLabel: `My Utility`,
  binaryName: `bin`,
  binaryVersion: `1.0.0`,
});

cli.register(InitCommand);
cli.register(FibonacciCommand);

cli.runExit(process.argv.slice(2), {
  ...Cli.defaultContext,
});
