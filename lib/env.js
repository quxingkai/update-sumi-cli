const ip = require('ip');
const path = require('path');
const os = require('os');

const DEV_PATH = path.join(os.homedir(), '.kaitian-dev');

module.exports = {
  CLIENT_IP: ip.address(),
  DEV_PATH,
};
