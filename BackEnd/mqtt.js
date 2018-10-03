var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://52.78.33.177')

const topic = '/prediction'

client.on('connect', () => {
  console.log('MQTT Connected')  

  client.subscribe(topic, err => {
    if(err) {
      console.log(err)
    } else {
      console.log('MQTT Subscription on ' + topic)
    }
  })

  client.on('message', (topic, msg) => {
    // we need the time of predicted time of turning on/off
    // maybe
    // [{plug(name or mac), true, time}]
    try {
      var jsonObj = JSON.parse(msg.toString())
      var plugID = jsonObj.plug
      var predicted = jsonObj.predicted
      var afterSes = jsonObj.after

    } catch(e) {
      console.log(e)
    }
  })
})

// scheduling 