import NumeralSystemConverter from "./nsc.js";
import DES from "./des.js";
const sendBtn = document.getElementById('sendBtn');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');
const textArea = document.querySelector('.tech-info');
const responseInput = document.getElementById('response');
const nsc = NumeralSystemConverter;
const des = DES;

const user = {
    id: 'aboba',
    key : 'key123client',
    ss_id : 's_server',
    local_key_c_ss: '',

    startProtocol: async function (logfunc=console.log) {
        try {
            // AS ================================
            let response = await fetch(`http://localhost:3002/AS/${user.id}`, {
                method: 'GET',
            });
            let data = await response.json();
            if (!response.ok){
                throw data.msg;
            }

            let as_msg = data.msg;
            logfunc(`Получено сообщение(зашифрованное) от AS: ${as_msg}`);
            as_msg = nsc.binaryToText(des.decrypt(
                nsc.hexToBinary(as_msg),
                nsc.textToBinary(user.key)
            ));
            logfunc(`Расшифрованное сообщение: ${as_msg}`);
            const [tgt, key_c_tgs] = as_msg.split(' ');
            logfunc(`Kc_tgs: ${key_c_tgs}`);
            logfunc(`TGT: ${tgt}`);

            let timestamp = new Date().getTime();
            let aut1 = user.id + " " + timestamp;
            logfunc(`Аутентификационный блок Aut1 (id + timestamp): ${aut1}`);
            aut1 = nsc.binaryToHex(des.encrypt(
                nsc.textToBinary(aut1),
                nsc.textToBinary(key_c_tgs)
            ));
            logfunc(`Зашифрованный аутентификационный блок Aut1: ${aut1}`);
            let msgForTGS = tgt + " " + aut1 + " " + user.ss_id;
            logfunc(`Сообщениие для сервера TGS: ${msgForTGS}`)

            // TGS ===============================
            response = await fetch(`http://localhost:3002/TGS/${msgForTGS}`, {
                method: 'GET',
            });
            data = await response.json();
            if (!response.ok){
                throw data.msg;
            }
            let tgs_msg = data.msg
            logfunc(`Получено сообщение(зашифрованное) от TGS: ${tgs_msg}`);
            tgs_msg = nsc.binaryToText(des.decrypt(
                nsc.hexToBinary(tgs_msg),
                nsc.textToBinary(key_c_tgs)
            ));
            logfunc(`Расшифрованное сообщение от TGS: ${tgs_msg}`);
            const [tgs, key_c_ss] = tgs_msg.split(' ');

            timestamp = new Date().getTime();
            let aut2 = user.id + ' ' + timestamp;
            logfunc(`Aутентификационный блок Aut2 (id + timestamp): ${aut2}`);
            aut2 = nsc.binaryToHex(des.encrypt(
                nsc.textToBinary(aut2),
                nsc.textToBinary(key_c_ss)
            ));
            logfunc(`Зашифрованный аутентификационный блок Aut2: ${aut2}`);
            let msgForSS = tgs + ' ' + aut2;
            logfunc(`Сообщениие для сервера SS: ${msgForSS}`);


            // SS ==============================
            response = await fetch(`http://localhost:3003/SS/${msgForSS}`, {
                method: 'GET',
            });
            data = await response.json();
            if (!response.ok){
                throw data.msg;
            }
            let ss_msg = data.msg
            logfunc(`Получено сообщение(зашифрованное) от SS: ${ss_msg}`);
            ss_msg = nsc.binaryToText(des.decrypt(
                nsc.hexToBinary(ss_msg),
                nsc.textToBinary(key_c_ss)
            ));
            logfunc(`Расшифрованное сообщение от SS: ${ss_msg}`);

            if ((parseInt(ss_msg) - 1) != parseInt(timestamp)) {
                throw 'Сервер не доказал свою подлинность!'
            }
            logfunc('Подлючено! Сервер доказал подлинность!');
            user.local_key_c_ss = key_c_ss;
        } catch (error) {
            logfunc(`[ERROR]: ${error}`);
        }
    },

};

async function getTextFromServer(text, logfunc=console.log) {
    try{
        text = nsc.binaryToHex(des.encrypt(
            nsc.textToBinary(text),
            nsc.textToBinary(user.local_key_c_ss)
        ));
        let response = await fetch(`http://localhost:3003/gettext/${text}`, {
        method: 'GET',
        });
        let data = await response.json();
        if (!response.ok){
            throw data.msg;
        }
        let result = nsc.binaryToText(des.decrypt(
            nsc.hexToBinary(data.msg),
            nsc.textToBinary(user.local_key_c_ss)
        ));
        result = result.replace(/\u0000/g, '');
        return result;
    } catch (error) {
        if (user.local_key_c_ss === '') {
            return `not connected?`;
        }
        logfunc(error);
    }
    
}

async function connectToServer() {
    user.id = usernameInput.value;
    await user.startProtocol(arealog);
}

async function sendMessage(logfunc=console.log) {
    let text = messageInput.value;
    try {
        const result = await getTextFromServer(text, arealog);
        responseInput.value = result;
    } catch (error) {
        logfunc(error);
    }
}

function arealog(text) {
    textArea.value += '[>]' + text + '\n';
}

connectBtn.addEventListener('click', connectToServer);
sendBtn.addEventListener('click', sendMessage);
disconnectBtn.addEventListener('click', () => {user.local_key_c_ss = ''});