import paho.mqtt.client as mqtt
import paho.mqtt.subscribe as subscribe
import pandas as pd
import json
import time
import os
import sys
import csv
import requests
sys.path.append("..")

# from mongo import mongoDB
import threading
from keras.models import Sequential, load_model, save_model
from collections import defaultdict,OrderedDict
from kerasModel_util import DataSet_Util
lock = threading.Lock()

MOBIUS_IP = '52.78.33.177'
MOBIUS_PORT = 1883
# client.subscribe("/oneM2M/req/Mobius/Ssmart-home/json")

rssi_HashMap = defaultdict(list)
current_HashMap = defaultdict(list)
rssi_arr_size = 0
current_arr_size = 0


class HashMap_Thread(threading.Thread) :
    def __init__(self,
                mobius_ip = '52.78.33.177',
                mobius_port = 1883
                # mobius_port = 7579
                ) :

        threading.Thread.__init__(self)
        self.mobius_ip = mobius_ip
        self.mobius_port = mobius_port
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.plugs_map = dict()
        self.total_size = None
        self.total_plugs = None
        self.train_size = None
        self.batch_size = None
        self.features = None
        self.timesteps = None 
        self.dataset_util = None


        self.plugs_map['plug1'], self.plugs_map['plug2'], self.plugs_map['plug3'], self.plugs_map['plug4'],\
        self.total_size, self.train_size, \
        self.batch_size, self.features, self.timesteps = self.getDataSize()
        self.total_plugs = int(self.features/2)
        self.plugs_map = OrderedDict(sorted(self.plugs_map.items()))
        self.dataset_util = DataSet_Util(totalPlug = self.total_plugs,
                                        timesteps = self.timesteps,
                                        trainSize = self.train_size,
                                        totalSize = self.total_size,
                                        batchSize = self.batch_size)
        
        print("****************************************")
        print("             model  info                     ")
        print("total_size : {}".format(self.total_size))
        print("total_plugs : {}".format(self.total_plugs))
        print("train_size : {}".format(self.train_size))
        print("batch_size : {}".format(self.batch_size))
        print("features : {}".format(self.features))
        print("timesteps : {}".format(self.timesteps))

        # print("plug1 : {}".format(self.plugs_map['plug1']))
        # print("plug2 : {}".format(self.plugs_map['plug2']))
        # print("plug3 : {}".format(self.plugs_map['plug3']))
        print("****************************************")
    
    def run(self):
        print("run")
        self.client.connect(self.mobius_ip, self.mobius_port, 60)
        subscribe.callback(self.getData, "/oneM2M/req/Mobius/Ssmart-home/json", hostname= self.mobius_ip)

        self.client.loop_forever()


    def on_connect(self, client, userdata, flags, rc) :
        print("Connected with result code "+str(rc))
        # self.client.subscribe("/oneM2M/req/Mobius/Ssmart-home/json")

    # # The callback for when a PUBLISH message is received from the server.
    # def on_message(self, client, userdata, msg) :
    #     print(msg.topic+" "+str(msg.payload))
    #     client.publish("/oneM2m/res/Mobius/Ssmart-home/rssi/json","reply")

    def parse_mqtt2Json(self, message) :
        data_HashMap = dict()

        #pc ->m2m:sgn -> nev -> rep -> m2m:cin -> con
        msg_str = str(message)
        # print(msg_str)
        msg_str = msg_str[2:len(msg_str)-1]
        json_obj = json.loads(msg_str)
        json_data = json_obj['pc']['m2m:sgn']['nev']['rep']['m2m:cin']['con']
        for plug in json_data :
            data = json_data[plug]
            data_HashMap[plug] = int(float(data))
        print("parsing result ::{}".format(data_HashMap))

        return data_HashMap

    def getData(self, client, userdata, message) :
        msg_str = str(message.payload)
        # print("got MQTT :: Rssi {}".format(msg_str))
        global current_arr_size
        global rssi_arr_size
        global rssi_HashMap
        global current_HashMap
        try:
            msg_str = msg_str[2:len(msg_str)-1]
            json_obj = json.loads(msg_str)
            message_state = json_obj['pc']['m2m:sgn']['sur']
            # rssi_state = 'oneM2M/req/Mobius/Ssmart-home/rssi/sub-rssi'
            # current_state = 'oneM2M/req/Mobius/Ssmart-home/rssi/sub-switch'
            rssi_state = 'Mobius/smart-home/rssi/sub-rssi'
            current_state = 'Mobius/smart-home/switch/sub-switch'

            if message_state == rssi_state :
                plug_data = self.parse_mqtt2Json(message.payload)
                rssi_arr_size = min(self.timesteps+self.batch_size-1, rssi_arr_size+1)
                self.putData(plug_data, rssi_HashMap)

            if message_state == current_state :
                plug_data = self.parse_mqtt2Json(message.payload)
                current_arr_size = min(self.timesteps+self.batch_size-1,current_arr_size+1)
                self.putData(plug_data, current_HashMap)

        except Exception as e:
            print(e)
            
    def putData(self, src_hashmap, dest_hashmap):
        lock.acquire()
        try:
            for data_key, data_value in src_hashmap.items() :
                if len(dest_hashmap[data_key]) >= self.timesteps+self.batch_size-1 :
                    dest_hashmap[data_key].pop(0)
        
                dest_hashmap[data_key].append(data_value)
        
        finally:
            lock.release()
            

    def getDataSize(self) :
        csv_filePath = '../data'
        csv_fileName = 'DL_dataset_info.csv'
        with open(csv_filePath+'/'+csv_fileName, 'r') as infile:  # Just use 'w' mode in 3.x
            reader = csv.reader(infile)
            hashTable = dict((rows[0],rows[1]) for rows in reader)
        print(hashTable)

        return hashTable['plug1'], hashTable['plug2'], hashTable['plug3'], hashTable['plug4'],\
               int(hashTable['totalSize']), int(hashTable['trainSize']), \
               int(hashTable['batchSize']), int(hashTable['features']), int(hashTable['timesteps'])


