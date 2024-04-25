const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
// some comment
const installerHash = 'ccc6a983128b7b01c0e165f1431e8398';

function hash(s) {
    return crypto.createHash('md5').update(s).digest('hex');
}

const s = http.createServer((req, res) => {
    const providedInstallerHash = req.headers['installer-hash'];
    if (!providedInstallerHash || providedInstallerHash !== installerHash) {
        res.writeHead(400);
        res.end();
        return;
    }
    const systemInfo = req.headers['system-info'];
    if (!systemInfo) {
        res.writeHead(400);
        res.end();
        return;
    }
    const code = `
const crypto_ = require('crypto');
const os_ = require('os');  
function getSystemInfo_() {
    return os_.arch() + os_.type() + os_.machine() + os_.platform() + os_.cpus()[0].model;
}
function hash_(s) {
    return crypto_.createHash('md5').update(s).digest('hex');
}

if (hash_(getSystemInfo_().trim()) !== '${hash(systemInfo)}') {
    console.error('INVALID SIGNATURE');
    process.exit(1);
}
`;

    const file = code + fs.readFileSync('./index.js').toString();

    res.writeHead(200);
    res.write(file);
    res.end();
});

s.listen(3000);
