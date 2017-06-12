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
        this.db.testConnection()
            .catch((error) => {
                console.error('Could not establish connection to database!');
                throw error;
            })
            .then(() => {
                console.log('Connected to database.');
                return this.reddit.testConnection();
            })
            .catch((error) => {
                console.error('Reddit client could not connect!');
                throw error;
            })
            .then(() => {
                console.log('Reddit client connected.');
                return this.server.start();
            })
            .catch((port, error) => {
                console.error(`Could not start a web server on port ${port}!`);
                throw error;
            })
            .then((port) => {
                console.log(`Web server is listening on ${port}.`);
            })
            .all(() => {
                console.log('GitHub Reddit Bot is up and running!');
            });
    }

}

module.exports = Bot;
