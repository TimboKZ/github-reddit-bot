/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

'use strict';

const Promise = require('bluebird');
const snoowrap = require('snoowrap');

class RedditClient {

    constructor(clientId, clientSecret, username, password, userAgent) {
        this.reddit = new snoowrap({
            clientId,
            clientSecret,
            username,
            password,
            userAgent,
        });
    }

    testConnection() {
        return new Promise((resolve, reject) => {
            this.reddit.getInbox()
                .then(() => resolve())
                .catch(error => reject(error));
        });
    }

    submitSelfPost(subreddit, title, text) {
        // TODO: Add toggleable bot signature
        return this.reddit
            .getSubreddit(subreddit)
            .submitSelfpost({
                title,
                text,
                sendReplies: false
            });
    }

}

module.exports = RedditClient;
