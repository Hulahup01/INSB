const express = require('express');
const axios = require('axios');
const cors = require('cors');
const nsc = require('./nsc');
const des = require('./des');
const app = express();
const port = 3002;

app.use(
    cors({
        origin: 'http://127.0.0.1:5500',
    })
);

const kerberosServer = {
    id: 'kerb_tgs',
    key_as_tgs: 'FEDCBA0987654321',
    key_c_tgs: '1122334455667788',
    key_tgs_ss: '1234567890ABCDEF',
    clients: [
        { 
            id: 'aboba',
            c_key: 'key123client'
        },
        { 
            id: 'daddy',
            c_key: 'sugar7daddy'
        }
    ],
};

function generateRandomKey(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        key += charset[randomIndex];
    }
    return key;
}

app.get('/AS/:id', (req, res) => {
    const id = req.params.id;
    console.log('====================================================================');
    console.log('================================AS==================================');
    console.log('====================================================================');
    console.log(`AS: Проверка на наличие клиента: ${id}`);
    const client = kerberosServer.clients.find(client => client.id === id);
    if (!client) {
        console.log(`AS: Клиент ${id} не найден`);
        return res.status(404).json({msg: `AS: Клиент ${id} не найден`});
    }
    console.log(`AS: Клиент ${client.id} найден`);

    let timestamp = new Date().getTime();
    let TGT = client.id + " " + kerberosServer.id + " " + timestamp + " " + "10000000";
    console.log(`AS: Создание TGT: ${TGT}`);
    TGT = nsc.binaryToHex(des.encrypt(
        nsc.textToBinary(TGT),
        nsc.textToBinary(kerberosServer.key_as_tgs)
    ));
    console.log(`AS: Зашифрованный TGT: ${TGT}`);

    let msgForClient = TGT + " " + kerberosServer.key_c_tgs;
    console.log(`AS: TGT + Kc_tgs: ${msgForClient}`);
    msgForClient = nsc.binaryToHex(des.encrypt(
        nsc.textToBinary(msgForClient),
        nsc.textToBinary(client.c_key)
    ));
    console.log(`AS: Зашифрованное сообщение TGT + Kc_tgs: ${msgForClient}`);
    console.log('====================================================================');
    console.log('====================================================================');
    return res.status(200).json({ msg: msgForClient});
});

app.get('/TGS/:msg', (req, res) => {
    console.log('====================================================================');
    console.log('================================TGS=================================');
    console.log('====================================================================');
    const msg = req.params.msg;
    console.log(`TGS: Получено сообщение: ${msg}`);
    let [tgt, aut1, serverId] = msg.split(' ');
    tgt = nsc.binaryToText(des.decrypt(
        nsc.hexToBinary(tgt),
        nsc.textToBinary(kerberosServer.key_as_tgs)
    ));
    console.log(`TGS: Расшифрованный TGT: ${tgt}`);
    aut1 = nsc.binaryToText(des.decrypt(
        nsc.hexToBinary(aut1),
        nsc.textToBinary(kerberosServer.key_c_tgs)
    ));
    console.log(`TGS: Расшифрованный Aut1: ${aut1}`);
    const [id_tgt, tgs_tgt, t_tgt, p_tgt] = tgt.split(' ');
    const [id_aut1, t_aut1] = aut1.split(' ');

    if (id_tgt != id_aut1) {
        console.log(`TGS: Ошибка аунтификации`);
        return res.status(403).json({msg: `TGS: Ошибка аунтификации`});
    }
    if (tgs_tgt != kerberosServer.id) {
        console.log(`TGS: Неверный TGS`);
        return res.status(403).json({msg: `TGS: Неверный TGS`});
    }
    if (parseInt(t_aut1) - parseInt(t_tgt) > parseInt(p_tgt)) {
        console.log(`TGS: Время действия билета истекло`);
        return res.status(403).json({msg: `TGS: Время действия билета истекло`});
    }

    let timestamp = new Date().getTime();
    let key_c_ss = generateRandomKey(10);
    let tgs = id_tgt + ' ' + serverId + ' ' + timestamp + ' ' + '1000000' + ' ' + key_c_ss;
    console.log(`TGS: Создан TGS: ${tgs}`);
    tgs = nsc.binaryToHex(des.encrypt(
        nsc.textToBinary(tgs),
        nsc.textToBinary(kerberosServer.key_tgs_ss)
    ));   
    console.log(`TGS: Зашифрованный TGS: ${tgs}`);
    let msgForClient = tgs + ' ' + key_c_ss;
    console.log(`TGS: Сообщение TGS + Kc_ss: ${msgForClient}`);
    msgForClient = nsc.binaryToHex(des.encrypt(
        nsc.textToBinary(msgForClient),
        nsc.textToBinary(kerberosServer.key_c_tgs)
    ));
    console.log(`TGS: Зашифрованное ообщение: ${msgForClient}`);
    console.log('====================================================================');
    console.log('====================================================================');
    return res.status(200).json({msg: msgForClient});
});


app.listen(port, () => {
    console.log(`Сервер KERBEROS запущен на порту: ${port}`);
});