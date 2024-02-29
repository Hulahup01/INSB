export default class NumeralSystemConverter {
    static textToBinary(text) {
        const codeUnits = new TextEncoder().encode(text);
        return Array.from(codeUnits).map(codeUnit => codeUnit.toString(2).padStart(8, '0')).join('');
    }

    static binaryToText(binary) {
        const bytes = binary.match(/.{1,8}/g) || [];
        const text = bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
        const decoder = new TextDecoder();
        return decoder.decode(new Uint8Array(bytes.map(byte => parseInt(byte, 2))));
    }

    static binaryToHex(binary) {
        while (binary.length % 4 !== 0) {
            binary = '0' + binary;
        }
        const groups = binary.match(/.{4}/g);
        const hexString = groups.map(group => parseInt(group, 2).toString(16)).join('');
        return hexString.toUpperCase();
    }

    static hexToBinary(hexString) {
        const binaryString = hexString.split('').map(hexChar => {
            const decimalValue = parseInt(hexChar, 16);
            const binaryValue = decimalValue.toString(2).padStart(4, '0');
            return binaryValue;
        }).join('');
        return binaryString;
    }
}
