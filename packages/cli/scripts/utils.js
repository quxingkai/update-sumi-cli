const read = require('read');
// const WebApi = require('azure-devops-node-api/WebApi');
// const GalleryApi = require('azure-devops-node-api/GalleryApi');
const denodeify = require('denodeify');
const chalk = require('chalk');

// eslint-disable-next-line no-underscore-dangle
const __read = denodeify(read);

function provideRead(prompt, options = {}) {
  if (process.env.VSCE_TESTS || !process.stdout.isTTY) {
    return Promise.resolve('y');
  }
  return __read({ prompt, ...options });
}

exports.read = provideRead;
const marketplaceUrl =
  process.env.VSCE_MARKETPLACE_URL || 'https://marketplace.visualstudio.com';
function getPublishedUrl(extension) {
  return `${marketplaceUrl}/items?itemName=${extension}`;
}
exports.getPublishedUrl = getPublishedUrl;
async function getGalleryAPI(pat) {
  // from https://github.com/Microsoft/tfs-cli/blob/master/app/exec/extension/default.ts#L287-L292
//   const authHandler = WebApi.getBasicHandler('OAuth', pat);
//   return new GalleryApi.GalleryApi(marketplaceUrl, [authHandler]);
  // const vsoapi = new WebApi(marketplaceUrl, authHandler);
  // return await vsoapi.getGalleryApi();
}
exports.getGalleryAPI = getGalleryAPI;
async function getSecurityRolesAPI(pat) {
//   const authHandler = WebApi.getBasicHandler('OAuth', pat);
//   const vsoapi = new WebApi.WebApi(marketplaceUrl, authHandler);
//   return await vsoapi.getSecurityRolesApi();
}
exports.getSecurityRolesAPI = getSecurityRolesAPI;
function getPublicGalleryAPI() {
//   return new publicgalleryapi.PublicGalleryAPI(marketplaceUrl, '3.0-preview.1');
}
exports.getPublicGalleryAPI = getPublicGalleryAPI;
function normalize(path) {
  return path.replace(/\\/g, '/');
}
exports.normalize = normalize;
function chain2(a, b, fn, index = 0) {
  if (index >= b.length) {
    return Promise.resolve(a);
  }
  return fn(a, b[index]).then(a => chain2(a, b, fn, index + 1));
}
function chain(initial, processors, process) {
  return chain2(initial, processors, process);
}
exports.chain = chain;
function flatten(arr) {
  // eslint-disable-next-line prefer-spread
  return [].concat.apply([], arr);
}
exports.flatten = flatten;
const CancelledError = 'Cancelled';
function isCancelledError(error) {
  return error === CancelledError;
}
exports.isCancelledError = isCancelledError;
class CancellationToken {
  constructor() {
    this.listeners = [];
    // eslint-disable-next-line no-underscore-dangle
    this._cancelled = false;
  }

  get isCancelled() {
    // eslint-disable-next-line no-underscore-dangle
    return this._cancelled;
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      const index = this.listeners.indexOf(fn);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  cancel() {
    const emit = !this._cancelled;
    this._cancelled = true;
    if (emit) {
      this.listeners.forEach(l => l(CancelledError));
      this.listeners = [];
    }
  }
}
exports.CancellationToken = CancellationToken;
async function sequence(promiseFactories) {
  // eslint-disable-next-line no-restricted-syntax
  for (const factory of promiseFactories) {
    // eslint-disable-next-line no-await-in-loop
    await factory();
  }
}
exports.sequence = sequence;
let LogMessageType;
// eslint-disable-next-line no-shadow
(function(LogMessageType) {
  LogMessageType[(LogMessageType['DONE'] = 0)] = 'DONE';
  LogMessageType[(LogMessageType['INFO'] = 1)] = 'INFO';
  LogMessageType[(LogMessageType['WARNING'] = 2)] = 'WARNING';
  LogMessageType[(LogMessageType['ERROR'] = 3)] = 'ERROR';
})(LogMessageType || (LogMessageType = {}));
const LogPrefix = {
  [LogMessageType.DONE]: chalk.default.bgGreen.black(' DONE '),
  [LogMessageType.INFO]: chalk.default.bgBlueBright.black(' INFO '),
  [LogMessageType.WARNING]: chalk.default.bgYellow.black(' WARNING '),
  [LogMessageType.ERROR]: chalk.default.bgRed.black(' ERROR '),
};
function _log(type, msg, ...args) {
  args = [LogPrefix[type], msg, ...args];
  if (type === LogMessageType.WARNING) {
    console.warn(...args);
  } else if (type === LogMessageType.ERROR) {
    console.error(...args);
  } else {
    console.log(...args);
  }
}
exports.log = {
  done: _log.bind(null, LogMessageType.DONE),
  info: _log.bind(null, LogMessageType.INFO),
  warn: _log.bind(null, LogMessageType.WARNING),
  error: _log.bind(null, LogMessageType.ERROR),
};
