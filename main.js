import { getUserName, parseCommand } from './utils.js';
import {
  goUp,
  changeDir,
  listDirItems,
  readAndPrint,
  calculateHash,
  compress,
  decompress,
} from './comandsHandlers.js';

import {
  createNewFile,
  renameFile,
  copyFile,
  moveFile,
  deleteFile,
} from './fileHandlers';

import * as readline from 'node:readline/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import os from 'os';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const username = getUserName(process.argv.slice(2));

export const COMMANDS = [
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
  '.exit',
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
  const [command, arg1, arg2] = parseCommand(line);

  if (!COMMANDS.includes(command)) {
    console.log(`Uknown command: ${command}`);
    console.log(`Avalable commands: ${COMMANDS}`);
    console.log(`You are currently in ${workingDirectory}`);
  }

  if (command === '.exit') {
    rl.close();
  }

  // up
  if (command === 'up') {
    workingDirectory = goUp(workingDirectory) ?? workingDirectory;
    process.stdout.write(`You are currently in ${workingDirectory} \n`);
  }

  // cd
  if (command === 'cd') {
    if (arg1) {
      workingDirectory = changeDir(workingDirectory, arg1) ?? workingDirectory;
      process.stdout.write(`You are currently in ${workingDirectory} \n`);
    } else {
      process.stdout.write(
        `Specify argument for new path (cd path_to_directory) \n`
      );
    }
  }

  // ls - list items
  if (command === 'ls') {
    listDirItems(workingDirectory);
    process.stdout.write(`You are currently in ${workingDirectory} \n`);
  }

  // cat
  if (command === 'cat') {
    const filePath = arg1;
    if (filePath) {
      readAndPrint(workingDirectory, filePath);
    } else {
      process.stdout.write(
        `No file path. Specify argument for file path like cat myfile.txt \n`
      );
    }
  }

  // add
  if (command === 'add') {
    const newFileName = arg1;
    if (newFileName) {
      createNewFile(workingDirectory, newFileName);
    } else {
      process.stdout.write(
        `No new file name. Specify argument for new file name \n`
      );
    }
  }

  // rn - rename
  if (command === 'rn') {
    const pathToFile = arg1;
    const newFileName = arg2;

    if (pathToFile && newFileName) {
      renameFile(pathToFile, newFileName, workingDirectory);
    } else {
      process.stdout.write(
        `Invalid command - should be "rn path_to_file new_filename". Specify both arguments \n`
      );
      process.stdout.write(`You are currently in ${workingDirectory} \n`);
    }
  }

  // cp - copy
  if (command === 'cp') {
    const pathToFile = arg1;
    const pathToNewDirectory = arg2;

    if (pathToFile && pathToNewDirectory) {
      copyFile(pathToFile, pathToNewDirectory, workingDirectory);
    } else {
      process.stdout.write(
        `Invalid command - should be "cp path_to_file path_to_new_directory". Specify both arguments \n`
      );
      process.stdout.write(`You are currently in ${workingDirectory} \n`);
    }
  }

  // mv path_to_file path_to_new_directory
  if (command === 'mv') {
    const pathToFile = arg1;
    const pathToNewDirectory = arg2;

    if (pathToFile && pathToNewDirectory) {
      moveFile(pathToFile, pathToNewDirectory, workingDirectory);
    } else {
      process.stdout.write(
        `Invalid command - should be "mv path_to_file path_to_new_directory". Specify both arguments \n`
      );
      process.stdout.write(`You are currently in ${workingDirectory} \n`);
    }
  }

  // rm - delete file
  if (command == 'rm') {
    const pathToFile = arg1;
    if (pathToFile) {
      deleteFile(pathToFile, workingDirectory);
    } else {
      process.stdout.write(
        `Invalid command - should be "rm path_to_file". Specify argument \n`
      );
      process.stdout.write(`You are currently in ${workingDirectory} \n`);
    }
  }

  // OS Commands
  if (command === 'os' && !OS_ARGUMEMTS.includes(arg1)) {
    process.stdout.write(`Invalid command - ${arg1} is not valid argument \n`);
    process.stdout.write(`Avalable options: ${OS_ARGUMEMTS} \n`);
    process.stdout.write(`You are currently in ${workingDirectory} \n`);
  } else {
    if (command === 'os' && arg1 === '--EOL') {
      process.stdout.write(os.EOL);
      process.stdout.write(`You are currently in ${workingDirectory} \n`);
    }

    if (command === 'os' && arg1 === '--cpus') {
      let cpus = os.cpus();
      cpus = cpus.map((cpu) => ({
        model: cpu.model,
        speed: `${cpu.speed} GHz`,
      }));
      process.stdout.write(`CPUs amount: ${cpus.length}\n`);
      cpus.forEach((cpu, index) => {
        process.stdout.write(`${index + 1}\n`);
        process.stdout.write(`model:${cpu.model}\n`);
        process.stdout.write(`speed:${cpu.speed}\n`);
      });
      process.stdout.write(`You are currently in ${workingDirectory} \n`);
    }

    if (command === 'os' && arg1 === '--homedir') {
      process.stdout.write(os.homedir() + '\n');
      process.stdout.write(`You are currently in ${workingDirectory} \n`);
    }

    if (command === 'os' && arg1 === '--username') {
      process.stdout.write(os.userInfo().username + '\n');
      process.stdout.write(`You are currently in ${workingDirectory} \n`);
    }

    if (command === 'os' && arg1 === '--architecture') {
      process.stdout.write(os.arch() + '\n');
      process.stdout.write(`You are currently in ${workingDirectory} \n`);
    }
  }

  // HASH
  // hash path_to_file
  if (command === 'hash') {
    const pathToFile = arg1;
    if (pathToFile) {
      calculateHash(pathToFile, workingDirectory).then((hash) => {
        process.stdout.write(hash + '\n');
        process.stdout.write(`You are currently in ${workingDirectory} \n`);
      });
    } else {
      process.stdout.write(
        `Invalid command - should be "hash path_to_file". Specify argument \n`
      );
      process.stdout.write(`You are currently in ${workingDirectory} \n`);
    }
  }

  // COMPRESS compress path_to_file path_to_destination
  if (command === 'compress') {
    const pathToFile = arg1;
    const pathToDestination = arg2;

    if (pathToFile && pathToDestination) {
      compress(pathToFile, pathToDestination, workingDirectory).then((res) => {
        if (res?.message) {
          process.stdout.write(`${res.message} \n`);
          process.stdout.write(`You are currently in ${workingDirectory} \n`);
        } else {
          process.stdout.write(`Compressed file ${pathToFile} \n`);
          process.stdout.write(`You are currently in ${workingDirectory} \n`);
        }
      });
    } else {
      process.stdout.write(
        `Invalid command - should be "compress path_to_file path_to_destination". Specify arguments \n`
      );
      process.stdout.write(`You are currently in ${workingDirectory} \n`);
    }
  }

  // DECOMPRESS decompress path_to_file path_to_destination
  if (command === 'decompress') {
    const pathToFile = arg1;
    const pathToDestination = arg2;

    if (pathToFile && pathToDestination) {
      decompress(pathToFile, pathToDestination, workingDirectory).then(
        (res) => {
          if (res?.message) {
            process.stdout.write(`${res.message} \n`);
            process.stdout.write(`You are currently in ${workingDirectory} \n`);
          } else {
            process.stdout.write(`Decompressed file ${pathToFile} \n`);
            process.stdout.write(`You are currently in ${workingDirectory} \n`);
          }
        }
      );
    } else {
      process.stdout.write(
        `Invalid command - should be "decompress path_to_file path_to_destination". Specify arguments \n`
      );
      process.stdout.write(`You are currently in ${workingDirectory} \n`);
    }
  }
});

rl.on('SIGINT', () => {
  rl.close();
});

rl.on('close', () => {
  process.stdout.write(
    `Thank you for using File Manager, ${username}, goodbye!`
  );
  process.exit();
});
