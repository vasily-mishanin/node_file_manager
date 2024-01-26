export function getArgValue(arg) {
  const value = arg.split('=')[1];
  return value ? value : null;
}

export function getUserName(args) {
  const userNameArg = args.find((arg) => arg.startsWith('--username='));
  return userNameArg ? getArgValue(userNameArg) : null;
}
