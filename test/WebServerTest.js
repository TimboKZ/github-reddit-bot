/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license GPL-3.0
 */

'use strict';

const Promise = require('bluebird');
const request = require('supertest');
const WebServer = require('../src/WebServer');

const config = {
    clientId: '123',
    clientSecret: '123',
    port: 5000,
};

describe('WebServer', () => {

    let server;

    before(() => {
        let queueMock = {
            add: () => {
                new Promise((resolve) => {
                    resolve();
                });
            },
        };
        server = new WebServer(config, {}, {}, queueMock);
        server.start();
    });

    after(() => {
        server.stop();
    });

    describe('root URL (/)', () => {
        it('should return index.hbs', (done) => {
            request(server.express)
                .get('/')
                .expect('Content-Type', /text\/html/)
                .expect(200, done);
        });
    });

    describe('hooks URL (/hooks)', () => {
        it('should accept a seemingly valid request from GitHub', (done) => {
            request(server.express)
                .post('/hooks')
                .set('User-Agent', 'GitHub-Hookshot/1235678')
                .set('X-GitHub-Event', 'push')
                .set('X-GitHub-Delivery', '0123456789')
                .expect(200, done);
        });
        it('should reject request with bad user agent', (done) => {
            request(server.express)
                .get('/hooks')
                .set('User-Agent', 'Chrome')
                .set('X-GitHub-Event', 'push')
                .set('X-GitHub-Delivery', '0123456789')
                .expect(400, done);
        });
        it('should reject a simple get request', (done) => {
            request(server.express)
                .get('/hooks')
                .expect(400, done);
        });
    });

});