class KerasModel_Prediction_MQTT() :
    def __init__(self,
                mobius_ip = '52.78.33.177',
                mobius_port = 1883
                # mobius_port = 7579
                ) :

        self.mobius_ip = mobius_ip
        self.mobius_port = mobius_port
        self.plugs_map = dict()
        self.total_size = None
        self.total_plugs = None
        self.train_size = None
        self.batch_size = None
        self.features = None
        self.timesteps = None 
        self.dataset_util = None
        self.client = mqtt.Client()

        self.plugs_map['plug1'], self.plugs_map['plug2'], self.plugs_map['plug3'], self.plugs_map['plug4'],\
        self.total_size, self.train_size, \
        self.batch_size, self.features, self.timesteps = self.getDataSize()
        self.total_plugs = int(self.features/2)
        self.plugs_map = OrderedDict(sorted(self.plugs_map.items()))
        self.dataset_util = DataSet_Util(totalPlug = self.total_plugs,
                                        timesteps = self.timesteps,
                                        trainSize = self.train_size,
                                        totalSize = self.total_size,
                                        batchSize = self.batch_size)
        
        # print("****************************************")
        # print("             model  info                     ")
        # print("total_size : {}".format(self.total_size))
        # print("total_plugs : {}".format(self.total_plugs))
        # print("train_size : {}".format(self.train_size))
        # print("batch_size : {}".format(self.batch_size))
        # print("features : {}".format(self.features))
        # print("timesteps : {}".format(self.timesteps))

        # # print("plug1 : {}".format(self.plugs_map['plug1']))
        # # print("plug2 : {}".format(self.plugs_map['plug2']))
        # # print("plug3 : {}".format(self.plugs_map['plug3']))
        # print("****************************************")
    def exec_prediction(self) :
        while True :
            if self.check_mapsize() == True :
                self.put_predict_data()

    def check_mapsize(self) :
        global rssi_arr_size
        global current_arr_size
        global rssi_HashMap
        global current_HashMap
        # print("{} vs {}".format(len(rssi_HashMap),self.total_plugs), end=' ')
        # print("{} vs {}".format(len(current_HashMap),self.total_plugs), end=' ')
        # print("{} vs {}".format(rssi_arr_size, self.timesteps+self.batch_size-1), end=' ')
        # print("{} vs {}".format(current_arr_size, self.timesteps+self.batch_size-1))

        if (len(rssi_HashMap) == self.total_plugs and
            len(current_HashMap) == self.total_plugs and
            rssi_arr_size >= self.timesteps+self.batch_size-1 and
            current_arr_size >= self.timesteps+self.batch_size-1) :
            return True
        return False
    
    def put_predict_data(self) :
        global rssi_HashMap
        global current_HashMap
        # self.rssi_HashMap, self.current_HashMap, self.plugs_map
        # (mac, list(value)), (mac, list(value)), (index, mac)
        dataSet_timestep = []
        dataSet_rssis = []
        dataSet_currents = []
        for plug_index, mac in self.plugs_map.items() :
            dataSet_rssis.append(rssi_HashMap[mac])
            dataSet_currents.append(current_HashMap[mac])
        dataSet_rssis = list(map(list, zip(*dataSet_rssis)))
        dataSet_currents = list(map(list, zip(*dataSet_currents)))
        for rssis, currents in zip(dataSet_rssis, dataSet_currents) :
            dataSet_timestep.append(rssis + currents)
        # print("dataSet_timestep : {}".format(dataSet_timestep))
        
        #shape : pd.dataFrame
        predict_model = self.dataset_util.make_predict_dataSet(dataSet = pd.DataFrame(dataSet_timestep), 
                                                                predict_times = 10, plugs_map = self.plugs_map)
        
        print("result predict :: {}".format(predict_model))
        #dataFrame to list
        #predict_model.values.tolist()
        self.res_to_webserver(predict_model)
    

    def res_to_webserver(self, result_model) :
        WEBSERVER_IP = '52.78.33.177'
        WEBSERVER_PORT = '7579'
        WEBSERVER_POST = '/~'

        WEBSERVER_ADDR = 'http://' + WEBSERVER_IP + ':' + WEBSERVER_PORT + WEBSERVER_POST 

        """
        FIX : header, params => webserver post
        "  header = {
        "      'Accept':'application/json',
        "      'X-M2M-RI':'12345',
        "      'X-M2M-Origin':'SOrigin'
        "  }
        "  headers = {'content-type': 'application/json'}
        "  params = {'sessionKey': '9ebbd0b25760557393a43064a92bae539d962103', 'format': 'xml', 'platformId': 1}
        """

        dataframe = result_model[result_model.columns[self.total_plugs:]]
        previous_frame = None
        aftertime = 0
        for _, row in dataframe.iterrows():
            current_frame = row.values.tolist()
            if previous_frame is None :
                previous_frame = current_frame
                continue
            plug_index = 1
            aftertime += 1
            for prev, cur in zip(previous_frame, current_frame) :
                if prev ^ cur == 1 :
                    res = self.res_json(plug_index, cur, aftertime)
                    self.client.connect(self.mobius_ip, self.mobius_port, 60)
                    self.client.publish("/prediction",res)
                    # requests.post(WEBSERVER_ADDR, params=params, data=json.dump(res), headers=headers)
                    print("res : {}".format(res))
                plug_index += 1
            previous_frame = current_frame

    def res_json(self, plug_index, current_state, aftertime) :
        """
        { plug: mac | plug name, predicted: false, after: 100}
        """
        res = ('{' +
                '"plug": "' + self.plugs_map['plug'+str(plug_index)] + '", ' +
                '"predicted": ' + ('true' if current_state else 'false') + ', ' +
                '"after": "' + str(aftertime) + 
                '"}')
        return res

        
    def getDataSize(self) :
        csv_filePath = '../data'
        csv_fileName = 'DL_dataset_info.csv'
        with open(csv_filePath+'/'+csv_fileName, 'r') as infile:  # Just use 'w' mode in 3.x
            reader = csv.reader(infile)
            hashTable = dict((rows[0],rows[1]) for rows in reader)
        print(hashTable)

        return hashTable['plug1'], hashTable['plug2'], hashTable['plug3'], hashTable['plug4'],\
               int(hashTable['totalSize']), int(hashTable['trainSize']), \
               int(hashTable['batchSize']), int(hashTable['features']), int(hashTable['timesteps'])


def main() :
    hashmap_thread = HashMap_Thread(mobius_ip = MOBIUS_IP, mobius_port = MOBIUS_PORT)
    hashmap_thread.start()

    print("kerasmodel!")
    kerasmodel_mqtt = KerasModel_Prediction_MQTT()
    print("kerasmodel! :: exec")
    kerasmodel_mqtt.exec_prediction()


if __name__ == '__main__' :
    main()