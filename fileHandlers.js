/**
 * Creates new file in specified workingDirectory
 * @param {string} workingDirectory
 * @param {string} fileName
 */

export function createNewFile(workingDirectory, fileName) {
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
 * Rename a file
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
 * Copy file to destination folder
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
 * Move file from one to another specified directory
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
 * Removes file if it exists
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
