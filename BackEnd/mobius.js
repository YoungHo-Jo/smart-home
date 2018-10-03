var mqtt = require('mqtt')
var request = require('request')
var client = mqtt.connect('mqtt://52.78.33.177')

const rssiCnt = 'Mobius/smart-home/rssi/sub-rssi'
const switchCnt = 'Mobius/smart-home/switch/sub-switch'
const ampsCnt = 'Mobius/smart-home/amps/sub-amps'

var switchValue = {}
var ampsValue = {}

client.on('connect', () => {
  console.log('MQTT Connected')  

  client.subscribe('/oneM2M/req/Mobius/Ssmart-home/json', err => {
    if(err) {
      console.log(err)
    } else {
      console.log('MQTT Subscription Success')
    }
  })

  client.subscribe('/prediction', err => {
    if(err) {
      console.log(err)
    } else {
      console.log('MQTT Subscription Success')
    }
  })

  client.on('message', (topic, msg) => {
    if(topic === '/prediction') {
      try {
        var jsonObj = JSON.parse(msg.toString()) 

      } catch(e) {


      }
    } else if(topic === '/oneM2M/req/Mobius/Ssmart-home/json') {
      try {
        var obj = JSON.parse(msg)
        var cnt = obj.pc['m2m:sgn'].sur
        var con = obj.pc['m2m:sgn'].nev.rep['m2m:cin'].con
        switch(cnt) {
          // case rssiCnt:
          // break
          case switchCnt:
            if(!con.cmd) {
              Object.keys(con).forEach(key => {
                switchValue[plugMacMapping[key]] = con[key]
              })
            }
          break
          case ampsCnt:
            Object.keys(con).forEach(key => {
              ampsValue[plugMacMapping[key]] = con[key]
            })
          break
        }
      } catch(e) {
        console.log(e)
      }
    }

  })
})

const plugNameMapping = {
  "Plug 3": "00:0b:57:27:be:c6",
  "Plug 4": "00:0b:57:27:c0:7f",
  "Plug 2": "00:0b:57:27:c0:93",
  "Plug 1": "00:0b:57:27:be:57"
}

const plugMacMapping = {
  "00:0b:57:27:c0:93": "Plug 2",
  "00:0b:57:27:be:c6": "Plug 3",
  "00:0b:57:27:c0:7f": "Plug 4",
  "00:0b:57:27:be:57": "Plug 1"
}
/**
 * Set a switch state of a plug
 * @param plugName
 * The name of the plug, not the MAC Address
 * @param toState
 * The state of wanting to change
 */
function setSwitchState(plugName, toState) {
    var header = {
      'Accept': 'application/json',
      'X-M2M-RI': '12345',
      'X-M2M-Origin': 'Ssmart-home',
      'content-type': 'application/vnd.onem2m-res+json; ty=4',
      'Content-Type': 'application/vnd.onem2m-res+json; ty=4',
      'Content-type': 'application/vnd.onem2m-res+json; ty=4'
    }

    var body = {
      "m2m:cin": {
        "con": {
          "cmd": {

          }
        }
      }
    }
    body["m2m:cin"]["con"]["cmd"][plugNameMapping[plugName]] = toState 

    var options = {
      url: 'http://52.78.33.177:7579/Mobius/smart-home/switch',
      method: 'POST',
      headers: header,
      form: JSON.stringify(body)
    }

    request(options, (err, res, body) => {
      if(!err) {
        console.log(res.statusCode)
        console.log(res.body)
      } else {

      }
    })
}
 
module.exports = {
  switchValue: switchValue,
  ampsValue: ampsValue,
  plugName: plugNameMapping,
  setSwitch:  setSwitchState
}

setInterval(() => {
  console.log(switchValue)
  console.log(ampsValue)
}, 1000)