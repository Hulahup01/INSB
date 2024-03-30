function sleepFor(sleepDuration) {
    let now = new Date().getTime();
    while (new Date().getTime() < now + sleepDuration) {
    }
}

function printPackage(packageParam) {
    try {
        sleepFor(1500);

        const msg = `| [Package] ${packageParam} |`;
        const frameLen = msg.length;
  
        console.log('-'.repeat(frameLen));
        console.log(msg);
        console.log('-'.repeat(frameLen));
    } catch (error) {
        throw new Error("Interrupted by user");
    }
}

export class Connection {
    constructor(endpoints, middlewares) {
        this.endpoints = endpoints;
        this.middlewares = middlewares;
        this.closed = false;
        this.connected = false;
    }

    _findReceiver(packageParam) {
        for (const endpoint of this.endpoints) {
            if (endpoint.ip_address === packageParam.ip.destination_ip && endpoint.tcp_port === packageParam.destination_port) {
                return endpoint;
            }
        }
        return null;
    }

    send(packageParam) {
        this.connected = true;
        this.process(packageParam);
    }

    process(packageParam) {
        if (!this.connected || this.closed) {
            return;
        }

        printPackage(packageParam);

        for (const middleware of this.middlewares) {
            packageParam = middleware.change(packageParam);
        }

        if (packageParam.rst) {
            printPackage(packageParam);
            this.close();
            return;
        }

        packageParam.ip.ttl -= 1;
        if (packageParam.ip.ttl <= 0) {
            console.log('Package TTL is expired');
            this.close();
            return;
        }

        const receiver = this._findReceiver(packageParam);

        if (receiver === null) {
            console.log(`Unknown destination ${packageParam.ip.destination_ip}:${packageParam.destination_port}`);
            this.close();
            return;
        }

        packageParam = receiver.receive(packageParam);
        if (packageParam === null) {
            console.log('One of members stop sending requests');
            this.close();
        } else {
            this.process(packageParam);
        }
    }

    close() {
        this.closed = true;
        console.log('Connection is closed');
    }
}
