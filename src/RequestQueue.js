/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

'use strict';

class RequestQueue {

    // TODO: Use secret to authorise users

    // TODO: Clean up RequestQueue on bot restart/when users change settings

    /**
     * @param {DB} db
     */
    constructor(db) {
        this.db = db;
    }

    addRequest(deliveryId, eventType, signature, payload) {
        console.log('Request received!');
        console.log(payload);
    }

    takeRequest() {

    }

}

module.exports = RequestQueue;
