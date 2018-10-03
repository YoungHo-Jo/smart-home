import request from 'superagent'
module.exports = {
  setSwitch: setSwitchState
}

const plugNameMapping = {
  "Plug 3": "00:0b:57:27:be:c6",
  "Plug 4": "00:0b:57:27:c0:7f",
  "Plug 2": "00:0b:57:27:c0:93",
  "Plug 1": "00:0b:57:27:be:57"
}

/**
 * Set a switch state of a plug
 * @param plugName
 * The name of the plug, not the MAC Address
 * @param toState
 * The state of wanting to change
 * @param success
 * A callback function called when the request is succeed
 */
function setSwitchState(plugName, toState, success) {

  var body = {
    "m2m:cin": {
      "con": {
        "cmd": {

        }
      }
    }
  }
  body["m2m:cin"]["con"]["cmd"][plugNameMapping[plugName]] = toState 

  request
    .post('http://52.78.33.177:7579/Mobius/smart-home/switch')
    .send(JSON.stringify(body))
    .set('Accept', 'application/json')
    .set('X-M2M-RI', '12345')
    .set('X-M2M-Origin', 'user')
    .set('content-type', 'application/vnd.onem2m-res+json; ty=4')
    .set('Content-Type', 'application/vnd.onem2m-res+json; ty=4')
    .set('Content-type', 'application/vnd.onem2m-res+json; ty=4')
    .end((err, res) => {
      if(err) console.log(err)
      else {
        success(res)
      }
    })
}