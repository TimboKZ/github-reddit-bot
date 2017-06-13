/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

'use strict';

class Request {
    /**
     * @param {string} deliveryId
     * @param {string} eventType
     * @param {string} signature
     * @param {object} payload
     */
    constructor(deliveryId, eventType, signature, payload) {
        this.deliveryId = deliveryId;
        this.eventType = eventType;
        this.signature = signature;
        this.payload = payload;
    }
}

class RequestQueue {

    // TODO: Use secret to authorise users

    // TODO: Clean up RequestQueue on bot restart/when users change settings

    /**
     * @param {DB} db
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * @param {Request} request
     */
    add(request) {
        this.findRepoToSubMapping(request)
            .then(mapping => {
                return this.db.postQueue.create({
                    id: request.deliveryId,
                    subreddit: mapping.get('subredditName'),
                    title: `${request.payload.name}: ${request.payload.eventType} (#${request.deliveryId})`,
                    text: '```\n' + JSON.stringify(request.payload) + '\n```'
                });
            })
            .then(() => {
                console.log(`Delivery #${request.deliveryId} added to post queue!`);
            })
            .catch((error) => {
                console.error(`Couldn't add delivery #${request.deliveryId} to queue!`);
                console.error(error.message);
                console.error(error.stack);
            });
    }

    /**
     * @param {Request} request
     */
    findRepoToSubMapping(request) {
        return this.db.activeRepos
            .findOne({
                where: {
                    repoName: {
                        $iLike: request.payload.name
                    }
                }
            });
    }

    getIncompleteRequests() {
        return this.db.postQueue
            .findAll({
                where: {
                    completed: false
                }
            });
    }

    completeRequest(request) {
        return request.update({
            completed: true
        });
    }

}

module.exports = {Request, RequestQueue};
