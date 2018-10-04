# zeroho.jo@gmail.com

import paho.mqtt.client as mqtt
import threading
import json

class MQTTGetter (threading.Thread):
  def __init__(self, stringArr):
    threading.Thread.__init__(self)
    self.client = mqtt.Client()
    self.stringArr = stringArr
    self.client.on_connect = self.on_connect
    self.client.on_message = self.on_message

  def run(self):
    print("run")
    self.client.connect("52.78.33.177", 1883, 60)
    self.client.loop_forever()

  def on_connect(self, client, userData, flags, rc):
    print('Connected with result code ' + str(rc))

    self.client.subscribe("/oneM2M/req/Mobius/Ssmart-home/json")

  def on_message(self, client, userData, msg):
      jsonStr = str(msg.payload)
      jsonStr = jsonStr[2:len(jsonStr) - 1]
      try:
        jsonObj = json.loads(jsonStr)
        print(jsonObj)
        rssi_data = jsonObj['pc']['m2m:sgn']['nev']['rep']['m2m:cin']['con']
        print('rssiData ')
        print(rssi_data)
        for plug in rssi_data:
            if BEACON_MAC_ADDR in rssi_data[plug] :
                rssi = rssi_data[plug][BEACON_MAC_ADDR]
                rssi_HashMap[plug] = rssi
      except Exception as e:
        print(e)
      self.stringArr.append(str(msg.payload))


stringArr = []

t = MQTTGetter(stringArr)
t.start()


def printit():
  threading.Timer(5.0, printit).start()
  print(stringArr)

# printit()

"""
	thread test
# tot = 0
# lock = threading.Lock()
# start_time = time.time()

# def add_total(amount) :
# 	global tot
# 	for i in range(10000000) :
# 		i
# 	tot += amount
# #	lock.acquire()
# #	try :
# #		tot += amount
# #	finally :
# #		lock.release()
# 	print(threading.currentThread().getName()+ "Not Synchronized :", tot)
# 	print("-- %s seconds--" %(time.time() - start_time))

# def main() :
# 	print("start_time" , start_time)
# 	for i in range(10) :
# 		my_thread = threading.Thread(
# 			target = add_total, args=(i,)
# 		)
# 		my_thread.start()

# if __name__ == '__main__' :
# 	main()
"""