/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

const DB = require('./DB');
const RedditClient = require('./RedditClient');
const WebServer = require('./WebServer');

class Bot {

    /**
     * @type {{port: number, dbUrl: string, userAgent: string, clientId: string, clientSecret: string, username: string, password: string}} config
     */
    constructor(config) {
        this.config = config;
        this.db = new DB(this.config.dbUrl);
        this.reddit = new RedditClient(
            this.config.clientId,
            this.config.clientSecret,
            this.config.username,
            this.config.password,
            this.config.userAgent
        );
        this.server = new WebServer(this.config.port);
    }

    start() {
        console.log(`Starting ${this.config.userAgent}...`);
        console.log('Connecting to database...');
        this.db.testConnection()
            .then(() => {
                console.log('Connected to database.');
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
                console.log('GitHub Reddit Bot is up and running!');
            })
            .catch((error) => {
                throw error;
            });
    }

}

module.exports = Bot;
