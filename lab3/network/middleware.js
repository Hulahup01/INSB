export class RSTMiddleware {
    constructor() {
        this.call_number = 0;
    }

    change(packageParam) {
        this.call_number++;
        if (this.call_number === 5) {
            packageParam.rst = true;
        }
        return packageParam;
    }
}

export class FakeIpAddressMiddleware {
    constructor(ip_address, tcp_port) {
        this.ip_address = ip_address;
        this.tcp_port = tcp_port;
        this.call_number = 0;
    }

    change(packageParam) {
        this.call_number++;
        if (this.call_number === 5) {
            packageParam.ip.destination_ip = this.ip_address;
            packageParam.destination_port = this.tcp_port;
        }
        return packageParam;
    }
}

