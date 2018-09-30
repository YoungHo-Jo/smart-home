var noble = require('noble')

var serviceUUIDs = ['9fb311cd757144acbe565b94800e0fcb']
var characteristicUUIDs = {
  rssi: 'a0f0c5f2bd9048a3a995af7add851d17',
  switch: 'bce811bbd35a41318751b6b376c3652a',
  current: 'b9c5cf6fec904ae9b2ebefccbc01595d'
}
const CENTRAL = '[CENTRAL]'

var connectedPeripherals = {} 
var RSSIs = {}
var switchStates = {}
var currentValues = {}

let errTypes = {
  connectionError: 'Connection Error',
  discoverAllServicesAndCharacteristicsError: 'Discover All Services And Characteristics Error', 
  subscribingError: 'subscribing Error',
  readError: 'Read Error',
  writeError: 'Write Error'
}

console.log(`${CENTRAL} Start BLE Central App`)
noble.on('stateChange', (state) => {
  console.log(`${CENTRAL} State Changed to ${state}`)

  if (state === 'poweredOn') {
    noble.startScanning(serviceUUIDs, false)
  } else {
    noble.stopScanning()
  }
})

noble.on('discover', (peripheral) => {
  console.log(`${CENTRAL} Discovered: ${peripheral.uuid}`)

  noble.stopScanning()

  console.log(`${CENTRAL} Connect to ${peripheral.uuid}`)

  try {
    peripheral.connect((err) => {

      if (err) {
        console.log(`${CENTRAL} Error Ocurred during connecting to ${peripheral.uuid}`)
        console.log(err)

        console.log(`${CENTRAL} Start scanning `)
        noble.startScanning(serviceUUIDs, false)
      } else {
        console.log(`${CENTRAL} Successfully Connected to ${peripheral.uuid}`)

        console.log(`${CENTRAL} Discover all Services and Characteristics `)
        peripheral.discoverAllServicesAndCharacteristics((err, services, characteristics) => {

          // TODO: problem of discovering forever ... 
          if (err) {
            console.log(`${CENTRAL} Error Ocurred during Discovering All Services and Characteristics in ${peripheral.address}`)
            throw {
              err,
              type: errTypes.discoverAllServicesAndCharacteristicsError,
              peripheral: peripheral 
            }
          } else {

            var characteristicsOfPeripherals = {
              rssi: null,
              switch: null,
              current: null,
            }

            characteristics.forEach((characteristic) => {

              switch (characteristic.uuid) {

                case characteristicUUIDs.rssi:
                  characteristicsOfPeripherals.rssi = characteristic  
                  characteristic.subscribe((err) => {
                    if (err) {
                      console.log(`${CENTRAL} Error Ocurred during Subscribing ${characteristic.uuid} on ${peripheral.address}`)
                      throw {
                        err,
                        type: errTypes.subscribingError,
                        characteristic,
                        peripheral,
                      }

                    } else {
                      console.log(`${CENTRAL} Successfully Subscribing ${characteristic.uuid} on ${peripheral.address}`)

                      characteristic.on('data', (data, isNotification) => {

                        var MAC_RSSI = data.toString().split(" ")
                        
                        if(RSSIs[peripheral.address] === undefined) {
                          var dummyObj = {}
                          dummyObj[peripheral.address] = {}
                          var newRSSIs = Object.assign(RSSIs, dummyObj)
                          RSSIs = newRSSIs
                        } 
                        
                        if(RSSIs[peripheral.address][MAC_RSSI[0]] == undefined) {
                          var obj = {}
                          obj[MAC_RSSI[0]] = {
                            avg: 0,
                            arr: [
                              parseInt(MAC_RSSI[1])
                            ]
                          }
                          var newObj = Object.assign(RSSIs[peripheral.address], obj)
                          RSSIs[peripheral.address] = newObj
                        } else {
                          var avg = addRssi(peripheral.address, MAC_RSSI[0], parseInt(MAC_RSSI[1]))
                          if(MAC_RSSI[0] === '30:ae:a4:01:bf:a2') console.log('avg: ', avg)
                          RSSIs[peripheral.address][MAC_RSSI[0]].avg = avg
                        }
                        // var obj = {}
                        // obj[MAC_RSSI[0]] = MAC_RSSI[1]
                        // var newObj = Object.assign(RSSIs[peripheral.address], obj)
                        // RSSIs[peripheral.address] = newObj
                        
                        updateConnectedPeripheral(peripheral, characteristicsOfPeripherals)
                      })
                    }
                  })
                  break;

                case characteristicUUIDs.current:
                  characteristicsOfPeripherals.current = characteristic

                  characteristic.subscribe((err) => {
                    if (err) {
                      console.log(`${CENTRAL} Error Ocurred during Subscribing ${characteristic.uuid} on ${peripheral.address}`)
                      throw {
                        err,
                        type: errTypes.subscribingError,
                        characteristic,
                        peripheral,
                      }

                    } else {
                      console.log(`${CENTRAL} Successfully Subscribing ${characteristic.uuid} on ${peripheral.address}`)

                      characteristic.on('data', (data, isNotification) => {

                        var dummyObj = {}
                        dummyObj[peripheral.address] = data.toString()
                        var newCurrentValues = Object.assign(currentValues, dummyObj)
                        currentValues = newCurrentValues 
                      })
                    }
                  })

                  break;
                  
                case characteristicUUIDs.switch:

                  characteristicsOfPeripherals.switch = characteristic

                  characteristic.subscribe((err) => {
                    if (err) {
                      console.log(`${CENTRAL} Error Ocurred during Subscribing ${characteristic.uuid} on ${peripheral.address}`)
                      throw {
                        err,
                        type: errTypes.subscribingError,
                        characteristic,
                        peripheral,
                      }

                    } else {
                      console.log(`${CENTRAL} Successfully Subscribing ${characteristic.uuid} on ${peripheral.address}`)

                      characteristic.on('data', (data, isNotification) => {

                        var dummyObj = {}
                        dummyObj[peripheral.address] = (data[0] == 1) ? true : false
                        var newSwitchStates = Object.assign(switchStates, dummyObj)
                        switchStates = newSwitchStates
                      })
                    }
                  })
                  break;
              }
            })

            updateConnectedPeripheral(peripheral, characteristicsOfPeripherals)

            peripheral.once('disconnect', () => {
              console.log(`${CENTRAL} Disconnected: ${peripheral.address}`)

              delete connectedPeripherals[peripheral.address]
              delete currentValues[peripheral.address]
              delete RSSIs[peripheral.address]
              delete switchStates[peripheral.address]
            })

            noble.startScanning(serviceUUIDs, false)
          }
        })
      }
    })
  } catch(err) {

    err.peripheral.disconnect((err) => {
      if(err) {
        console.log(err)
      }
    })

    // TODO: Is this really needed? 
    // noble.startScanning(serviceUUIDs, false)
  }
})

