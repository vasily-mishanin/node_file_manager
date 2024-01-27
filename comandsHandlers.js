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

/**
 * Creates new file in specified workingDirectory
 * @param {string} workingDirectory
 * @param {string} fileName
 */

export function creaTeNewFile(workingDirectory, fileName) {
  const absPath = path.resolve(workingDirectory, fileName);
  if (fs.existsSync(workingDirectory) && !fs.existsSync(absPath)) {
    fs.writeFile(absPath, '', () => {
      process.stdout.write(`New file - ${fileName} - successfully created \n`);
      process.stdout.write(`You are currently in ${workingDirectory} \n`);
    });
  } else {
    throw Error(`FS operation failed - file path ${absPath} ALREADY EXISTS`);
  }
}

/**
 *
 * @param {string} pathToFile
 * @param {string} newFileName
 * @param {string} workingDirectory
 */

export function renameFile(pathToFile, newFileName, workingDirectory) {
  const oldPath = path.resolve(workingDirectory, pathToFile);
  const newPath = path.resolve(workingDirectory, newFileName);

  if (!fs.existsSync(oldPath)) {
    throw new Error(`FS operation failed - ${oldPath} NOT EXISTS`);
  } else if (fs.existsSync(newPath)) {
    throw new Error(`FS operation failed - ${newPath} ALREADY EXISTS`);
  } else {
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        console.error('Error renaming file:', err);
      } else {
        process.stdout.write('----File renamed successfully--- \n');
        process.stdout.write(`You are currently in ${workingDirectory} \n`);
      }
    });
  }
}

/**
 *
 * @param {string} pathToFile
 * @param {string} pathToNewDirectory
 * @param {string} workingDirectory
 */
export function copyFile(pathToFile, pathToNewDirectory, workingDirectory) {
  const existingFilePath = path.resolve(workingDirectory, pathToFile);
  const copyFileDirectoryPath = path.resolve(
    workingDirectory,
    pathToNewDirectory
  );
  const filename = path.basename(existingFilePath);

  if (
    !fs.existsSync(existingFilePath) ||
    !fs.existsSync(copyFileDirectoryPath)
  ) {
    process.stdout.write(`FS operation failed - path/paths NOT EXISTS \n`);
    process.stdout.write(`You are currently in ${workingDirectory} \n`);
    return;
  } else if (fs.existsSync(path.join(copyFileDirectoryPath, filename))) {
    process.stdout.write(
      `FS operation failed - file ${filename} ALREADY EXISTS in ${copyFileDirectoryPath} \n`
    );
    process.stdout.write(`You are currently in ${workingDirectory} \n`);
    return;
  }

  if (
    fs.statSync(existingFilePath).isDirectory() ||
    !fs.statSync(copyFileDirectoryPath).isDirectory()
  ) {
    process.stdout.write(
      `FS operation failed - INVALID ARGUMENTS (should be "cp path_to_file path_to_new_directory") \n`
    );
    process.stdout.write(`You are currently in ${workingDirectory} \n`);
    return;
  } else {
    const readStream = fs.createReadStream(existingFilePath);
    const writeStream = fs.createWriteStream(
      path.join(copyFileDirectoryPath, filename)
    );
    readStream.pipe(writeStream);
    writeStream.on('finish', () => {
      process.stdout.write(`File copy completed \n`);
      process.stdout.write(`You are currently in ${workingDirectory} \n`);
    });
    writeStream.on('error', (err) => {
      process.stdout.write(`ERROR WHEN COPY`, err);
    });
  }
}

/**
 *
 * @param {string} pathToFile
 * @param {string} pathToNewDirectory
 * @param {string} workingDirectory
 * @returns
 */
export function moveFile(pathToFile, pathToNewDirectory, workingDirectory) {
  const existingFilePath = path.resolve(workingDirectory, pathToFile);
  const copyFileDirectoryPath = path.resolve(
    workingDirectory,
    pathToNewDirectory
  );
  const filename = path.basename(existingFilePath);

  if (
    !fs.existsSync(existingFilePath) ||
    !fs.existsSync(copyFileDirectoryPath)
  ) {
    process.stdout.write(`FS operation failed - path/paths NOT EXISTS \n`);
    process.stdout.write(`You are currently in ${workingDirectory} \n`);
    return;
  } else if (fs.existsSync(path.join(copyFileDirectoryPath, filename))) {
    process.stdout.write(
      `FS operation failed - file ${filename} ALREADY EXISTS in ${copyFileDirectoryPath} \n`
    );
    process.stdout.write(`You are currently in ${workingDirectory} \n`);
    return;
  }

  if (
    fs.statSync(existingFilePath).isDirectory() ||
    !fs.statSync(copyFileDirectoryPath).isDirectory()
  ) {
    process.stdout.write(
      `FS operation failed - INVALID ARGUMENTS (should be "cp path_to_file path_to_new_directory") \n`
    );
    process.stdout.write(`You are currently in ${workingDirectory} \n`);
    return;
  } else {
    const readStream = fs.createReadStream(existingFilePath);
    const writeStream = fs.createWriteStream(
      path.join(copyFileDirectoryPath, filename)
    );
    readStream.pipe(writeStream);

    writeStream.on('finish', () => {
      fs.unlink(existingFilePath, (err) => {
        if (err) {
          console.log(`Error while unlinking file ${filename}`, err);
          throw err;
        }
        process.stdout.write(`File copy completed \n`);
        process.stdout.write(`You are currently in ${workingDirectory} \n`);
      });
    });

    writeStream.on('error', (err) => {
      process.stdout.write(`ERROR WHEN COPY`, err);
    });
  }
}

/**
 *
 * @param {string} pathToFile
 * @param {string} workingDirectory
 * @param {boolean} partOfMoveOperation
 * @returns
 */
export function deleteFile(pathToFile, workingDirectory) {
  const existingFilePath = path.resolve(workingDirectory, pathToFile);
  const filename = path.basename(existingFilePath);

  if (!fs.existsSync(existingFilePath)) {
    process.stdout.write(
      `Unable to delete file - ${existingFilePath} - NOT EXISTS \n`
    );
    process.stdout.write(`You are currently in ${workingDirectory} \n`);
    return;
  } else if (fs.statSync(existingFilePath).isDirectory()) {
    process.stdout.write(
      `Unable to delete file - ${existingFilePath} - IS DIRECTORY \n`
    );
    process.stdout.write(`You are currently in ${workingDirectory} \n`);
    return;
  }

  fs.unlink(existingFilePath, (err) => {
    if (err) {
      console.log(`Error while unlinking file ${filename}`, err);
      throw err;
    }
    process.stdout.write(`File ${filename} deleted \n`);
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
