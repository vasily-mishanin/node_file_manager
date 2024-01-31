import { COMMANDS, OS_ARGUMEMTS, colors } from './constants.js';
import { calculateHash } from './hash_handlers.js';
import { changeDir, goUp, listDirItems, readAndPrint } from './nav_handlers.js';
import { getUserName, parseCommand } from './utils.js';
import { compress, decompress } from './zip_handlers.js';

import {
  copyFile,
  createNewFile,
  deleteFile,
  moveFile,
  renameFile,
} from './fs_handlers.js';

import * as readline from 'node:readline/promises';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const username = getUserName(process.argv.slice(2));

const ROOT_DIR = os.homedir();
let workingDirectory = ROOT_DIR;

// START
console.log(colors.cyan, `Welcome to the File Manager, ${username}!`);
console.log(colors.yellow, `You are currently in ${workingDirectory}`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('line', (line) => {
  const [command, arg1, arg2] = parseCommand(line);

  if (!COMMANDS.includes(command)) {
    console.log(colors.red, `Uknown command: ${command}`);
    console.log(colors.cyan, `Avalable commands: ${COMMANDS}`);
    console.log(colors.yellow, `You are currently in ${workingDirectory}`);
  }

  // Exit
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
      calculateHash(pathToFile, workingDirectory)
        .then((hash) => {
          if (hash?.length) {
            process.stdout.write(hash + '\n');
          }
          process.stdout.write(`You are currently in ${workingDirectory} \n`);
        })
        .catch((err) => console.log(err));
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
    console.log(pathToFile, pathToDestination);

    if (pathToFile && pathToDestination) {
      compress(pathToFile, pathToDestination, workingDirectory).then((res) => {
        if (res?.message) {
          process.stdout.write(`${res.message} \n`);
          process.stdout.write(`You are currently in ${workingDirectory} \n`);
        } else {
          process.stdout.write(
            `Compressed file ${pathToFile} into ${pathToDestination} \n`
          );
          process.stdout.write(`You are currently in ${workingDirectory} \n`);
        }
      });
    } else {
      process.stdout.write(
        `Invalid command - should be "compress path_to_file path_to_destination". Specify full paths \n`
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
            process.stdout.write(
              `Decompressed file ${pathToFile} into ${pathToDestination} \n`
            );
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
