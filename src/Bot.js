/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

const DB = require('./DB');
const RedditClient = require('./RedditClient');
const WebServer = require('./WebServer');
const Package = require('./../package.json');

class Bot {

    /**
     * @param {number} port
     * @param {string} dbUrl
     */
    constructor(port, dbUrl) {
        this.db = new DB(dbUrl);
        this.reddit = new RedditClient();
        this.server = new WebServer(port);
    }

    start() {
        console.log(`Starting GitHub Reddit Bot v${Package.version}...`);
        this.db.testConnection()
            .catch((error) => {
                console.error(`Could not establish connection to database: ${error}`);
            })
            .then(() => {
                console.log('Connected to database.');
                return this.reddit.testConnection();
            })
            .catch((error) => {
                console.error(`Reddit client could not connect: ${error}`);
            })
            .then(() => {
                console.log('Reddit client connected.');
                return this.server.start();
            })
            .catch((port, error) => {
                console.error(`Could not start a web server on port ${port}: ${error}`);
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
