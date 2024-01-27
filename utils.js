import os from 'os';
import path from 'path';
import fs from 'fs';

export function getArgValue(arg) {
  const value = arg.split('=')[1];
  return value ? value : null;
}

export function getUserName(args) {
  const userNameArg = args.find((arg) => arg.startsWith('--username='));
  return userNameArg ? getArgValue(userNameArg) : null;
}

/**
 * parseCommand
 * @param {string} command
 * @returns {string} [command, argument]
 */
export function parseCommand(command) {
  const parsedLine = command
    .trim()
    .replace(/[ ]+/i, ' ')
    .split(' ')
    .slice(0, 3);

  return parsedLine;
}

/**
 * getItemType
 * @param {string} workingDirectory
 * @param {string} item
 * @returns {'directory' | 'file' | null}
 */
export function getItemType(workingDirectory, item) {
  const absPath = path.resolve(workingDirectory, item);
  if (fs.existsSync(absPath)) {
    return fs.statSync(absPath).isDirectory() ? 'directory' : 'file';
  }
  return null;
}

export function logTable(items, cols) {
  console.table(items, cols);
}