noble.on('scanStart', () => {
  console.log(`Scan Start`)
})

noble.on('scanStop', () => {
  console.log(`Scan Stop`)
})

noble.on('warning', (msg) => {
  console.log(`Warning ${msg}`)
})

function updateConnectedPeripheral(peripheral, characteristicsOfPeripherals) {
  var dummyObj = {}
  dummyObj[peripheral.address] = {
    peripheral: peripheral,
    characteristics: characteristicsOfPeripherals
  }
  var newConnectedPeripherals = Object.assign(connectedPeripherals, dummyObj)            
  connectedPeripherals = newConnectedPeripherals
}

function setSwitch(peripheralAddress, state) {
  var peripheral = connectedPeripherals[peripheralAddress]
  if(peripheral) {
    connectedPeripherals[peripheralAddress].characteristics.switch.write(Buffer.from([state ? 0x01 : 0x00], false, (err) => {
      if (err) {
        console.log(`Error Ocurred during Writing to ${connectedPeripheral.switch}`)
        console.log(err)
      } else {
        console.log(`Successfully Writing to ${connectedPeripheral.switch} state: ${state}`)
      }
    }))
  } else {
    console.log(`${CENTRAL} Cannot write Switch State Because it's not connected`)
  }
}


module.exports = {
  connectedPeripherals: connectedPeripherals,
  setSwitch: setSwitch,
  RSSIs: RSSIs,
  currentValues: currentValues,
  switchStates: switchStates
}

setInterval(() => {
  // console.log(`RSSIs: `)
  // console.log(RSSIs)
  // console.log(`Current Values: `)
  // console.log(currentValues)
  // console.log(`Switch States: `)
  // console.log(switchStates)
  // console.log(Object.keys(connectedPeripherals))

}, 500)

// setInterval(() => {
//   // console.log('[RESET]')
//   Object.keys(connectedPeripherals).forEach(addr => {
//     if(RSSIs[addr]) {
//       RSSIs[addr] = {}
//     } else {
//       delete RSSIs[addr]
//     }
//   })
// }, 5000)

// setInterval(() => {
//   var addr = '00:0b:57:27:be:57'
//   var newState = switchStates[addr] ? false : true
//   console.log(`Set Switch State to ${newState}`)
//   setSwitch(addr, newState)

// } , 2000)

function getMedian(plug, mac, ratio = 1) {
  var minRSSI = RSSIs[plug][mac].arr[0]
  var maxRSSI = RSSIs[plug][mac].arr[0]
  var curMedian =  RSSIs[plug][mac].arr[0]
  var avg = 0

  RSSIs[plug][mac].arr.forEach((v, i) => {
    if(i == 0) return
    minRSSI = Math.min(minRSSI, v)
    maxRSSI = Math.max(maxRSSI, v)

    curMedian = (curMedian * i/(i+1) + v * 1/(i+1)).toFixed(2)
  })

  if(maxRSSI === minRSSI) return maxRSSI

  RSSIs[plug][mac].arr.forEach((v, i) => {
    avg += v + (v - curMedian)/(maxRSSI - minRSSI)*ratio
  }) 

  return (avg/RSSIs[plug][mac].arr.length).toFixed(2)
}

function addRssi(plug, mac, value, size = 60, cutRatio = 1) {
  var median = -1

  RSSIs[plug][mac].arr.push(value)
  if(RSSIs[plug][mac].arr.length === size) {
    median = getMedian(plug, mac)
    RSSIs[plug][mac].arr = RSSIs[plug][mac].arr.slice(size*cutRatio, size)
  }
  return median
}
