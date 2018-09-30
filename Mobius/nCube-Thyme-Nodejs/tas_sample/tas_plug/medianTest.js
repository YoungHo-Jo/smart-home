function getMedian(rssiArray, ratio = 1/3) {
  var minRSSI = rssiArray[0]
  var maxRSSI = rssiArray[0]
  var curMedian = rssiArray[0]
  var avg = 0

  rssiArray.forEach((v, i) => {
    if(i == 0) return
    minRSSI = Math.min(minRSSI, v)
    maxRSSI = Math.max(maxRSSI, v)

    curMedian = (curMedian * i/(i+1) + v * 1/(i+1)).toFixed(2)
  })

  if(maxRSSI === minRSSI) return maxRSSI

  rssiArray.forEach((v, i) => {
    avg += v + (v - curMedian)/(maxRSSI - minRSSI)*ratio
  }) 

  return (avg/rssiArray.length).toFixed(2)
}

function addRssi(rssiArray, value, size = 10, cutRatio = 2/5) {
  var median = -1
  rssiArray.push(value)
  if(rssiArray.length == size) {
    median = getMedian(rssiArray)
    rssiArray = rssiArray.slice(size*cutRatio, size + 1)
  }
  return median
}

