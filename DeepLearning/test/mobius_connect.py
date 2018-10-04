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
# MOBIUS_GET_ADDR = '/Mobius/smart-home/plug/la'

MOBIUS_REQ_ADDR = 'http://' + MOBIUS_IP + ':' + MOBIUS_PORT + MOBIUS_GET_ADDR

BEACON_MAC_ADDR = '30:ae:a4:01:bf:a2'
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
rssi_HashMap = dict()

while(1) :
    try:
        r=requests.get(MOBIUS_REQ_ADDR, 
                        headers = header)
        json_str = r.json()
        # print(json_str)
        rssi_data = json_str['m2m:cin']['con']
        for plug in rssi_data :
            if BEACON_MAC_ADDR in rssi_data[plug] :
                rssi = rssi_data[plug][BEACON_MAC_ADDR]['avg']
                rssi_HashMap[plug] = rssi
                # print("mac : {}, rssi : {}".format(plug, rssi))
        rssi_HashMap['timestep'] = str(datetime.now())
        # print(rssi_HashMap)
        
        mongodb.putData(data = rssi_HashMap, tablename = 'rssi_real')

    except Exception as e:
        continue
    except KeyError as k :
        continue


        print("mac : {}, rssi {}".format(mac, rssi))