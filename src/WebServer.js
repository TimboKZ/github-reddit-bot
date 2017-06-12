/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

'use strict';

const path = require('path');
const express = require('express');
const Promise = require('bluebird');

/**
 * @property {express.application} express
 */
class WebServer {

    /**
     * @param {number} port
     */
    constructor(port) {
        this.port = port;
        this.server = null;
        this.setup();
    }

    setup() {
        this.express = express();
        this.express.get('/', (req, res) => {
            let indexPath = path.normalize(path.join(__dirname, '..', 'index.html'));
            res.sendFile(indexPath);
        });
        this.express.all('/hooks', WebServer.processHook);
    }

    /**
     * @param {express.request} req
     * @param {express.response} res
     */
    static processHook(req, res) {
        let userAgent = req.get('User-Agent');
        let eventType = req.get('X-GitHub-Event');
        let signature = req.get('X-Hub-Signature');
        let deliveryID = req.get('X-GitHub-Delivery');

        if (WebServer.validateRequest(userAgent, eventType, signature, deliveryID)) {
            // TODO: Change this to use JobQueue
            console.log('Accepted!');
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    }

    /**
     * @param {string} userAgent
     * @param {string} eventType
     * @param {string} signature
     * @param {string} deliveryID
     * @returns {boolean}
     */
    static validateRequest(userAgent, eventType, signature, deliveryID) {
        if (!userAgent.match(/^GitHub-Hookshot/gi)) return false;
        if (!eventType) return false;
        // if (signature) TODO: Make use of signature for request validation
        if (!deliveryID) return false;
        return true;
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.express.listen(this.port);
                resolve(this.port);
            } catch(error) {
                reject(error);
            }
        });
    }

    stop() {
        this.server.close();
    }

}

module.exports = WebServer;
