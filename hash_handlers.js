import fs from 'fs';
import path from 'path';
import { createHash } from 'node:crypto';

// hash
/**
 *
 * @param {string} pathToFile
 * @param {string} workingDirectory
 * @returns {Promise<string>}
 */
export async function calculateHash(pathToFile, workingDirectory) {
  const absPathToFile = path.resolve(workingDirectory, pathToFile);
  if (!fs.existsSync(absPathToFile)) {
    console.log('---Such file not found---');
  } else {
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
}
