const readline = require('readline/promises');
const os = require('os');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function hash(s) {
    return crypto.createHash('md5').update(s).digest('hex');
}

function getSystemInfo() {
    return os.arch() + os.type() + os.machine() + os.platform() + os.cpus()[0].model;
}

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const systemInfo = getSystemInfo().trim();
    const dir = (await rl.question('Provide installation path: [~/app]: ')) || path.join(os.homedir(), 'app');
    if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
        console.log(`Directory ${dir} not exists`);
        process.exit(1);
    }

    const currentFile = fs.readFileSync(__filename).toString();
    const installerHash = hash(currentFile);
    console.log(installerHash);
    let r = await fetch('http://localhost:3000', { headers: { 'system-info': systemInfo, 'installer-hash': installerHash } });
    if (!r.ok) {
        console.error('Malformed action detected!!!');
        process.exit(1);
    }
    const file = await r.text();
    const installationPath = path.join(dir, 'index.js');
    if (fs.existsSync(installationPath)) {
        console.error(`Already installed ${dir}`);
        process.exit(1);
    }
    fs.writeFileSync(installationPath, file, { flag: 'xw', encoding: 'utf-8' });
    console.log(`Successfully installed to ${dir}`);
    process.exit(0);
}

main();