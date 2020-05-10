import { Command } from 'clipanion';
import inquirer from 'inquirer';

import { kaitianConfiguration } from '../config';
import { getExtPkgContent } from '../util/extension';
import chalk from 'chalk';

export class LoginCommand extends Command {
  static usage = Command.Usage({
    description: 'Remove specific [version] engine',
  });

  @Command.Path('login')
  async execute() {
    let publisher: string = '';
    try {
      const pkg = await getExtPkgContent();
      publisher = pkg.publisher;
    } catch (err) {
      this.context.stdout.write('Can\'t read field `publisher` from current folder');
    }

    if (!publisher) {
      const answers = await inquirer.prompt<{ publisher: string }>({
        type: 'input',
        name: 'publisher',
        message: 'Please input the `publisher`',
      });
      publisher = answers.publisher;
    }

    const config = await kaitianConfiguration.getContent();

    const ifExistedTeamAccount = config.teamAccounts['publisher'];
    if (ifExistedTeamAccount && ifExistedTeamAccount.teamAccount && ifExistedTeamAccount.teamKey) {
      this.context.stdout.write(chalk.green(`Publisher:${publisher} is logged already`));
      return;
    }

    this.context.stdout.write(chalk.blue(`Login for publisher:${publisher} ->`));

    const answers = await inquirer.prompt<{
      teamAccount: string;
      teamKey: string;
    }>([
      {
        type: 'input',
        name: 'teamAccount',
        message: `Please input the 'teamAccount' for publisher:${publisher}`,
      },
      {
        type: 'input',
        name: 'teamKey',
        message: `Please input the 'teamKey' for publisher:${publisher}`,
      },
    ]);

    config.teamAccounts[publisher] = { ...answers };
    await kaitianConfiguration.replaceContent(config);

    this.context.stdout.write(chalk.green(`Login successfully for publisher:${publisher}`));
  }
}
