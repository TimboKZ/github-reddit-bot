/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/github-reddit-bot
 * @copyright 2017
 * @license GPL-3.0
 */

const Config = require('./config.json');
const Bot = require('./src/Bot');

const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DATABASE_URL;

let bot = new Bot(PORT, DB_URL);
bot.start();
