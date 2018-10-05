import requests
import json
import sys
import os
import time

MOBIUS_IP = '52.78.33.177'
MOBIUS_PORT = '7579'
MOBIUS_GET_ADDR = '/Mobius/smart-home/rssi/la'

MOBIUS_REQ_ADDR = 'http://' + MOBIUS_IP + ':' + MOBIUS_PORT + MOBIUS_GET_ADDR
header = {
        'Accept':'application/json',
        'X-M2M-RI':'12345',
        'X-M2M-Origin':'SOrigin'
    }

while(1) :

    r=requests.get(MOBIUS_REQ_ADDR, 
                    headers = header)
    json_str = r.json()
    # print(json['30:ae:a4:01:bf:a2'])
    # json1_data = json.loads(r.josn)[2]
    # print(r.json())
    # print(json1_data)
    rssi_value = json_str['m2m:cin']['con']['00:0b:57:27:be:c6']['30:ae:a4:01:bf:a2']
    print(json_str['m2m:cin']['con']['00:0b:57:27:be:c6']['30:ae:a4:01:bf:a2'])
    time.sleep(0.5)

