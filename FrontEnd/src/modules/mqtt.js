var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://52.78.33.177')

const rssiCnt = 'Mobius/smart-home/rssi/sub-rssi'
const switchCnt = 'Mobius/smart-home/switch/sub-switch'
const ampsCnt = 'Mobius/smart-home/amps/sub-amps'

var switchValue = null
var ampsValue = null


client.on('connect', () => {
  console.log('MQTT Connected')  

  client.subscribe('/oneM2M/req/Mobius/Ssmart-home/json', err => {
    if(err) {
      console.log(err)
    } else {
      console.log('MQTT Subscription Success')
    }
  })

  client.on('message', (topic, msg) => {
    try {
      var obj = JSON.parse(msg)
      var cnt = obj.pc['m2m:sgn'].sur
      var con = obj.pc['m2m:sgn'].nev.rep['m2m:cin'].con
      console.log(con)
      switch(cnt) {
        // case rssiCnt:
        // break
        case switchCnt:
          if(!con.cmd) switchValue = con;
        break
        case ampsCnt:
          if(!con.cmd) ampsValue = con;
        break
      }
    } catch(e) {
      console.log(e)
    }
  })
})

module.exports = {
  switchValue: switchValue,
  ampsValue: ampsValue
}
