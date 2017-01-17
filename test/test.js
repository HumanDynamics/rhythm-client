/* eslint-env mocha */
'use strict'

const assert = require('assert')
const RhythmClient = require('..')

describe('constructor works', function () {
  describe('options', function () {
    it('are set correctly', function (done) {
      var rc = new RhythmClient({
        serverUrl: 'server-url',
        serverEmail: 'server-email',
        serverPassword: 'server-password'
      })
      assert(rc.serverUrl === 'server-url')
      done()
    })
    it('throws an error when a URL is not set', function (done) {
      assert.throws(function () {
        RhythmClient({
          serverEmail: 'server-email',
          serverPassword: 'server-password'
        }, Error)
      })
      done()
    })

    it('throws an error when a password is not set', function (done) {
      assert.throws(function () {
        RhythmClient({
          serverUrl: 'server-url',
          serverEmail: 'server-email'
        }, Error)
      })
      done()
    })

    it('throws an error when a email is not set', function (done) {
      assert.throws(function () {
        RhythmClient({
          serverUrl: 'server-url',
          serverPassword: 'server-password'
        }, Error)
      })
      done()
    })
  })
})

describe('connects to server properly', function () {
  it('connects to a rhythm server', function (done) {
    var rc = new RhythmClient({
      serverUrl: process.env.TEST_SERVER_URL,
      serverPassword: process.env.TEST_SERVER_PASSWORD,
      serverEmail: process.env.TEST_SERVER_EMAIL
    })
    rc.connect().then(function () {
      assert(rc.connected === true)
      done()
    })
  })

  it('throws an error if its not authenticated', function (done) {
    var rc2 = new RhythmClient({
      serverUrl: process.env.TEST_SERVER_URL,
      serverPassword: 'bad-password',
      serverEmail: process.env.TEST_SERVER_EMAIL
    })
    rc2.connect().catch(function (err) {
      assert(err.code === 401)
      done()
    })
  })
})
