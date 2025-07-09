import os from 'os';
import process from 'process';
import { execSync } from 'child_process';

function getDiskUsage() {
  try {
    const stdout = execSync('df -h /', { encoding: 'utf8' });
    return stdout;
  } catch (err) {
    return 'Could not retrieve disk usage';
  }
}

export function logServerInfo() {
  console.log('================== Server Configuration ==================');
  console.log(`Hostname       : ${os.hostname()}`);
  console.log(`Platform       : ${os.platform()}`);
  console.log(`Architecture   : ${os.arch()}`);
  console.log(`CPU Cores      : ${os.cpus().length}`);
  console.log(`CPU Model      : ${os.cpus()[0].model}`);
  console.log(`Total Memory   : ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`Free Memory    : ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`Uptime         : ${Math.floor(os.uptime() / 60)} minutes`);
  console.log(`Node.js Version: ${process.version}`);
  console.log(`User           : ${os.userInfo().username}`);
  console.log('----------------------------------------------------------');
  console.log('Disk Usage:');
  console.log(getDiskUsage());
  console.log('----------------------------------------------------------');
  console.log('Environment Variables (selected):');
  console.log(`NODE_ENV       : ${process.env.NODE_ENV || 'N/A'}`);
  console.log(`PORT           : ${process.env.PORT || 'N/A'}`);
  console.log(`HOME           : ${process.env.HOME || 'N/A'}`);
  console.log(`SHELL          : ${process.env.SHELL || 'N/A'}`);
  console.log('----------------------------------------------------------');
  console.log('Network Interfaces:');
  console.log(os.networkInterfaces());
  console.log('==========================================================');
}
