const fse = require('fs-extra');
const yauzl = require('yauzl');
const tmp = require('tmp');
const denodeify = require('denodeify');
const chalk = require('chalk');
const urllib = require('urllib');
const request = require('request');
const Basement = require('@alipay/basement');

const { pack } = require('./package');
const marketplace = require('../../../configs/marketplace/teamAk.json');
const basementApi = require('../../../configs/marketplace/basement.json');

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
  request.post(
    `${marketplace.apiAddress}/extension/upload?name=${manifest.name}&url=${url}`,
    {
      method: 'POST',
      headers: {
        'x-account-id': marketplace.teamAccount,
        'x-master-key': marketplace.teamKey,
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

module.exports = (packagePath, ignoreFile, skipCompile) => {
  let promise;
  if (packagePath) {
    promise = readManifestFromPackage(packagePath).then(manifest => ({
      manifest,
      packagePath
    }));
  } else {
    const cwd = process.cwd();
    const useYarn = false;
    promise = tmpName().then(tmpPath =>
      pack({ packagePath: tmpPath, cwd, useYarn, skipCompile, ignoreFile })
    );
  }

  return promise.then(_publish);
};
