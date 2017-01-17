# rhythm-client
Javascript library to interface with a Rhythm Server

## Installation
`npm install rhythm-client`

## usage
1. Connect to a rhythm server
```javascript
const rc = require('rhythm-client')
var rc = new RhythmClient({
  serverUrl: 'server-url',
  serverEmail: 'server-email',
  serverPassword: 'server-password'
})

rc.connect().then(function () {
  console.log("connected!")
})
```

2. Create a new meeting

```javascript
rc.connect().then(function () {
  assert(rc.connected === true)
  var meeting = {id: 'meeting-id'}
  var participants = [{uuid: 'p1uuid', consent: true}, {uuid: 'p2uuid', consent: true}]
  rc.startMeeting(meeting, participants, {}).then(function (result) {
     if (result) {
       console.log("Started a meeting!")
     }
  }).catch(function (err) {
    console.log("something went wrong.")
  })
})
```

3. Send speaking events

```javascript
rc.sendSpeakingEvent("participant-id", 15840383299, 15840383302)
  .then(function (result) {
    console.log("speaking object made!", result)
  }).catch(function (err) {
    console.log("ran into a problem", err)
  })
```

## License
MIT
