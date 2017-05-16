/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @see https://github.com/TimboKZ/github-reddit-bot
 * @copyright 2017
 * @license GPL-3.0
 */

const Bot = require('./src/Bot');

const PORT = process.env.PORT || 5000;

let bot = new Bot(PORT);
bot.start();
