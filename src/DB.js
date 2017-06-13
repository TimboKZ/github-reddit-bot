/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

'use strict';

const Sequelize = require('sequelize');

class DB {

    constructor(dbUrl) {
        this.sequelize = new Sequelize(dbUrl, {logging: false});

        this.activeRepos = this.sequelize.define('activeRepos', {
            repoName: {
                type: Sequelize.DataTypes.STRING
            },
            subredditName: {
                type: Sequelize.DataTypes.STRING
            }
        });
        this.postQueue = this.sequelize.define('postQueue', {
            id: {
                type: Sequelize.DataTypes.STRING,
                primaryKey: true
            },
            subreddit: {
                type: Sequelize.DataTypes.STRING
            },
            title: {
                type: Sequelize.DataTypes.STRING
            },
            text: {
                type: Sequelize.DataTypes.TEXT
            },
            completed: {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false
            }
        });
    }

    testConnection() {
        return this.sequelize.authenticate();
    }

}

module.exports = DB;
