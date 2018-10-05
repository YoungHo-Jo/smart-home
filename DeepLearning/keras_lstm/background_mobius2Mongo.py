import requests
import json
import sys
import os
import time

sys.path.append("..")
from mongo import mongoDB
from datetime import datetime

MOBIUS_IP = '52.78.33.177'
MOBIUS_PORT = '7579'
MOBIUS_GET_ADDR = '/Mobius/smart-home/rssi/la'
MOBIUS_GET_ADDR_CURRENT = '/Mobius/smart-home/switch/la'

MOBIUS_REQ_ADDR = 'http://' + MOBIUS_IP + ':' + MOBIUS_PORT + MOBIUS_GET_ADDR
MOBIUS_REQ_ADDR_CURRENT = 'http://' + MOBIUS_IP + ':' + MOBIUS_PORT + MOBIUS_GET_ADDR_CURRENT


# BEACON_MAC_ADDR = '30:ae:a4:01:bf:a2'
header = {
	'Accept':'application/json',
	'X-M2M-RI':'12345',
	'X-M2M-Origin':'SOrigin'
}
mongodb = mongoDB()
plugs_data = dict()

r=requests.get(MOBIUS_REQ_ADDR, 
		headers = header)
json_str = r.json()
rssi_data = json_str['m2m:cin']['con']

while(1) :
	try:
		rssi_HashMap = dict()
		current_HashMap = dict()
		r=requests.get(MOBIUS_REQ_ADDR, 
				headers = header)
		r_current=requests.get(MOBIUS_REQ_ADDR_CURRENT, 
				headers = header)
		json_str = r.json()
		json_str_current = r_current.json()
		rssi_data = json_str['m2m:cin']['con']
		current_data = json_str_current['m2m:cin']['con']
		# {'00:0b:57:27:be:c6': False, '00:0b:57:27:c0:93': False, '00:0b:57:27:be:57': False, '00:0b:57:27:c0:7f': True}

		for plug in rssi_data :
			rssi_HashMap[plug] = rssi_data[plug]
		
		for plug in current_data :
			current_HashMap[plug] = (1 if current_data[plug] == True else 0)
		rssi_HashMap['timestamp'] = str(datetime.now())
		current_HashMap['timestamp'] = str(datetime.now())

		mongodb.putData(data = rssi_HashMap, tablename = 'rssi_real')
		mongodb.putData(data = current_HashMap, tablename = 'current')

	except Exception as e:
		 continue
	except KeyError as k :
		 continue


#     print("mac : {}, rssi {}".format(mac, rssi))
