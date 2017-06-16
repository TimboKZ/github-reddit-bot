/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

'use strict';

class Post {
    /**
     * @param {string} title
     * @param {string} text
     */
    constructor(title, text) {
        this.title = title;
        this.text = text;
    }
}

class PostGenerator {
    /**
     * @param {object} mapping
     * @param {Request} request
     * @boolean Post
     */
    static createPost(mapping, request) {
        let title = `${request.payload.name}: ${request.eventType} (#${request.deliveryId})`;
        let text = JSON.stringify(request.payload, null, 4);
        return new Post(title, text);
    }
}

module.exports = PostGenerator;
