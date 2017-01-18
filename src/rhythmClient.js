const _ = require('lodash')
const io = require('socket.io-client')
const feathers = require('feathers-client')

var RhythmClient = function (options) {
  options = options || {}
  var self = this

  var checkAndSet = function (varName) {
    self[varName] = (options[varName] || '')
    if (self[varName] === '') {
      throw new Error('No ' + varName + ' defined. Make sure you pass a `' + varName + '` on construction.')
    }
  }

  // connects to a rhythm server.
  // @returns a promise with a token or an error if it could not connect or
  // authenticate
  self.connect = function () {
    if (self.serverUrl === '' || typeof (self.serverUrl) === 'undefined') {
      throw new Error('Cannot connect, set the server first.')
    }
    self._socket = io(self.serverUrl, {
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
      .configure(feathers.socketio(self._socket))
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

  // addParticipant
  // @participant : participant object, with at least a key for 'id' and 'consent'
  self.addParticipant = function (participant) {
    var newParticipantList = _.concat(self.participants, participant)
    return self._socket.emit('meetingJoined', {
      participant: participant.uuid,
      name: (participant.name || ''),
      participants: _.map(newParticipantList, function (p) { return p.uuid }),
      meeting: self.meeting.id,
      meetingUrl: (self.meeting.url || ''),
      consent: participant.consent,
      consentDate: (participant.consentDate || new Date().toISOString())
    }).then(function (result) {
      self.participants = newParticipantList
      return Promise.resolve(newParticipantList)
    })
  }

  // startMeeting
  // @meeting : an object, must have at least key 'id' with a string identifier
  // @participants : an list of participants that are in the meeting
  //   participant objects must have at least an 'id' and 'consent' keys; see below.
  // @meta : any metadata to associate with the meetingId
  // returns a promise that returns true if you did everything right, and throws
  // an error otherwise
  // Optional data:
  // @meeting:
  //   {url: (optional) URL of this meeting
  //    id: string ID of this meeting
  //   }
  // @participant:
  //   {consentDate: (optional) date user gave consent, in ISOString format.
  //    consent: boolean of whether user has given consent or not
  //    id: string ID of participant
  //    name: (optional) name of participant, as a String
  //   }
  self.startMeeting = function (meeting, participants, meta) {
    // check if we have all the right data
    var meetingCheck = (_.has(meeting, 'id'))
    var participantCheck = function (p) {
      return _.every(_.map(['uuid', 'consent'],
                           function (k) { return _.has(p, k) }))
    }

    if (!_.every([meetingCheck, participantCheck])) {
      return Promise.reject(new Error('Make sure your participant and meeting objects have all the required fields!'))
    }

    var sendJoinEvent = function (participant) {
      return self._socket.emit('meetingJoined', {
        participant: participant.uuid,
        name: (participant.name || ''),
        participants: _.map(participants, function (p) { return p.uuid }),
        meeting: meeting.id,
        meetingUrl: (meeting.url || ''),
        consent: participant.consent,
        consentDate: (participant.consentDate || new Date().toISOString())
      })
    }

    return Promise.all(_.map(participants, sendJoinEvent)).then(function (results) {
      if (_.every(results)) {
        self.meeting = meeting
        self.participants = participants
        return Promise.resolve(true)
      } else {
        return Promise.reject(new Error('Could not start a meeting. Check that you sent all the required data'))
      }
    })
  }

  // sends a speaking event for a given participant
  // @startTime, @endTime -- self explanatory. In ISOString format.
  // returns a promise that returns the created speaking event object on
  // success, and throws an error on reject
  self.sendSpeakingEvent = function (participantId, startTime, endTime) {
    return self.app.service('utterances').create(
      {
        participant: participantId,
        meeting: self.meeting.id,
        startTime: startTime,
        endTime: endTime
      }
    )
  }

  // self.addParticipant = function (participant)

  // MAIN CONSTRUCTOR
  // args:
  // @serverUrl main server url of a rhythm server
  // @serverEmail email auth for server
  // @serverPassword password for given email for that server
  var constructor = function () {
    _.map(['serverUrl', 'serverEmail', 'serverPassword'], checkAndSet)
    self.connected = false
    self.participants = []
  }

  // construct object!
  return constructor()
}

module.exports = RhythmClient
