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

    addRequest() {

    }

    takeRequest() {

    }

}

module.exports = RequestQueue;
