import io from 'socket-io-client'

const socket = io('http://localhost:3000')

module.exports = {
  /**
   * Listener of Switch state from Socket
   * @param callback
   * Passing JSON object of given message
   */
  onSwitch: function(callback) {
    socket.on('switch', msg => {
      callback(JSON.parse(msg))
    })
  },
  /**
   * Listener of Amps value from Socket
   * @param callback
   * Passing JSON object of given message
   */
  onAmps: function(callback) {
    socket.on('amps', msg => {
      callback(JSON.parse(msg))
    })
  }
}