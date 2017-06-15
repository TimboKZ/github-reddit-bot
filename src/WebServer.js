/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const exphbs = require('express-handlebars');
const RedditStrategy = require('passport-reddit').Strategy;
const Promise = require('bluebird');
const _ = require('lodash');
const RedditClient = require('./RedditClient');
const {Request} = require('./RequestQueue');
const Util = require('./Util');

const PUBLIC_PATH = path.normalize(path.join(__dirname, '..', 'public'));

class WebServer {

    /**
     * @param {{url: string, port: number, dbUrl: string, userAgent: string, clientId: string, clientSecret: string, username: string, password: string}} config
     * @param {RedditClient} reddit
     * @param {DB} db
     * @param {RequestQueue} queue
     */
    constructor(config, reddit, db, queue) {
        this.config = config;
        this.port = this.config.port;
        this.db = db;
        this.reddit = reddit;
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
                callbackURL: `${this.config.url}/auth/reddit/callback`,
                state: true,
            },
            (accessToken, refreshToken, profile, done) => done(null, {id: profile.id, name: profile.name})
        ));

        /** @var {Express} */
        this.express = express();
        this.express.engine('hbs', exphbs());
        this.express.set('view engine', 'hbs');
        this.express.use(bodyParser.json());
        this.express.use(cookieParser());
        this.express.use(session({
            secret: 'keyboard cat',
            resave: false,
            saveUninitialized: false,
        }));
        this.express.use(passport.initialize());
        this.express.use(passport.session());

        this.setupRoutes();
        this.setupAuth();
    }

    setupRoutes() {
        this.express.all('/hooks', this.processHook.bind(this));
        this.express.get('/', (req, res) => {
            let indexPath = path.join(PUBLIC_PATH, 'index.hbs');
            if (req.user) {
                return res.redirect('/settings');
            }
            res.render(indexPath, {
                baseUrl: this.config.url,
            });
        });
        this.express.get('/settings', (req, res) => {
            if (!req.user) {
                return res.redirect('/');
            }
            let settingsPath = path.join(PUBLIC_PATH, 'settings.hbs');
            res.render(settingsPath, {
                baseUrl: this.config.url,
                user: req.user,
            });
        });
        this.express.put('/settings/modded-subs', (req, res) => {
            if (!req.user) {
                return res.sendStatus(401);
            }
            if(!req.query.subreddit || req.query.subreddit === '') {
                return res.sendStatus(400);
            }

            this.reddit.subredditExists(req.query.subreddit)
                .then(exists => {
                    if (!exists) throw new Error(`Subreddit ${req.query.subreddit} does not exist!`);
                    return RedditClient.hasMod(req.query.subreddit, req.user.name);
                })
                .then(isMod => {
                    if(!isMod) throw new Error(`You're not a mod of ${req.query.subreddit}!`);
                    return this.db.moddedSubreddits.create({
                        user: req.user.name,
                        subreddit: req.query.subreddit,
                    });
                })
                .then(() => res.sendStatus(200))
                .catch(error => Util.logError(error, 'Could not add a modded sub for user', res));
        });
        this.express.delete('/settings/modded-subs', (req, res) => {
            if (!req.user) {
                return res.sendStatus(401);
            }
        });
        this.express.get('/settings/modded-subs', (req, res) => {
            if (!req.user) {
                return res.sendStatus(401);
            }
            this.db.moddedSubreddits.findAll({
                where: {
                    user: req.user.name,
                },
            })
                .then(subs => {
                    let jsonSubs = [];
                    _.forEach(subs, (sub) => {
                        jsonSubs.push({
                            id: sub.get('id'),
                            subreddit: sub.get('subreddit'),
                        });
                    });
                    res.send(jsonSubs);
                })
                .catch(error => Util.logError(error, 'Could not fetch modded subs for user:', res));
        });
        this.express.get('/settings/existing-mappings', (req, res) => {
            if (!req.user) {
                return res.sendStatus(401);
            }
            this.db.activeRepos.findAll({
                where: {
                    author: req.user.name,
                },
            })
                .then(mappings => {
                    let jsonMappings = [];
                    _.forEach(mappings, (mapping) => {
                        jsonMappings.push({
                            id: mapping.get('id'),
                            repo: mapping.get('repoName'),
                            subreddit: mapping.get('subredditName'),
                            author: mapping.get('author'),
                            secret: mapping.get('secret'),
                        });
                    });
                    res.send(jsonMappings);
                })
                .catch(error => {
                    console.error('Could not fetch existing mapping for user:');
                    console.error(error.message);
                    console.error(error.stack);
                    res.status(500);
                });
        });
    }

    setupAuth() {
        this.express.get('/auth/reddit', passport.authenticate('reddit'));
        this.express.get('/auth/reddit/callback', passport.authenticate('reddit', {
            successRedirect: '/settings',
            failureRedirect: '/',
        }));
        this.express.get('/logout', (req, res) => {
            req.logout();
            res.redirect('/');
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
