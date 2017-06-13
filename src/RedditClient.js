/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

'use strict';

const Promise = require('bluebird');
const snoowrap = require('snoowrap');

class RedditClient {

    constructor(clientId, clientSecret, username, password, userAgent, queue) {
        this.reddit = new snoowrap({
            clientId,
            clientSecret,
            username,
            password,
            userAgent,
        });
        this.queue = queue;
    }

    testConnection() {
        return new Promise((resolve, reject) => {
            this.reddit.getInbox()
                .then(() => resolve())
                .catch(error => reject(error));
        });
    }

    processQueue() {
        this.queue.getIncompleteRequests()
            .then((incompleteRequests) => {
                for (let i = 0; i < incompleteRequests; i++) {
                    let request = incompleteRequests[i];
                    this.submitSelfPost(
                        request.get('subreddit'),
                        request.get('title'),
                        request.get('text')
                    ).then(() => {
                        return this.queue.completeRequest(request);
                    }).then(() => {
                        console.log(`Request #${request.get('id')} was completed.`);
                    }).catch((error) => {
                        console.error('Could not complete request by posting on reddit!');
                        console.error(error.message);
                        console.error(error.stack);
                    });
                }
            })
            .catch((error) => {
                console.error('Could not fetch incomplete requests!');
                console.error(error.message);
                console.error(error.stack);
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
