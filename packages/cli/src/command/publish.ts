import { Command } from 'clipanion';
import os from 'os';

import { marketplaceApiAddress } from '../const';
import { kaitianConfiguration, ITeamAccount } from '../config';
import { getExtPkgContent } from '../util/extension';

const yauzl = require('yauzl');
const tmp = require('tmp');
const formstream = require('formstream');

const chalk = require('chalk');
const urllib = require('urllib');

const { pack } = require('./package');

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

async function publishByPrivateToken(options, privateToken: string, publisher: string) {
  const { packagePath, manifest, name } = options;
  console.log(chalk.green(`Publishing ${manifest.name} ...`));
  console.log(chalk.green(`Uploading ${manifest.name} to marketplace...`));

  const form = formstream();
  form.file('file', packagePath);
  // 处理部分内部包带有 @ali/alipay 前缀导致 name 跟插件市场的 name 不一致的问题
  form.field('name', name || manifest.kaitianExtensionId || manifest.name);


  try {
    const { data } = await urllib.request(
      `${marketplaceApiAddress}/extension/upload?publisher=${publisher}`,
      {
        method: 'POST',
        timeout: 2 * 60 * 1000,
        dataType: 'json',
        headers: {
          ...form.headers(),
          'x-private-token': privateToken,
        },
        stream: form,
      },
    );

    console.log(chalk.green('extensionReleaseId: '), data.extensionReleaseId);

    console.log(chalk.green('Done.'));
  } catch (err) {
    console.log(chalk.red(err.message));
  }
}


async function publishByAccountIdAndMasterKey(options) {
  const { packagePath, manifest, name } = options;

  let teamAccount: ITeamAccount | undefined = undefined;
  if (process.env.KT_EXT_ACCOUNT_ID && process.env.KT_EXT_MASTER_KEY) {
    teamAccount = {
      accountId: process.env.KT_EXT_ACCOUNT_ID,
      masterKey: process.env.KT_EXT_MASTER_KEY,
    }
  } else {
    teamAccount = await kaitianConfiguration.getTeamAccount(manifest.publisher);
  }

  if (!teamAccount) {
    console.log(chalk.red(`Please login for publisher:${manifest.publisher} firstly`));
    return;
  }

  console.log(chalk.green(`Publishing ${manifest.name} ...`));
  console.log(chalk.green(`Uploading ${manifest.name} to marketplace...`));

  const form = formstream();
  form.file('file', packagePath);
  // 处理部分内部包带有 @ali/alipay 前缀导致 name 跟插件市场的 name 不一致的问题
  form.field('name', name || manifest.kaitianExtensionId || manifest.name);

  try {
    const { data } = await urllib.request(
      `${marketplaceApiAddress}/extension/upload`,
      {
        method: 'POST',
        timeout: 2 * 60 * 1000,
        dataType: 'json',
        headers: {
          ...form.headers(),
          'x-account-id': teamAccount.accountId,
          'x-master-key': teamAccount.masterKey,
        },
        stream: form,
      },
    );

    console.log(chalk.green('extensionReleaseId: '), data.extensionReleaseId);

    console.log(chalk.green('Done.'));
  } catch (err) {
    console.log(chalk.red(err.message));
  }
}

function publish(packagePath: string, options: {
  ignoreFile: string,
  skipCompile?: boolean,
  privateToken?: string,
  publisher?: string,
  name?: string,
}) {
  const { ignoreFile, skipCompile, privateToken, publisher } = options;

  const usePrivateTokenUpload = privateToken && publisher;

  let promise;
  if (packagePath) {
    promise = readManifestFromPackage(packagePath).then(manifest => ({
      manifest,
      packagePath
    }));
  } else {
    const cwd = process.cwd();
    const useYarn = false;

    promise = getExtPkgContent().then(pkg => {
      return pack({
        cwd,
        packagePath: os.tmpdir(),
        useYarn,
        skipCompile,
        ignoreFile,
      });
    });
  }

  return promise.then(usePrivateTokenUpload
    ? (options) => publishByPrivateToken(options, privateToken!, publisher!)
    : publishByAccountIdAndMasterKey);
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

  @Command.String('--privateToken')
  public privateToken?: string;

  @Command.String('--publisher')
  public publisher?: string;

  @Command.String('--name')
  public name?: string;

  @Command.Path('publish')
  async execute() {
    await publish(this.file, {
      ignoreFile: this.ignoreFile,
      skipCompile: this.skipCompile,
      privateToken: this.privateToken,
      name: this.name,
    });
  }
}
