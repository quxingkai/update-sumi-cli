import { Command } from 'clipanion';

export class TestCommand extends Command {
  static usage = Command.Usage({
    description: 'Test command',
    details: `
      This command logs "Hello, world!" to the console.
    `,
  });

  @Command.Path('test')
  async execute() {
    console.log('Hello, world!');
  }
}
