var noble = require('noble')

var serviceUUIDs = ['9fb311cd757144acbe565b94800e0fcb']
var characteristicUUIDs = {
  rssi: 'a0f0c5f2bd9048a3a995af7add851d17',
  switch: 'bce811bbd35a41318751b6b376c3652a',
  current: 'b9c5cf6fec904ae9b2ebefccbc01595d'
}
var connectedPeripherals = []

var RSSIs = {}

let errTypes = {
  discoverAllServicesAndCharacteristicsError: 'Discover All Services And Characteristics Error', 
  subscribingError: 'Subscribing Error',
  readError: 'Read Error',
  writeError: 'Write Error'
}

console.log('Start BLE Central App')
noble.on('stateChange', (state) => {
  console.log(`State Changed to ${state}`)

  if (state === 'poweredOn') {
    noble.startScanning(serviceUUIDs, false)
  } else {
    noble.stopScanning()
  }
})

noble.on('discover', (peripheral) => {
  console.log(`Discovered: ${peripheral.uuid}`)

  // noble.stopScanning()

  console.log(`Connect to ${peripheral.uuid}`)

  try {
    peripheral.connect((err) => {

      if (err) {
        console.log(`Error Ocurred during connecting to ${peripheral.uuid}`)
        console.log(err)

        console.log(`Start scanning `)
        noble.startScanning(serviceUUIDs, false)
      } else {
        console.log(`Successfully Connected to ${peripheral.uuid}`)

        connectedPeripherals.push(peripheral)

        console.log(`Discover all Services and Characteristics `)


        peripheral.discoverAllServicesAndCharacteristics((err, services, characteristics) => {
          if (err) {
            console.log(`Error Ocurred during Discovering All Services and Characteristics in ${peripheral.uuid}`)
            throw {
              err,
              type: errTypes.discoverAllServicesAndCharacteristicsError,
              peripheral: peripheral 
            }
          } else {

            var characteristicsOfPeripherals = {
              peripheral: peripheral,
              rssi: null,
              switch: null,
              current: null,
              switchState: null,
              currentValue: null
            }

            characteristics.forEach((characteristic) => {

              switch (characteristic.uuid) {

                case characteristicUUIDs.rssi:
                  characteristic.subscribe((err) => {
                    if (err) {
                      console.log(`Error Ocurred during Subscribing ${characteristic.uuid}`)
                      throw {
                        err,
                        type: errTypes.subscribingError,
                        characteristic,
                        peripheral,
                      }

                    } else {
                      console.log(`Successfully Subscribing ${characteristic.uuid}`)

                      characteristicsOfPeripherals.rssi = characteristic  

                      characteristic.on('data', (data, isNotification) => {
                        // console.log(`Subscription Data on ${characteristic.uuid}, isNotification: ${isNotification}`)
                        // console.log(data)
                        // console.log(data.toString())

                        var MAC_RSSI = data.toString().split(" ")

                        RSSIs = {
                          ...RSSIs,
                          MAC_RSSI[0]: MAC_RSSI[1]
                        }
                      })
                    }
                  })
                  break;

                case characteristicUUIDs.current:
                  characteristicsOfPeripherals.current = characteristic

                  setInterval(() => {
                    characteristic.read((err, data) => {
                      if (err) {
                        console.log(`Error Ocurred during Reading ${characteristic.uuid}`)
                        throw {
                          err,
                          peripheral,
                          characteristic,
                          type: readError
                        }
                      } else {

                        
                        console.log(`[CURRENT]: Data on ${characteristic.uuid}`)
                        console.log(data)


                        // TODO: What is the type of the data 
                        // characteristicsOfPeripherals.currentValue = 
                      }
                    })
                  }, 500)
                  break;
                  
                case characteristicUUIDs.switch:

                  characteristicsOfPeripherals.switch = characteristic

                  setInterval(() => {
                    characteristic.read((err, data) => {
                      if (err) {
                        console.log(`Error Ocurred during Reading ${characteristic.uuid}`)

                        throw {
                          err,
                          peripheral,
                          characteristic,
                          type: errTypes.readError
                        }
                      } else {

                        
                        console.log(`[SWITCH] Data on ${characteristic.uuid}`)
                        console.log(data)
                        
                        characteristicsOfPeripherals.switchState = data === Buffer.from([0x01]) ? true : false
                      }
                    })
                  }, 500)
                  break;
              }
            })

            connectedPeripherals.push(characteristicsOfPeripherals)
          }
        })
      }
    })
  } catch(err) {

    // TODO: Delete added peripheral in the array
    // connectedPeripherals.includes()

    err.peripheral.disconnect((err) => {
      if(err) {
        console.log(err)
      }
    })

    // TODO: Is this really needed? 
    // noble.startScanning(serviceUUIDs, false)
  }
})


module.exports = {
  connectedPeripherals: connectedPeripherals,
  setSwitch: (connectedPeripheral, state) => {
    connectedPeripheral.switch.write(Buffer.from([state ? 0x01 : 0x00], false, (err) => {
      if (err) {
        console.log(`Error Ocurred during Writing to ${connectedPeripheral.switch}`)
        console.log(err)
      } else {
        console.log(`Successfully Writing to ${connectedPeripheral.switch} state: ${state}`)
      }
    }))
  },
  RSSIs: RSSIs 
}