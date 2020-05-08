import { Command } from 'clipanion';
const pkg = require('../../package.json');

export class HelpCommand extends Command {
  @Command.Path(`--help`)
  @Command.Path(`-h`)
  async execute() {
    this.context.stdout.write(this.cli.usage(null));
  }
}

export class VersionCommand extends Command {
  @Command.Path(`--version`)
  @Command.Path(`-v`)
  async execute() {
    console.log(pkg.version);
  }
}
