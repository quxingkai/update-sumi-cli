const path = require('path');
const glob = require('glob');
const ejs = require('ejs');
const fse = require('fs-extra');
const chalk = require('chalk');
const inquirer = require('inquirer');

const templateDir = path.join(__dirname, '../template');

module.exports = async function(target) {
  try {
    const questions = getQuestions();
    const answers = await inquirer.prompt(questions);
    const targetDir = target || path.join(process.cwd(), answers.name);
    const pathExists = await checkPathExists(targetDir);
    if (pathExists) {
      await ejsRenderDir(templateDir, targetDir, {...answers});
      await fse.move(path.join(targetDir, 'vscode'), path.join(targetDir, '.vscode'));
      logMsg(answers.name);
    }
  } catch (err) {
    throw err;
  }
};

function ejsRenderDir(sourceDir, targetDir, data) {
  return new Promise((resolve, reject) => {
    glob('**', {
      cwd: sourceDir,
      nodir: true,
    }, (err, files) => {
      if (err) {
        return reject(err);
      }

      // eslint-disable-next-line
      const promises = files.map((filename) => {
        const fullname = path.join(sourceDir, filename);

        ejs.renderFile(fullname, data, (error, result) => {
          if (error) {
            return reject(error);
          }

          const basename = path.basename(fullname);
          let realFilename = filename;

          if (/^_/.test(basename)) {
            realFilename = basename.replace('_', '.');
          }

          if (/\.ejs$/.test(basename)) {
            realFilename = basename.replace(/\.ejs$/, '');
          }

          const targetPath = path.join(targetDir, realFilename);
          return fse.ensureFile(targetPath)
            .then(() => {
              fse.writeFileSync(targetPath, result);
              return resolve(1);
            })
            .catch((e) => {
              return reject(e);
            });
        });
      });

      return Promise.all(promises);
    });
  });
}

async function checkPathExists(file) {
  const exists = await fse.pathExists(file);
  if (exists) {
    const answer = await inquirer.prompt({
      type: 'confirm',
      name: 'go',
      message:
        'The existing file in the current directory. Are you sure to continue ？',
      default: false,
    });
    return answer.go;
  }
  return true;
}

function getQuestions() {
  return [
    {
      type: 'input',
      name: 'name',
      message: 'What\'s the name of your extension?',
      validate: (value) => {
        if (!value) {
          return 'extension name cannot be empty';
        }
        return true;
      },
      filter(value) {
        return value.trim();
      },
    },
    {
      type: 'input',
      name: 'publisher',
      message: 'What\'s the publisher of your extension?',
      validate: (value) => {
        if (!value) {
          return 'extension publisher cannot be empty';
        }
        return true;
      },
      filter(value) {
        return value.trim();
      },
    },
    {
      type: 'input',
      name: 'displayName',
      message: 'What\'s the displayName of your extension?',
    },
    {
      type: 'input',
      name: 'description',
      message: 'What\'s the description of your extension?',
    },
  ];
}

function logMsg(extensionName) {
  console.log(`
    Success! initialized a kaitian extension.
    Inside that directory, you can run several commands:

    Start the extension in development mode.
    ${chalk.yellow(`  cd ${extensionName}`)}
    ${chalk.yellow('  npm install')}
    ${chalk.yellow('  npm run watch')}

    Bundles the extension in production mode.
    ${chalk.yellow('  npm run compile')}

    You can upload the ${extensionName}.zip files to the kaitian extension marketplace.

    Happy hacking!
  `);
  console.log();
}
