/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

const snoowrap = require('snoowrap');

class RedditClient {

    constructor(userAgent, clientId, clientSecret, refreshToken) {
        this.reddit = new snoowrap({
            userAgent,
            clientId,
            clientSecret,
            refreshToken
        });
    }

    testConnection() {
        return this.reddit.getInbox();
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
