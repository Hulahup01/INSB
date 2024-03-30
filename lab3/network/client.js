import {IP} from "./ip.js"
import {TCP} from "./tcp.js"

export class Client {
    constructor(ip_address, tcp_port) {
        this.ip_address = ip_address;
        this.tcp_port = tcp_port;
        this.caller = false;
    }

    call(connection, index) {
        this.caller = true;
        const other = connection.endpoints[index];
        const packageParam = this._build_package(other, this._generate_payload());
        connection.send(packageParam);
    }

    _build_package(receiver, payload) {
        const ip = new IP(this.ip_address, receiver.ip_address, payload);
        const tcp = new TCP(this.tcp_port, receiver.tcp_port, ip);

        tcp.sn = 34;
        tcp.syn = true;

        return tcp;
    }

    _build_answer(packageParam, payload) {
        const ip = new IP(packageParam.ip.destination_ip, packageParam.ip.source_ip, payload);
        const response = new TCP(packageParam.destination_port, packageParam.source_port, ip);

        if (packageParam.syn && packageParam.ack) {
            response.sn = packageParam.ack_sn;
            response.ack_sn = packageParam.sn + 1;
            response.ack = true;
            return response;
        }

        if (packageParam.syn && !packageParam.ack) {
            response.sn = 680;
            response.ack_sn = packageParam.sn + 1;
            response.syn = true;
            response.ack = true;
            return response;
        }

        if (packageParam.ack) {
            response.sn = packageParam.ack_sn;
            response.ack_sn += payload.length;
            response.ip.payload = "Connection acknowledged";
            return response;
        }

        response.ip.payload = payload;

        if (this.caller) {
            response.sn = packageParam.ack_sn;
            response.ack_sn = packageParam.sn + payload.length;
        } else {
            response.sn = packageParam.ack_sn;
            response.ack_sn = packageParam.sn;
        }

        return response;
    }

    _generate_payload() {
        return ``;
    }

    receive(packageParam) {
        return this._build_answer(packageParam, this._generate_payload());
    }
}

export class HackerClient extends Client {
    constructor(ipAddress, tcpPort) {
        super(ipAddress, tcpPort)
        this.caller = false;
    }

    receive(packageParam) {
        return this._build_answer(packageParam, "Fake IP. Spuffing attack done.")
    }
}