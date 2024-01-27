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

export function parseCommand(command) {
  return command.trim().replace(/[ ]+/i, ' ').split(' ').slice(0, 2);
}

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
