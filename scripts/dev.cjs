const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const node = process.execPath;

const processes = [
  {
    name: 'api',
    command: node,
    args: [path.join(root, 'server.cjs')],
  },
  {
    name: 'web',
    command: node,
    args: [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')],
  },
];

let stopping = false;
const children = [];

function write(name, data, isError = false) {
  const lines = data.toString().split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    const output = `[${name}] ${line}\n`;
    if (isError) {
      process.stderr.write(output);
    } else {
      process.stdout.write(output);
    }
  }
}

function stopAll(code = 0) {
  if (stopping) return;
  stopping = true;

  for (const child of children) {
    if (!child.killed) child.kill();
  }

  setTimeout(() => process.exit(code), 100);
}

for (const item of processes) {
  const child = spawn(item.command, item.args, {
    cwd: root,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    windowsHide: true,
  });

  children.push(child);

  child.stdout.on('data', (data) => write(item.name, data));
  child.stderr.on('data', (data) => write(item.name, data, true));

  child.on('error', (error) => {
    write(item.name, `Gagal menjalankan proses: ${error.message}`, true);
    stopAll(1);
  });

  child.on('exit', (code, signal) => {
    if (stopping) return;
    write(item.name, `Proses berhenti${signal ? ` karena ${signal}` : ` dengan kode ${code}`}.`, code !== 0);
    stopAll(code || 0);
  });
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
