import path from 'path';
import fs from 'fs';

import { Command } from 'clipanion';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import execa from 'execa';
import copy from 'kopy';

import { npmClient, kaitianInfraDir } from './const';

const fsPromise = fs.promises;

const defaultTemplatePkg = '@ali/kaitian-simple-ext-template';

const spinner = ora();

const templateDir = path.resolve(kaitianInfraDir, 'template');

async function ensurePkgJSONFile(targetDir: string) {
  if (!fs.existsSync(targetDir)) {
    await fsPromise.mkdir(targetDir);
  }

  const targetPkgJSONPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(targetPkgJSONPath)) {
    return;
  }
  const json = JSON.stringify({
    name: '@ali/kaitian-template',
  }, null, 2);
  await fsPromise.writeFile(targetPkgJSONPath, json, 'utf8');
}

function logMsg() {
  console.log(`
    插件初始化成功.
    依次执行以下命令开始插件开发:

    ${chalk.yellow('  npm install')}
    ${chalk.yellow('  npm run watch')}

    编译插件.
    ${chalk.yellow('  npm run compile')}

    打包插件.
    ${chalk.yellow('  kaitian package')}

    Happy hacking!
  `);
}

async function init(targetPath: string, targetTemplatePkg: string = defaultTemplatePkg) {
  await ensurePkgJSONFile(templateDir);
  spinner.start(`Downloading template package ${targetTemplatePkg}`);
  // TODO: fetch latest version for package and update when necessary
  await execa.commandSync(`${npmClient} i ${targetTemplatePkg} -S`, { cwd: templateDir });
  spinner.succeed('Done!');

  try {
    const targetTemplatePath = path.resolve(templateDir, 'node_modules', targetTemplatePkg);
    const { questions, move } = require(path.resolve(targetTemplatePath, 'kaitian-template.config.js'));

    const answers = await inquirer.prompt<any>(questions);

    const targetDir = targetPath || process.cwd();

    await copy(path.resolve(targetTemplatePath, 'template'), targetDir, {
      data: answers,
      move,
    });
    logMsg();
  } catch (err) {
    console.log(err.stack);
  }
};

export class InitCommand extends Command {
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
      await init(this.realTargetDir);
    } catch (err) {
      console.error('kaitian init error:', err);
      process.exit(1);
    }
  }
}
