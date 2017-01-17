const _ = require('lodash')
const io = require('socket.io-client')
const feathers = require('feathers-client')

var RhythmClient = function (options) {
  options = options || {}
  var self = this

  var checkAndSet = function (varName) {
    self[varName] = (options[varName] || '')
    if (self[varName] === '') {
      throw new Error('No ' + varName + ' defined. Make sure you pass a `' + varName + 'on construction.')
    }
  }

  // connects to a rhythm server.
  // @returns a promise with a token or an error if it could not connect or
  // authenticate
  self.connect = function () {
    var socket = io(self.serverUrl, {
      'transports': [
        'websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling'
      ]
    })

    self.app = feathers()
      .configure(feathers.hooks())
      .configure(feathers.socketio(socket))
      .configure(feathers.authentication())

    return self.app.authenticate({
      type: 'local',
      email: self.serverEmail,
      password: self.serverPassword
    }).then(function (result) {
      self.connected = true
      self.token = result.token
    })
  }

  var constructor = function () {
    _.map(['serverUrl', 'serverEmail', 'serverPassword'], checkAndSet)
    self.connected = false
  }

  // construct object!
  return constructor()
}

module.exports = RhythmClient
