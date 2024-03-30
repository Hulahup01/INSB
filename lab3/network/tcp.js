export class TCP {
    constructor(source_port, destination_port, ip) {
        this.ip = ip;
        this.source_port = source_port;
        this.destination_port = destination_port;
        this.sn = 0;
        this.ack_sn = 0; 
        this.offset = 20; 
        this.ns = null;
        this.cwr = null;
        this.ece = null;
        this.urg = null;
        this.ack = false;
        this.psh = null;
        this.rst = false;
        this.syn = false;
        this.fin = false;
        this.window_size = null; 
        this.checksum = 0; 
        this.urgent = null; 
    }

    toString() {
        return `| S_S: [${this.ip.source_ip}:${this.source_port}] |  D_S: [${this.ip.destination_ip}:${this.destination_port}] | SN: [${this.sn}] | ACK SN: [${this.ack_sn}] | SYN: [${this.syn}] | ACK: [${this.ack}] | RST: [${this.rst}] | Payload: ["${this.ip.data}"]`;
    }
    
}