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

function getFolderUsage(path = "/") {
    try {
        // Show top 10 biggest directories at root
        return execSync(
            `du -h --max-depth=1 ${path} | sort -hr | head -10`,
            { encoding: "utf8" }
        );
    } catch (err) {
        return `Error retrieving folder usage for ${path}`;
    }
}

export function logServerInfo() {
    console.log("================== Server Configuration ==================");
    console.log(`Hostname       : ${os.hostname()}`);
    console.log(`Platform       : ${os.platform()}`);
    console.log(`Architecture   : ${os.arch()}`);
    console.log(`CPU Cores      : ${os.cpus().length}`);
    console.log(`CPU Model      : ${os.cpus()[0].model}`);
    console.log(
        `Total Memory   : ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`
    );
    console.log(
        `Free Memory    : ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`
    );
    console.log(`Uptime         : ${Math.floor(os.uptime() / 60)} minutes`);
    console.log(`Node.js Version: ${process.version}`);
    console.log(`User           : ${os.userInfo().username}`);
    console.log("----------------------------------------------------------");
    console.log("Disk Usage:");
    console.log(getDiskUsage());
    console.log("----------------------------------------------------------");
    console.log("Top Folders by Disk Usage (/):");
    console.log(getFolderUsage("/"));
    console.log("----------------------------------------------------------");
    console.log("Environment Variables (selected):");
    console.log(`NODE_ENV       : ${process.env.NODE_ENV || "N/A"}`);
    console.log(`PORT           : ${process.env.PORT || "N/A"}`);
    console.log(`HOME           : ${process.env.HOME || "N/A"}`);
    console.log(`SHELL          : ${process.env.SHELL || "N/A"}`);
    console.log("----------------------------------------------------------");
    console.log("Network Interfaces:");
    console.log(os.networkInterfaces());
    console.log("==========================================================");

    return {
        hostname: os.hostname(),
        platform: os.platform(),
        architecture: os.arch(),
        cpu: {
            cores: os.cpus().length,
            model: os.cpus()[0].model,
        },
        memory: {
            total: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
            free: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        },
        uptimeMinutes: Math.floor(os.uptime() / 60),
        nodeVersion: process.version,
        user: os.userInfo().username,
        diskUsage: getDiskUsage(),
        folderUsage: getFolderUsage("/"), // 🔥 added folder usage here
        env: {
            NODE_ENV: process.env.NODE_ENV || "N/A",
            PORT: process.env.PORT || "N/A",
            HOME: process.env.HOME || "N/A",
            SHELL: process.env.SHELL || "N/A",
        },
        networkInterfaces: os.networkInterfaces(),
    };
}