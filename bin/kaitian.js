#!/usr/bin/env node
const chalk = require('chalk');
const program = require('commander');
const semver = require('semver');
const { install, update } = require('@alipay/cloud-ide-ext-vscode-extension-builder');
const { zip } = require('@alipay/cloud-ide-ext-vscode-extension-builder/dist/code/zip');

const packageConfig = require('../package');
const checkVersion = require('../lib/checkVersion');

program.version(packageConfig.version).usage('<command> [options]');

// output help information on unknown commands
program.arguments('<command>').action((cmd) => {
  program.outputHelp();
  console.log(chalk.red(`Unknown command ${chalk.yellow(cmd)}`));
  console.log();
});

program
  .command('init')
  .description('init a new extension powered by kaitian')
  .on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('  $ kaitian init');
  })
  .action(async () => {
    if (process.argv.slice(2).length > 1) {
      program.outputHelp();
      process.exit(0);
    }

    try {
      // eslint-disable-next-line global-require
      await require('../command/init')();
    } catch (err) {
      console.error('kaitian init error:', err);
      process.exit(1);
    }
  });

program
  .command('watch')
  .description('watch extension in development mode')
  .on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('  $ kaitian watch');
  })
  .action(async () => {
    if (process.argv.slice(2).length > 1) {
      program.outputHelp();
      process.exit(0);
    }

    try {
      // eslint-disable-next-line global-require
      await require('../command/webpack')('watch');
    } catch (err) {
      console.error('kaitian watch error:', err);
      process.exit(1);
    }
  });


program
  .command("dev")
  .option("-d, --debug", "启动调试模式")
  .option("-p, --serverPort [serverPort]", "IDE Server 端口")
  .option("-w, --workspaceDir [workspaceDir]", "工作空间路径，默认为当前目录")
  .option("-e, --extensionDir <extensionDir>", "插件目录，支持指定多个插件，以逗号分隔，默认为当前目录")
  .option("--execute [executeable path]", "IDE 可执行文件目录")
  .description("launch Kaitian IDE load specified extension.")
  .action(args => {
    // eslint-disable-next-line global-require
    require('../command/dev')(args);
  });

program
  .command('compile')
  .description('compile extension in production mode')
  .on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('  $ kaitian compile');
  })
  .action(async () => {
    if (process.argv.slice(2).length > 1) {
      program.outputHelp();
      process.exit(0);
    }

    try {
      // eslint-disable-next-line global-require
      await require('../command/webpack')('run');
    } catch (err) {
      console.error('kaitian watch error:', err);
      process.exit(1);
    }
  });

program
  .command('zip [sourceDir] [targetDir] [ignoreFile]')
  .description('build a Zip file')
  .action((...args) => zip(...args).then(() => {
    console.log('build completed...');
    process.exit(0);
  }));

program
  .command('install <publisher> <name> <version> [extensionDir]')
  .description('installing a extension')
  .action((...args) => install(...args).then(console.log('installation completed...')));

program
  .command('update')
  .description('upgrade the extension')
  .action((...args) => update(...args).then(console.log('upgrade completed...')));

// add some useful info on help
program.on('--help', () => {
  console.log();
  console.log(
    `  Run ${chalk.cyan('kaitian <command> --help')} for detailed usage of given command.`
  );
  console.log();
});

program.commands.forEach((c) => c.on('--help', () => console.log()));

program.parse(process.argv);

(async () => {
  // check node version
  checkNodeVersion();

  try {
    // check kaitian version
    // await checkKaitianVersion();
  } catch (error) {
    console.log(error);
  }
})();

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
}

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs(cmd) {
  const args = {};
  if (cmd) {
    cmd.options.forEach((o) => {
      const key = camelize(o.long.replace(/^--/, ''));
      // if an option is not present and Command has a method with the same name
      // it should not be copied
      if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
        args[key] = cmd[key];
      }
    });
    if (cmd.parent && cmd.parent.rawArgs) {
      args.command = cmd.parent.rawArgs[2];
    }
  }
  return args;
}

function checkNodeVersion() {
  if (!semver.satisfies(process.version, packageConfig.engines.node)) {
    console.log();
    console.log(
      chalk.red(
        `You must upgrade node to ${packageConfig.engines.node} to use kaitian`
      )
    );
    console.log();
    process.exit(1);
  }
}

async function checkKaitianVersion() {
  const packageName = 'kaitian';
  const packageVersion = packageConfig.version;
  const latestVersion = await checkVersion(packageName, packageVersion);
  if (latestVersion) {
    console.log(`  latest:     + ${chalk.yellow(latestVersion)}`);
    console.log(`  installed:  + ${chalk.red(packageVersion)} \n`);
    console.log(`  how to update: ${chalk.red('npm install kaitian@latest -g')} \n`);
  }
}
