/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

'use strict';

const Promise = require('bluebird');
const snoowrap = require('snoowrap');
const fetch = require('node-fetch');
const _ = require('lodash');

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
                // TODO: Add moderator check - accept moderator invite if necessary
                console.log(`Processing ${incompleteRequests.length} incomplete requests...`);
                incompleteRequests.forEach(request => {
                    this.submitSelfPost(
                        request.get('subreddit'),
                        request.get('title'),
                        request.get('text')
                    )
                        .then(() => this.queue.completeRequest(request))
                        .then(() => {
                            console.log(`Request #${request.get('id')} was completed.`);
                        })
                        .catch((error) => {
                            console.error('Could not complete request by posting on reddit!');
                            console.error(error.message);
                            console.error(error.stack);
                        });
                });
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
                sendReplies: false,
            });
    }

    /**
     * @param {string} subName
     * @return Promise<boolean>
     */
    subredditExists(subName) {
        return new Promise((resolve) => {
            this.reddit.getSubreddit(subName).getHot()
                .then(() => resolve(true))
                .catch(() => resolve(false));
        });
    }

    /**
     * @param {string} subName
     * @param {string} username
     */
    static hasMod(subName, username) {
        return new Promise((resolve, reject) => {
            RedditClient.getSubMods(subName)
                .then(modNames => {
                    let lowerCaseNames = _.map(modNames, name => name.toLowerCase());
                    resolve(lowerCaseNames.includes(username.toLowerCase()));
                })
                .catch(error => reject(error));
        });
    }

    /**
     * @param {string} subName
     * @return Promise<string[]>
     */
    static getSubMods(subName) {
        let modInfoUrl = `https://reddit.com/r/${subName}/about/moderators.json`;
        return new Promise((resolve, reject) => {
            fetch(modInfoUrl)
                .then(res => res.json())
                .then(json => {
                    let mods = json.data.children;
                    let modNames = _.flatMap(mods, mod => mod.name);
                    resolve(modNames);
                })
                .catch(error => reject(error));
        });
    }

}

module.exports = RedditClient;
