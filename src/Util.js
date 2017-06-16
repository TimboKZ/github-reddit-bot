/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

'use strict';

class Util {

    /**
     * @param {Error} error
     * @param {string} message
     * @param {Response} [res]
     * @param {number} [status]
     */
    static logError(error, message, res, status = 500) {
        console.error(message);
        console.error(error.message);
        console.error(error.stack);
        if (res && !res.headerSent) {
            res.status(status);
            res.send(`${message}: ${error.message}`);
        }
    }

    /**
     * @param {Response} res
     * @param {string} message
     * @param {boolean} [throwError]
     */
    static sendJsonError(res, message, throwError = true) {
        if (!res || res.headerSent) return;
        res.status(200);
        res.json({
            error: {
                message,
            },
        });
        if (throwError) {
            throw new Error(message);
        }
    }

}

module.exports = Util;
