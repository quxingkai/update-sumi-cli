const path = require('path');
const cp = require('child_process');
const shellPath = require('shell-path');

module.exports = function (args) {
  const isDebugger = !!args.debug;
  const executeable = !!args.execute;
  const workspaceDir = args.workspaceDir || process.cwd();
  const extensionCandidate = args.extensionDir || process.cwd();
  const serverPort = args.serverPort || 50999;

  let argv = [
    `--workspacePath=${workspaceDir}`,
    isDebugger && `--isDev=1`,
  ];

  if (isDebugger) {
    console.log(`Will start extension debug mode.`);
  }

  const extensionDevPaths = extensionCandidate.split(",");
  console.log(extensionDevPaths);
  if (executeable) {
    console.log(`Executeable path: ${args.execute}`);
    argv = argv.concat(extensionDevPaths.map((p) => `--extensionCandidate=${p}`));

    const options = {
      env: { ...process.env },
      maxBuffer: 10240 * 2048,
    };

    if (options.env.KTELECTRON) {
      delete options.env.KTELECTRON;
    }

    if (isDebugger) {
      options.env.IS_DEV = '1';
    }

    console.log(`cli args: ${argv.join(' ')}`);
    const electronProcess = cp.execFile(args.execute, argv, options);
    if (electronProcess.stdout) {
      electronProcess.stdout.addListener('data', (e) => {
        console.log(e.toString().slice(0, -1));
      });
    }

    electronProcess.on('exit', (code, signal) => {
      console.log(`${args.execute} exited, code ${code}, signal ${signal}`);
    });

    electronProcess.on('error', (err) => {
      console.log(err.message);
    });

    process.on('exit', () => {
      electronProcess.kill('SIGKILL');
    });
  } else {
    console.log(extensionDevPaths.map((p) => `--extensionCandidate=${p}`));
    argv = argv.concat([
      `--serverPort=${serverPort}`,
      `--workspaceDir=${workspaceDir}`,
      `--extHostPath=${path.join(__dirname, "../hosted/ext.process.js")}`,
      ...extensionDevPaths.map((p) => `--extensionCandidate=${p}`),
    ]);

    console.log("Start Kaitian Process", "argv", argv.join(" "));

    const options = {
      env: {
        ...process.env,
        PATH: shellPath.sync(),
        VSCODE_NLS_CONFIG: process.env.VSCODE_NLS_CONFIG,
      },
    };

    const serverProcess = cp.fork(path.join(__dirname, "../scripts/node/index.js"), argv, options);

    serverProcess.on("exit", (code, signal) => {
      console.log(`${code}, ${signal}`);
    });

    serverProcess.on("error", message => {
      console.log(message.message.slice(0, -1));
    });

    process.on('exit', () => {
      serverProcess.kill('SIGKILL');
    });
    if (serverProcess.stdout || serverProcess.stdin) {
      serverProcess.stdout.on("data", chunk => {
        console.log(`${chunk.toString().slice(0, -1)}`);
      });
      serverProcess.stderr.on("error", err => {
        console.log(`${err.message.slice(0, -1)}`);
      });
    }
  }
};
