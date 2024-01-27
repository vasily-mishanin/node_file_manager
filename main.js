import { getUserName, parseCommand } from './utils.js';
import {
  goUp,
  changeDir,
  listDirItems,
  readAndPrint,
  creaTeNewFile,
} from './comandsHandlers.js';
import * as readline from 'node:readline/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import os from 'os';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const username = getUserName(process.argv.slice(2));

const COMMANDS = [
  'up',
  'cd',
  'ls',
  'cat',
  'add',
  'rn',
  'cp',
  'mv',
  'rm',
  'hash',
  'compress',
  'decompress',
  'os',
];
const OS_ARGUMEMTS = [
  '--EOL',
  '--cpus',
  '--homedir',
  '--username',
  '--architecture',
];
const ROOT_DIR = os.homedir();
let workingDirectory = ROOT_DIR;

// START
console.log(`Welcome to the File Manager, ${username}!`);
console.log(`You are currently in ${workingDirectory}`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('line', (line) => {
  if (line.includes('.exit')) {
    rl.close();
  }

  const [command, arg] = parseCommand(line);

  if (command === 'up') {
    workingDirectory = goUp(workingDirectory) ?? workingDirectory;
    rl.write(`You are currently in ${workingDirectory} \n`);
  }

  if (command === 'cd') {
    if (arg) {
      workingDirectory = changeDir(workingDirectory, arg) ?? workingDirectory;
      rl.write(`You are currently in ${workingDirectory} \n`);
    } else {
      rl.write(`Specify argument for new path \n`);
    }
  }

  if (command === 'ls') {
    listDirItems(workingDirectory);
    rl.write(`You are currently in ${workingDirectory} \n`);
  }

  if (command === 'cat') {
    const filePath = arg;
    if (filePath) {
      readAndPrint(workingDirectory, filePath);
    } else {
      rl.write(`Not file path. Specify argument for file path \n`);
    }
  }

  if (command === 'add') {
    const newFileName = arg;
    if (newFileName) {
      creaTeNewFile(workingDirectory, newFileName);
    } else {
      rl.write(`Not new file name. Specify argument for new file name \n`);
    }
  }
});

rl.on('SIGINT', () => {
  rl.close();
});

rl.on('close', () => {
  rl.write(`Thank you for using File Manager, ${username}, goodbye!`);
  process.exit();
});
