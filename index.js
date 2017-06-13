/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/github-reddit-bot
 * @copyright 2017
 * @license GPL-3.0
 */

'use strict';

// TODO: Load config from Heroku ENV variables
const Package = require('./package.json');
const Bot = require('./src/Bot');

const config = {
    port: process.env.PORT || 5000,
    dbUrl: process.env.DATABASE_URL,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.BOT_USERNAME,
    password: process.env.BOT_PASSWORD,
    userAgent: `node:github-reddit-bot:v${Package.version} (by /u/Timbo_KZ)`
};

let bot = new Bot(config);
bot.start();
