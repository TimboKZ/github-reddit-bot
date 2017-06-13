/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const {Request} = require('./RequestQueue');

/**
 * @property {express.application} express
 */
class WebServer {

    /**
     * @param {number} port
     * @param {RequestQueue} queue
     */
    constructor(port, queue) {
        this.port = port;
        this.queue = queue;

        this.server = null;
        this.setup();
    }

    setup() {
        this.express = express();
        this.express.use(bodyParser.json());
        this.express.get('/', (req, res) => {
            let indexPath = path.normalize(path.join(__dirname, '..', 'index.html'));
            res.sendFile(indexPath);
        });
        this.express.all('/hooks', this.processHook.bind(this));
    }

    /**
     * @param {express.request} req
     * @param {express.response} res
     */
    processHook(req, res) {
        let userAgent = req.get('User-Agent');
        let deliveryID = req.get('X-GitHub-Delivery');
        let eventType = req.get('X-GitHub-Event');
        let signature = req.get('X-Hub-Signature');

        if (WebServer.validateRequest(userAgent, eventType, deliveryID)) {
            console.log(`Accepted delivery #${deliveryID}, adding to request queue...`);
            this.queue.add(new Request(deliveryID, eventType, signature, req.body));
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
    static validateRequest(userAgent, eventType, deliveryID) {
        if (!userAgent.match(/^GitHub-Hookshot/gi)) return false;
        if (!eventType) return false;
        if (!deliveryID) return false;
        return true;
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.express.listen(this.port);
                resolve(this.port);
            } catch (error) {
                reject(error);
            }
        });
    }

    stop() {
        this.server.close();
    }

}

module.exports = WebServer;
