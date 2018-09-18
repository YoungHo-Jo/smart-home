const noble = require('noble')
const readline = require('readline')

readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)

noble.on('stateChange', (state) => {
  if(state == 'poweredOn') {
    noble.startScanning()
  } else {
    noble.stopScanning()
  }
})

var perip = null


noble.on('discover', (peripheral) => {
  noble.stopScanning()

  perip = peripheral
  console.log(peripheral)

  console.log('continue? ')
})

process.stdin.on('keypress', (str, key) => {
  if(key.ctrl && key.name === 'c') {
    process.exit()
  } else if(key.name === 'g' ) {
    console.log('go')
    noble.startScanning()      
  } else if(key.name === 'c') {
    perip.connect((err) => {
      if(err) {
        console.log(err)
      } else {
        console.log('Connected')
      }
    })
  }
})