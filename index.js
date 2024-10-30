const events = require('eventemitter3');

const disconnect_states = {
    closed: true,
    failed: true,
    disconnected: true
};

module.exports = class Peer extends events.EventEmitter {
    constructor(options) {
        super();

        this.connection = options.connection;
        this.channel = options.channel;

        let closed = false;
        let This = this;

        function close() {
            if (closed) return;

            closed = true;
            This.emit('close');

            This.connection.close();
        }

        this.connection.addEventListener("connectionstatechange", function () {
            if (This.connection.connectionState in disconnect_states)
                close();
        });

        this.channel.addEventListener("close", close);
        this.channel.addEventListener("error", close);

        this.connection.addEventListener("close", close);
        this.connection.addEventListener("error", close);

        this.channel.addEventListener("open", function () {
            This.emit('open');
        });

        this.channel.addEventListener("message", function (ev) {
            This.emit('message', ev);
        });
    }

    addEventListener(event, listener) {
        this.addListener(event, listener);
    }

    removeEventListener(event, listener) {
        this.removeListener(event, listener);
    }

    send(data) {
        this.channel.send(data);
    }

    close() {
        this.emit('close');
        this.channel.close();
        this.connection.close();
    }
}