import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  logTable,
  getArgValue,
  getUserName,
  getItemType,
  parseCommand,
} from './utils.js';

// UP
export function goUp(currentPath) {
  if (currentPath === os.homedir()) {
    return;
  }

  return path.dirname(currentPath);
}

// CD
export function changeDir(workingDirectory, newPath) {
  const newAbsolutePath = path.resolve(workingDirectory, newPath);

  if (
    fs.existsSync(newAbsolutePath) &&
    fs.statSync(newAbsolutePath).isDirectory()
  ) {
    return newAbsolutePath;
  } else {
    console.log('---Directory not found---');
    return null;
  }
}

// ls
export function listDirItems(workingDirectory) {
  const files = fs.readdirSync(workingDirectory);
  const processedItems = files
    .map((item) => ({
      name: item,
      type: getItemType(workingDirectory, item),
    }))
    .sort((a, b) => (a.type === 'file' ? 1 : -1))
    .map((item, index) => ({ ...item, index }));

  logTable(processedItems, ['name', 'type']);
}

// cat
/**
 * cat - readAndPrint file content
 * @param {string} filePath
 *
 */

export function readAndPrint(workingDirectory, filePath) {
  const absPath = path.resolve(workingDirectory, filePath);
  const readStream = fs.createReadStream(absPath);
  readStream.on('data', (chunk) => {
    process.stdout.write(chunk + '\n');
  });

  readStream.on('end', () => {
    process.stdout.write(`\n ----------------- END ----------------- \n`);
    process.stdout.write(`You are currently in ${workingDirectory} \n`);
  });

  // if (!fs.existsSync(fileToReadPath)) {
  //   throw new Error(`FS operation failed - ${fileToReadPath} NOT EXISTS`);
  // } else {
  //   readAndPrintFile(fileToReadPath);
  // }
}
