/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const crypto = require('crypto');
const RedditStrategy = require('passport-reddit').Strategy;
const Promise = require('bluebird');
const {Request} = require('./RequestQueue');

class WebServer {

    /**
     * @param {{url: string, port: number, dbUrl: string, userAgent: string, clientId: string, clientSecret: string, username: string, password: string}} config
     * @param {RequestQueue} queue
     */
    constructor(config, queue) {
        this.config = config;
        this.port = this.config.port;
        this.queue = queue;

        this.server = null;
        this.setup();
    }

    setup() {
        passport.serializeUser(function (user, done) {
            done(null, user);
        });
        passport.deserializeUser(function (obj, done) {
            done(null, obj);
        });
        passport.use(new RedditStrategy(
            {
                clientID: this.config.clientId,
                clientSecret: this.config.clientSecret,
                callbackURL: `${this.config.url}/auth/reddit/callback`
            },
            (accessToken, refreshToken, profile, done) => done(null, {id: profile.id, name: profile.name})
        ));

        /** @var {Express} */
        this.express = express();
        this.express.use(bodyParser.json());
        this.express.use(session({secret: this.config.userAgent}));
        this.express.use(passport.initialize());
        this.express.use(passport.session());
        this.express.get('/', (req, res) => {
            let indexPath = path.normalize(path.join(__dirname, '..', 'index.html'));
            if (req.user) {
                return res.redirect('/settings');
            }
            return res.sendFile(indexPath);
        });
        this.express.all('/hooks', this.processHook.bind(this));
        this.express.get('/settings', (req, res) => {
            if (!req.user) {
                return res.redirect('/');
            }
            res.send(`Hello! ${JSON.stringify(req.user)}`);
        });
        this.express.get('/auth/reddit', (req, res, next) => {
            req.session.state = crypto.randomBytes(32).toString('hex');
            passport.authenticate('reddit', {
                state: req.session.state,
            })(req, res, next);
        });
        this.express.get('/auth/reddit/callback', function (req, res, next) {
            // Check for origin via state token
            if (req.query.state == req.session.state) {
                passport.authenticate('reddit', {
                    successRedirect: '/settings',
                    failureRedirect: '/'
                })(req, res, next);
            }
            else {
                res.status(403);
                res.send('Invalid session hash - please try again.');
            }
        });
    }

    /**
     * @param {Request} req
     * @param {Response} res
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
     * @param {string} deliveryID
     * @returns {boolean}
     */
    static validateRequest(userAgent, eventType, deliveryID) {
        return userAgent.match(/^GitHub-Hookshot/gi)
            && !!eventType
            && !!deliveryID;
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
