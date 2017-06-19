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

        this.moddedSubreddits = this.sequelize.define('moddedSub', {
            user: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            subreddit: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
        });
        this.activeRepos = this.sequelize.define('activeRepos', {
            repoName: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            subredditName: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            author: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            secret: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
        });
        this.postQueue = this.sequelize.define('postQueue', {
            id: {
                type: Sequelize.DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
            },
            subreddit: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            title: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            text: {
                type: Sequelize.DataTypes.TEXT,
                allowNull: false,
            },
            completed: {
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        });
    }

    testConnection() {
        return this.sequelize.authenticate();
    }

}

module.exports = DB;
