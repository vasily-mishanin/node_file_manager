import { getUserName } from './utils.js';
//console.log(process.argv);

console.log(
  `Welcome to the File Manager, ${getUserName(process.argv.slice(2))}!`
);
