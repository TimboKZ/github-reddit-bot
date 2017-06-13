/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

'use strict';

const DB = require('./DB');
const {RequestQueue} = require('./RequestQueue');
const RedditClient = require('./RedditClient');
const WebServer = require('./WebServer');

class Bot {

    /**
     * @type {{port: number, dbUrl: string, userAgent: string, clientId: string, clientSecret: string, username: string, password: string}} config
     */
    constructor(config) {
        this.config = config;
        this.db = new DB(this.config.dbUrl);
        this.queue = new RequestQueue(this.db);

        this.reddit = new RedditClient(
            this.config.clientId,
            this.config.clientSecret,
            this.config.username,
            this.config.password,
            this.config.userAgent,
            this.queue
        );
        this.server = new WebServer(this.config.port, this.queue);
    }

    start() {
        console.log(`Starting ${this.config.userAgent}...`);
        console.log('Connecting to database...');
        this.db.testConnection()
            .then(() => {
                console.log('Connected to database.');

                this.db.activeRepos.sync({force: true}).then(() => {
                    return this.db.activeRepos.create({
                        repoName: 'TimboKZ/github-reddit-bot',
                        subredditName: 'GithubRedditBot'
                    });
                });

                console.log('Connecting to Reddit...');
                return this.reddit.testConnection();
            })
            .then(() => {
                console.log('Reddit client connected.');
                console.log('Starting the web server...');
                return this.server.start();
            })
            .then((port) => {
                console.log(`Web server is listening on ${port}.`);
                console.log('Scheduling poster routine...');
                this.schedulePosterRoutine();
            })
            .then(() => {
                console.log('Poster routine scheduled.');
                console.log('GitHub Reddit Bot is up and running!');
            })
            .catch((error) => {
                throw error;
            });
    }

    schedulePosterRoutine() {
        const oneMinute = 60 * 1000;
        setInterval(() => {
            this.reddit.processQueue();
        }, oneMinute);
    }

}

module.exports = Bot;
