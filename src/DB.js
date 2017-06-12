/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

const Sequelize = require('sequelize');

class DB {

    constructor(dbUrl) {
        this.sequelize = new Sequelize(dbUrl);
        this.jobQueue = this.sequelize.define('jobQueue', {
            subreddit: {
                type: Sequelize.DataTypes.STRING
            },
            title: {
                type: Sequelize.DataTypes.STRING
            },
            text: {
                type: Sequelize.DataTypes.STRING
            },
            completed: {
                type: Sequelize.DataTypes.BOOLEAN
            }
        });
    }

    testConnection() {
        return this.sequelize.authenticate({logging: false});
    }

}

module.exports = DB;
