const getEncryptedFile = document.getElementById('getEncryptedFile');
const getDecryptedFile = document.getElementById('getDecryptedFile');
const keyInput = document.getElementById('keyInput');
const fileInput = document.getElementById('fileInput');
const languageSelect = document.getElementById('languageSelect');


const ALPHABETS = new Map();
const VIGINER_SQUARES = new Map();
const LANGUAGE_REGEX = new Map();
const LETTER_REGEX = /^[A-Za-zА-Яа-яЁё]$/;
const DIGITS_REGEX = /^\d+$/;

ALPHABETS.set('en', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
ALPHABETS.set('ru', 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ');
LANGUAGE_REGEX.set('en', /^[A-Za-z]+$/);
LANGUAGE_REGEX.set('ru', /^[А-Яа-яЁё]+$/);


function generateSquares() {
    for (let [key, value] of ALPHABETS) {
        let square = [];
        for (let i = 0; i < value.length; i++) {
            let row = value.slice(i);
            row += value.slice(0, i);
            square.push(row);
        }
        VIGINER_SQUARES.set(key, square);
    }
}

generateSquares();


function repeatString(firstString, secondString, langRegex) {
    let resultString = "";
    let firstStringLength = firstString.length;
    let it = 0;
    for (let i = 0; i < secondString.length; i++) {
        let currentChar = secondString[i];
        if (langRegex.test(currentChar)) {
            resultString += firstString[it];
            it = (it + 1) % firstStringLength;
        }else{
            resultString += currentChar;
        }
    }
    return resultString;
}


function encryptText(text, key, viginerSquare, langRegex) { 
    let encryptedText = ''; 
    let newKey = repeatString(key, text, langRegex);

    for (let it = 0; it < text.length; it++) {
        let i = viginerSquare[0].indexOf(text[it].toUpperCase());
        let j = viginerSquare[0].indexOf(newKey[it]);
        
        if(i === -1 || j === -1)
            encryptedText += text[it];
        else {
            encryptedText += 
                (text[it] === text[it].toUpperCase()) ? 
                viginerSquare[i][j] :
                viginerSquare[i][j].toLowerCase();
        }
    }

    return encryptedText;
}


function decryptText(text, key, viginerSquare, langRegex) {
    let decryptedText = ''; 
    let newKey = repeatString(key, text, langRegex);

    for (let it = 0; it < text.length; it++) {
        let i = viginerSquare[0].indexOf(newKey[it]);
        if(i === -1)
            decryptedText += text[it];
        else {
            let j = viginerSquare[i].indexOf(text[it].toUpperCase());
            decryptedText += 
                (text[it] === text[it].toUpperCase()) ? 
                viginerSquare[0][j] :
                viginerSquare[0][j].toLowerCase();
        }
    }
    return decryptedText;
}


function readFile(event) {
    let action = event.target.id;
    const file = fileInput.files[0];
    if (!file) {
      alert('Please choose the file');
      return;
    }
    
    const reader = new FileReader();

    reader.onload = function(event) {
        const text = event.target.result;
        const language = languageSelect.value;
        let key = keyInput.value.toUpperCase();

        const onlyLetters = LANGUAGE_REGEX.get(language).test(key);
        const onlyDigits = DIGITS_REGEX.test(key);
        if (!onlyLetters && !onlyDigits) {
            alert('Error: The value must contain either only letters of selected alphabet or only numbers');
            return;
        }

        if(onlyDigits)
            key = VIGINER_SQUARES.get(language)[0][key];

        let result = (action === 'getEncryptedFile') ? 
            encryptText(text, key, VIGINER_SQUARES.get(language), LANGUAGE_REGEX.get(language)) : 
            decryptText(text, key, VIGINER_SQUARES.get(language), LANGUAGE_REGEX.get(language));

        console.log(result);
        (action === 'getEncryptedFile') ?
        saveFile(file.name.replace(/\.[^/.]+$/, '_encrypted.txt'), result) :
        saveFile(file.name.replace(/\.[^/.]+$/, '_decrypted.txt'), result);
    };

    reader.onerror = function(event) {
        alert(event.target.text);
    };
    
    reader.readAsText(file);
}

function saveFile(fileName, text) {
    const blob = new Blob([text], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
}


getEncryptedFile.addEventListener('click', readFile);
getDecryptedFile.addEventListener('click', readFile);