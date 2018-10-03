import io from 'socket-io-client'

const socket = io('http://localhost')

socket.on('switch', msg => {
  console.log(msg)
})


socket.on('amps', msg => {
  console.log(msg)
})