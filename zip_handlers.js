import fs from 'fs';
import path from 'path';
import zlib, { gzip } from 'zlib';

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

  console.log(absPathToFile, absPathToDestination);

  if (
    fs.existsSync(absPathToFile) &&
    fs.existsSync(path.dirname(absPathToDestination))
  ) {
    const zipBrotli = zlib.createBrotliCompress();
    const readStream = fs.createReadStream(absPathToFile);
    const writeStream = fs.createWriteStream(absPathToDestination);
    readStream.pipe(zipBrotli).pipe(writeStream);

    writeStream.on('finish', () => {
      console.log('Compress completed successfully.');
    });

    writeStream.on('error', (err) => {
      console.error('Error in Compress ---> add filename:', err);
    });
  } else {
    return { message: '---Wrong path---' };
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
    writeStream.on('finish', () => {
      console.log('Decompress completed successfully.');
    });

    writeStream.on('error', (err) => {
      console.error('Error in Decompress ---> add filename:', err);
    });
  } else {
    return { message: '---Wrong paths---' };
  }
}
