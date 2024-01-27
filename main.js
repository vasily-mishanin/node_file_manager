import { getUserName, parseCommand } from './utils.js';
import {
  goUp,
  changeDir,
  listDirItems,
  readAndPrint,
  creaTeNewFile,
  renameFile,
  copyFile,
  deleteFile,
  moveFile,
  calculateHash,
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

  const [command, arg1, arg2] = parseCommand(line);

  if (command === 'up') {
    workingDirectory = goUp(workingDirectory) ?? workingDirectory;
    rl.write(`You are currently in ${workingDirectory} \n`);
  }

  if (command === 'cd') {
    if (arg1) {
      workingDirectory = changeDir(workingDirectory, arg1) ?? workingDirectory;
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
    const filePath = arg1;
    if (filePath) {
      readAndPrint(workingDirectory, filePath);
    } else {
      rl.write(`Not file path. Specify argument for file path \n`);
    }
  }

  if (command === 'add') {
    const newFileName = arg1;
    if (newFileName) {
      creaTeNewFile(workingDirectory, newFileName);
    } else {
      rl.write(`Not new file name. Specify argument for new file name \n`);
    }
  }

  if (command === 'rn') {
    const pathToFile = arg1;
    const newFileName = arg2;

    if (pathToFile && newFileName) {
      renameFile(pathToFile, newFileName, workingDirectory);
    } else {
      rl.write(
        `Invalid command - should be "rn path_to_file new_filename". Specify both arguments \n`
      );
      rl.write(`You are currently in ${workingDirectory} \n`);
    }
  }

  if (command === 'cp') {
    const pathToFile = arg1;
    const pathToNewDirectory = arg2;

    if (pathToFile && pathToNewDirectory) {
      copyFile(pathToFile, pathToNewDirectory, workingDirectory);
    } else {
      rl.write(
        `Invalid command - should be "cp path_to_file path_to_new_directory". Specify both arguments \n`
      );
      rl.write(`You are currently in ${workingDirectory} \n`);
    }
  }

  // mv path_to_file path_to_new_directory
  if (command === 'mv') {
    const pathToFile = arg1;
    const pathToNewDirectory = arg2;

    if (pathToFile && pathToNewDirectory) {
      moveFile(pathToFile, pathToNewDirectory, workingDirectory);
    } else {
      rl.write(
        `Invalid command - should be "mv path_to_file path_to_new_directory". Specify both arguments \n`
      );
      rl.write(`You are currently in ${workingDirectory} \n`);
    }
  }

  //rm path_to_file
  if (command == 'rm') {
    const pathToFile = arg1;
    if (pathToFile) {
      deleteFile(pathToFile, workingDirectory);
    } else {
      rl.write(
        `Invalid command - should be "rm path_to_file". Specify argument \n`
      );
      rl.write(`You are currently in ${workingDirectory} \n`);
    }
  }

  // OS Commands
  if (command === 'os' && !OS_ARGUMEMTS.includes(arg1)) {
    rl.write(`Invalid command - ${arg1} is not valid argument \n`);
    rl.write(`Avalable options: ${OS_ARGUMEMTS} \n`);
    rl.write(`You are currently in ${workingDirectory} \n`);
  } else {
    if (command === 'os' && arg1 === '--EOL') {
      rl.write(os.EOL);
      rl.write(`You are currently in ${workingDirectory} \n`);
    }

    if (command === 'os' && arg1 === '--cpus') {
      let cpus = os.cpus();
      cpus = cpus.map((cpu) => ({
        model: cpu.model,
        speed: `${cpu.speed} GHz`,
      }));
      rl.write(`CPUs amount: ${cpus.length}\n`);
      cpus.forEach((cpu, index) => {
        rl.write(`${index + 1}\n`);
        rl.write(`model:${cpu.model}\n`);
        rl.write(`speed:${cpu.speed}\n`);
      });
      rl.write(`You are currently in ${workingDirectory} \n`);
    }

    if (command === 'os' && arg1 === '--homedir') {
      rl.write(os.homedir() + '\n');
      rl.write(`You are currently in ${workingDirectory} \n`);
    }

    if (command === 'os' && arg1 === '--username') {
      rl.write(os.userInfo().username + '\n');
      rl.write(`You are currently in ${workingDirectory} \n`);
    }

    if (command === 'os' && arg1 === '--architecture') {
      rl.write(os.arch() + '\n');
      rl.write(`You are currently in ${workingDirectory} \n`);
    }
  }

  // HASH
  // hash path_to_file
  if (command === 'hash') {
    const pathToFile = arg1;
    if (pathToFile) {
      calculateHash(pathToFile, workingDirectory).then((hash) => {
        rl.write(hash + '\n');
        rl.write(`You are currently in ${workingDirectory} \n`);
      });
    } else {
      rl.write(
        `Invalid command - should be "hash path_to_file". Specify argument \n`
      );
      rl.write(`You are currently in ${workingDirectory} \n`);
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
