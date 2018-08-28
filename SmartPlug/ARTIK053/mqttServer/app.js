var mosca = require('mosca')

var ascoltatore = {
  type: 'mongo',
  url: 'mongodb://localhost:27017/mqtt',
  pubsubCollection: 'ascoltatori',
  mongo: {}
}

var moscaSettings = {
  port: 1884,
  backend: ascoltatore,
  persistence: {
    factory: mosca.persistence.Mongo,
    url: 'mongodb://localhost:27017/mqtt'
  }
}

var server = new mosca.Server(moscaSettings)
server.on('ready', setup);

server.on('clientConnected', client => {
  console.log('Client connected', client.id)
})

// fired when a messgage is received
server.on('published', (packet, client) => {

  console.log('Packet: ', packet)
  console.log('Packet payload: ')
  console.log(packet.payload.toString())
})


server.on('clientDisconnected', client => {
  console.log('Client Disconnected: ', client.id)
})

function setup() {
  // setInterval(() => {
  //   var message = {
  //     topic: '/hello/world',
  //     payload: 'abcde',
  //     qos: 0,
  //     retain: false
  //   }

  //   server.publish(message, () => {
  //     console.log('done!')
  //   })
  // }, 2000)
  // console.log('Mosca server is up and running')


  setInterval(() => {
    var message = {
      topic: '/totalvalues',
      payload: 'get',
      qos: 0,
      retain: false
    }

    server.publish(message, () => {
      console.log('[PUBLISH] ', message.topic)
    })
  }, 5000)

  var message = {
    topic: '/switch/command',
    payload: 'off',
    qos: 0,
    retain: false
  }

  setInterval(() => {

    server.publish(message, () => {
      console.log('[PUBLISH] ', message.topic)
      message.payload = 'on' == message.payload ? 'off' : 'on'
    })
  }, 3000)
  console.log('Mosca server is up and running on ', moscaSettings.port)

  // server.subscribe('/totalvalues', () => {
  //   var message = {
  //     topic: '/',
  //     payload: 'some data',
  //     qos: 0,
  //     retain: false
  //   }

  //   server.publish(message, () => {
  //     console.log('[PUBLISH] client ', message.topic)
  //   })
  // })


  server.subscribe('/values', (topic, payload) => {
    console.log('topic: ', topic)
    console.log('payload: ', payload)

    try {
      var str = Buffer.from(payload).toString()
      console.log('buf string: ', str.substring(0, str.length - 2))
      var json = JSON.parse(str.substring(0, str.length - 2))
      console.log('json: ')
      console.log(json)
    } catch(e) {
      console.log(e)
    }

  })
}

