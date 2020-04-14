import path from 'path';
import glob from 'glob';
import ejs from 'ejs';
import fse from 'fs-extra';
import chalk from 'chalk';
import inquirer from 'inquirer';

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
      logMsg(answers.name, target !== process.cwd());
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
      message: '请输入插件名称',
      validate: (value) => {
        if (!value) {
          return '插件名不能为空';
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
      message: '请输入插件 publisher，package.json 中的 publisher 字段',
      validate: (value) => {
        if (!value) {
          return '插件 publisher 不能为空';
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
      message: '请输入插件要显示的名称?',
    },
    {
      type: 'input',
      name: 'description',
      message: '请输入插件描述',
    },
  ];
}

function logMsg(extensionName, needCd) {
  console.log(`
    插件初始化成功.
    依次执行以下命令开始插件开发:

    ${needCd ? chalk.yellow(`  cd ${extensionName}`) : ''}
    ${chalk.yellow('  npm install')}
    ${chalk.yellow('  npm run watch')}

    编译插件.
    ${chalk.yellow('  npm run compile')}

    打包插件.
    ${chalk.yellow('  kaitian package')}

    Happy hacking!
  `);
  console.log();
}
