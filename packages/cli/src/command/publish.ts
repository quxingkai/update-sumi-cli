import { marketplaceApiAddress } from '../const';
import { Command } from 'clipanion';
import { kaitianConfiguration } from '../config';
import { getExtPkgContent } from '../util/extension';

const fse = require('fs-extra');
const yauzl = require('yauzl');
const tmp = require('tmp');
const denodeify = require('denodeify');
const chalk = require('chalk');
const urllib = require('urllib');
const request = require('request');
const Basement = require('@alipay/basement');

const { pack } = require('./package');
const basementApi = require('../../marketplace/basement.json');
const marketplace = require('../../marketplace/teamAk.json');

const tmpName = denodeify(tmp.tmpName);

function readManifestFromPackage(packagePath) {
  return new Promise((c, e) => {
    yauzl.open(packagePath, (err, zipfile) => {
      if (err) {
        return e(err);
      }
      const onEnd = () => e(new Error('Manifest not found'));
      zipfile.once('end', onEnd);
      zipfile.on('entry', entry => {
        if (!/^extension\/package\.json$/i.test(entry.fileName)) {
          return;
        }
        zipfile.removeListener('end', onEnd);
        zipfile.openReadStream(entry, (err, stream) => {
          if (err) {
            return e(err);
          }
          const buffers = [];
          stream.on('data', buffer => buffers.push(buffer));
          stream.once('error', e);
          stream.once('end', () => {
            try {
              c(JSON.parse(Buffer.concat(buffers).toString('utf8')));
            } catch (err) {
              e(err);
            }
          });
        });
      });
    });
  });
}

async function _publish(options) {
  const { appId, masterKey, endpoint } = basementApi;
  const { file } = new Basement({
    appId,
    masterKey,
    endpoint,
    urllib
  });

  const { packagePath, manifest } = options;
  const packageStream = fse.createReadStream(packagePath);
  const name = `${manifest.publisher}.${manifest.name}-${manifest.version}.zip`;

  console.log(chalk.green(`Publishing ${name} ...`));

  console.log(chalk.green(`Upload ${name} to OSS...`));

  const { url } = await file.upload(name, packageStream, { mode: 'internal' });

  // TODO: read teamAccount from process.env
  const pkgContent = await getExtPkgContent();
  const teamAccount = await kaitianConfiguration.getTeamAccount(pkgContent.publisher);

  if (!teamAccount) {
    console.log(chalk.red(`Please login for publisher:${pkgContent.publisher} firstly`));
    return;
  }

  request.post(
    `${marketplaceApiAddress}/extension/upload?name=${manifest.name}&url=${url}`,
    {
      method: 'POST',
      headers: {
        'x-account-id': teamAccount.accountId,
        'x-master-key': teamAccount.masterKey,
      },
    },
    (err, res) => {
      if (err) {
        console.log(chalk.red(err.message));
        return;
      }
      if (res.statusCode !== 200) {
        console.log(res.body);
        console.log(chalk.red(`
Error:
    ${res.body}
`));
        return;
      }
      console.log(chalk.green('Done.'));
    },
  );
}

function publish(packagePath: string, ignoreFile: string, skipCompile?: boolean) {
  let promise;
  if (packagePath) {
    promise = readManifestFromPackage(packagePath).then(manifest => ({
      manifest,
      packagePath
    }));
  } else {
    const cwd = process.cwd();
    const useYarn = false;
    promise = tmpName().then((tmpPath: string) =>
      pack({ packagePath: tmpPath, cwd, useYarn, skipCompile, ignoreFile })
    );
  }

  return promise.then(_publish);
}

export class PublishCommand extends Command {
  static usage = Command.Usage({
    description: 'publish the extension',
    details: `
    This command helps you publish your extension via cli.
    - The \`--file\` option is used to publish the extension package located at the specified path.
    - The \`--ignoreFile\` option is used to set an alternative file for .ktignore.
    - If the \`--skipCompile\` flag is set, kaitian cli will skip run prepublish to compile.
    `,
    examples: [
      [
        'Examples:',
        'kaitian publish --file=./my-extension-1.0.0.zip.'
      ],
    ],
  });

  @Command.String('--file')
  public file!: string;

  @Command.Boolean('--skipCompile')
  public skipCompile = false;

  @Command.String('--ignoreFile')
  public ignoreFile!: string;

  @Command.Path('publish')
  async execute() {
    await publish(this.file, this.ignoreFile, this.skipCompile);
  }
}
