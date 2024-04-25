const fs = require('node:fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function obfuscateVariables(code) {
    const variableRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;

    let obfuscatedCode = code;
    let variableCounter = 0;

    obfuscatedCode = obfuscatedCode.replace(variableRegex, match => {
        const obfuscatedName = `_0x${(variableCounter++).toString(16)}`;
  
        return obfuscatedName;
    });

    return obfuscatedCode;
}
const jso = require('javascript-obfuscator');
function formattingConversions(data) {
    return jso.obfuscate(data, {
        compact: false,
        controlFlowFlattening: false,
        controlFlowFlatteningThreshold: 0,
        numbersToExpressions: false,
        simplify: true,
        sourceMapMode: 'inline',
        stringArrayWrappersChainedCalls: false,
        identifierNamesGenerator:'hexadecimal',
        deadCodeInjection: false,
        deadCodeInjectionThreshold: 0,
        renameProperties: false,
        renameVariables: false,
        stringArrayShuffle: false,
        splitStrings: false,
        stringArray: false,
        stringArrayThreshold: 0
    });
}

function obfuscateAndAddDeadCode(code, deadCode) {
    function obfuscateVariables(code) {
        const variableRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;

        let obfuscatedCode = code;
        let variableCounter = 0;

        obfuscatedCode = obfuscatedCode.replace(variableRegex, match => {
            const obfuscatedName = `_0x${(variableCounter++).toString(16)}`;
            return obfuscatedName;
        });

        return obfuscatedCode;
    }

    function addDeadCode(code, deadCode) {
        return deadCode + '\n' + code;
    }

    const obfuscatedCode = obfuscateVariables(code);

    const codeWithDeadCode = addDeadCode(obfuscatedCode, deadCode);

    return codeWithDeadCode;
}


function transformationsOfDataStructures(data) {
    return jso.obfuscate(data, {
        compact: false,
        controlFlowFlattening: false,
        controlFlowFlatteningThreshold: 0,
        numbersToExpressions: false,
        simplify: true,
        sourceMapMode: 'inline',
        stringArrayWrappersChainedCalls: false,
        identifierNamesGenerator:'hexadecimal',
        deadCodeInjection: false,
        deadCodeInjectionThreshold: 0,
        renameProperties: false,
        renameVariables: false,
        stringArrayShuffle: false,
        splitStrings: false,
        stringArray: true,
        stringArrayThreshold: 1
    });
}

function compressFile(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка при чтении файла:', err);
            return;
        }
        const compressedData = data.replace(/(\/\*[\s\S]*?\*\/|\/\/.*)|\s/g, '');

        const compressedFilePath = filePath.replace('.js', '_compressed.js');
    });
}

function controlFlowTransformations(data) {
    return jso.obfuscate(data, {
        compact: false,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.5,
        numbersToExpressions: false,
        simplify: true,
        sourceMapMode: 'inline',
        stringArrayWrappersChainedCalls: false,
        identifierNamesGenerator:'hexadecimal',
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 1,
        renameProperties: false,
        renameVariables: false,
        stringArrayShuffle: false,
        splitStrings: false,
        stringArray: true,
        stringArrayThreshold: 1
    });
}

rl.question('Enter the path to the file for obfuscation: ', (filePath) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('File reading error:', err);
            rl.close();
            return;
        }

        //const obfuscationResult = formattingConversions(data);
        //const obfuscationResult = transformationsOfDataStructures(data);
        const obfuscationResult = controlFlowTransformations(data);

        const obfuscatedFilePath = filePath.replace(/\.js$/, '_obfuscated.js');
        fs.writeFile(obfuscatedFilePath, obfuscationResult.getObfuscatedCode(), (err) => {
            if (err) {
                console.error('Error writing an obfuscated file:', err);
                rl.close();
                return;
            }
            console.log('The file has been successfully obfuscated and saved as', obfuscatedFilePath);
            rl.close();
        });
    });
});
