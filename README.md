# GitHub Reddit Bot

A bot that automatically scans github repos for changes and submits them to the appropriate subreddit.

# How it works

# Deploying the bot

Clone the repository to your local machine and install all NPM dependencies:

```
git clone https://github.com/TimboKZ/github-reddit-bot.git
cd github-reddit-bot
npm install
```

Copy and rename `config.example.json` to `config.json` and amend it as necessary. Once you're done, you can start the bot using `node index.js`. Keep in mind that your server URL will have to be publicly available for GitHub hooks to work. 

# Reporting issues

Please create a thread with your issue [here](https://github.com/TimboKZ/github-reddit-bot/issues). We'll try to resolve all issues as quickly as possible.

# Contributing

Before making a pull request, make sure `npm test` and `npm run lint` commands return no errors or your pull request will be rejected.

