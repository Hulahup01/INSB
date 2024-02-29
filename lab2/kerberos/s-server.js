const express = require('express');
const axios = require('axios');
const cors = require('cors');
const nsc = require('./nsc');
const des = require('./des');
const app = express();
const port = 3003;

const key_tgs_ss = '1234567890ABCDEF';
const server_id = 's_server';
let local_key_c_ss = '';

app.use(
    cors({
        origin: 'http://127.0.0.1:5500',
    })
);

app.get('/gettext/:msg' , (req, res) => {
    try{
        const msg = req.params.msg;
        let msgForClient = nsc.binaryToText(des.decrypt(
            nsc.hexToBinary(msg),
            nsc.textToBinary(local_key_c_ss)
        ));
        console.log('====================================================================');
        console.log(`SS: КЛИЕНТ ${msgForClient}`);
        msgForClient = '!НАЧАЛО | ' + msgForClient + ' | КОНЕЦ!';
        console.log(`SS: СЕРВЕР ${msgForClient}`);
        msgForClient = nsc.binaryToHex(des.encrypt(
            nsc.textToBinary(msgForClient),
            nsc.textToBinary(local_key_c_ss)
        ));
        res.status(200).json({msg: msgForClient});
        console.log(`SS: Отправлено!`);
        console.log('====================================================================');
    } catch (error) {
        if (local_key_c_ss === '') {
            res.status(403).json({msg: 'SS: Нет доступа'});
        } else {
            res.status(500).json({msg: 'SS: Ошибка'});
            console.log(`[ERROR]: SS: ${error}`);
        }
    }
});

app.get('/SS/:msg', (req, res) => {
    console.log('====================================================================');
    console.log('================================SS==================================');
    console.log('====================================================================');
    const msg = req.params.msg;
    console.log(`SS: Получено сообщение: ${msg}`);
    let [tgs, aut2] = msg.split(' ');
    tgs = nsc.binaryToText(des.decrypt(
        nsc.hexToBinary(tgs),
        nsc.textToBinary(key_tgs_ss)
    ));
    console.log(`SS: Расшифрованный TGS: ${tgs}`);
    let [id_tgs, server_id_tgs, t_tgs, p_tgs, key_c_ss] = tgs.split(' ');
    if (server_id_tgs != server_id) {
        return res.status(403).json({msg: 'Неверный сервер'});
    }
    aut2 = nsc.binaryToText(des.decrypt(
        nsc.hexToBinary(aut2),
        nsc.textToBinary(key_c_ss)
    ));
    console.log(`SS: Расшифрованный Aut2: ${aut2}`);
    let [id_aut2, t_aut2] = aut2.split(' ');
    if (id_tgs != id_aut2) {
        res.status(404).json({msg: `Клиент не найден`});
    }
    let msgForClient = (parseInt(t_aut2)) + 1;
    console.log(`SS: Сообщение для клиента: ${msgForClient}`);
    msgForClient = nsc.binaryToHex(des.encrypt(
        nsc.textToBinary(msgForClient),
        nsc.textToBinary(key_c_ss)
    ));
    console.log(`SS: Зашифрованное сообщение для клиента: ${msgForClient}`);
    local_key_c_ss = key_c_ss;
    console.log('====================================================================');
    console.log('====================================================================');
    return res.status(200).json({msg: msgForClient});
});

app.listen(port, () => {
    console.log(`Сервер SS запущен на порту: ${port}`);
});