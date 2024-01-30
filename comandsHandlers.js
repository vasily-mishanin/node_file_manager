import fs from 'fs';
import os from 'os';
import path from 'path';
import { createHash } from 'node:crypto';
import zlib, { gzip } from 'zlib';

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
}

// hash
/**
 *
 * @param {string} pathToFile
 * @param {string} workingDirectory
 * @returns {Promise<string>}
 */
export async function calculateHash(pathToFile, workingDirectory) {
  const absPathToFile = path.resolve(workingDirectory, pathToFile);
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const readableStream = fs.createReadStream(absPathToFile);

    readableStream.on('data', (chunk) => {
      hash.update(chunk);
    });

    readableStream.on('end', () => {
      const hexHash = hash.digest('hex');
      resolve(hexHash);
    });

    readableStream.on('error', (error) => {
      reject(error);
    });
  });
}

//compress
export async function compress(
  pathToFile,
  pathToDestination,
  workingDirectory
) {
  const absPathToFile = path.resolve(workingDirectory, pathToFile);
  const absPathToDestination = path.resolve(
    workingDirectory,
    pathToDestination
  );

  if (
    fs.existsSync(absPathToFile) &&
    fs.existsSync(path.dirname(absPathToDestination))
  ) {
    const zipBrotli = zlib.createBrotliCompress();
    const readStream = fs.createReadStream(absPathToFile);
    const writeStream = fs.createWriteStream(absPathToDestination);
    readStream.pipe(zipBrotli).pipe(writeStream);
  } else {
    return { message: 'Wrong paths' };
  }
}

//decompress
export async function decompress(
  pathToFile,
  pathToDestination,
  workingDirectory
) {
  const absPathToFile = path.resolve(workingDirectory, pathToFile);
  const absPathToDestination = path.resolve(
    workingDirectory,
    pathToDestination
  );

  if (
    fs.existsSync(absPathToFile) &&
    fs.existsSync(path.dirname(absPathToDestination))
  ) {
    const unzipBrotli = zlib.createBrotliDecompress();
    const readStream = fs.createReadStream(absPathToFile);
    const writeStream = fs.createWriteStream(absPathToDestination);
    readStream.pipe(unzipBrotli).pipe(writeStream);
  } else {
    return { message: 'Wrong paths' };
  }
}
