/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

const WebServer = require('./WebServer');

class Bot {

    /**
     * @param {number} port
     */
    constructor(port) {
        this.server = new WebServer(port);
    }

    start() {
        this.server.start();
    }

}

module.exports = Bot;
