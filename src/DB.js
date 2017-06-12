/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

const Sequelize = require('sequelize');

class DB {

    constructor(dbUrl) {
        this.sequelize = new Sequelize(dbUrl);
    }

    testConnection() {
        return this.sequelize.authenticate();
    }

}

module.exports = DB;
