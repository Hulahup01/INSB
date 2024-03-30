export class IP {
    constructor(source_ip, destination_ip, data) {
        this.version = 4;
        this.ihl = 5; 
        this.dscp = null; 
        this.ecn = null;
        this.total_length = 576;
        this.id = null;
        this.flags = null;
        this.fragment_offset = null;
        this.ttl = 20; 
        this.protocol = 6; 
        this.checksum = null;
        this.source_ip = source_ip;
        this.destination_ip = destination_ip; 
        this.data = data; 
    }
}