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

export function copyFile(pathToFile, pathToNewDirectory, workingDirectory) {
  const existingFilePath = path.resolve(workingDirectory, pathToFile);
  const copyFileDirectoryPath = path.resolve(
    workingDirectory,
    pathToNewDirectory
  );
  const filename = path.basename(existingFilePath);

  if (!fs.existsSync(existingFilePath)) {
    throw new Error(`FS operation failed - ${existingFilePath} NOT EXISTS`);
  } else if (fs.existsSync(path.join(copyFileDirectoryPath, filename))) {
    throw new Error(
      `FS operation failed - file ${filename} ALREADY EXISTS in ${copyFileDirectoryPath} `
    );
  }

  if (
    fs.statSync(existingFilePath).isDirectory() ||
    !fs.statSync(copyFileDirectoryPath).isDirectory()
  ) {
    throw new Error(
      `FS operation failed - INVALID ARGUMENTS (should be "cp path_to_file path_to_new_directory")`
    );
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
