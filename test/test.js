/* eslint-env mocha */
'use strict'

const _ = require('lodash')
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

describe('can start a meeting', function () {
  it('starts a meeting when it gives all the right information', function (done) {
    var rc = new RhythmClient({
      serverUrl: process.env.TEST_SERVER_URL,
      serverPassword: process.env.TEST_SERVER_PASSWORD,
      serverEmail: process.env.TEST_SERVER_EMAIL
    })
    rc.connect().then(function () {
      assert(rc.connected === true)
      var meeting = {id: 'meeting-id'}
      var participants = [{uuid: 'p1uuid', consent: true}, {uuid: 'p2uuid', consent: true}]
      rc.startMeeting(meeting, participants, {}).then(function (result) {
        assert(result)
        done()
      }).catch(function (err) {
        done(err)
      })
    })
  })
})

describe('doesnt start a meeting', function () {
  it('doesnt start a meeting when you send bad info', function (done) {
    var rc2 = new RhythmClient({
      serverUrl: process.env.TEST_SERVER_URL,
      serverPassword: process.env.TEST_SERVER_PASSWORD,
      serverEmail: process.env.TEST_SERVER_EMAIL
    })
    rc2.connect().then(function () {
      assert(rc2.connected === true)
      var meeting = {}
      var participants = [{uuid: 'p1uuid', consent: true}, {uuid: 'p2uuid', consent: true}]
      rc2.startMeeting(meeting, participants, {})
        .catch(function (err) {
          //console.log('err', err)
          done()
        })
    })
  })
})
