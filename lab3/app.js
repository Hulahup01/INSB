import {Client, HackerClient} from './network/client.js'
import {Connection} from './network/connection.js';
import {FakeIpAddressMiddleware, RSTMiddleware} from './network/middleware.js';


function runAttacks() {
    const client = new Client("192.168.100.200", 8080);
    const server = new Client("10.20.30.40", 5050);
    const hackerServer = new HackerClient("1.1.1.1", 1111);

    const fakeIpAddressAttack = new FakeIpAddressMiddleware("1.1.1.1", 1111);
    const rstAttack = new RSTMiddleware();
    
    const connection = new Connection([client, server, hackerServer], [fakeIpAddressAttack]);

    client.call(connection, 1);
}

runAttacks();

