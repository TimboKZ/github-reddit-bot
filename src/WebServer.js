/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

'use strict';

const path = require('path');
const express = require('express');

/**
 * @property {express.application} express
 */
class WebServer {

    /**
     * @param {number} port
     */
    constructor(port) {
        this.port = port;
        this.setup();
    }

    setup() {
        this.express = express();
        this.express.get('/', (req, res) => {
            let indexPath = path.normalize(path.join(__dirname, '..', 'index.html'));
            res.sendFile(indexPath);
        });
    }

    start() {
        this.express.listen(this.port, () => {
            console.log(`GitHub Reddit Bot web server listening on port ${this.port}!`)
        });
    }

}

module.exports = WebServer;
