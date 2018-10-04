import requests
import json
import sys
import os
import time
import pandas as pd

sys.path.append("..")
from mongo import mongoDB
from datetime import datetime

mongodb = mongoDB()
plugs_data = dict()
rssi_HashMap = dict()

file_name ='/Users/gyeongmin/Documents/Final_project/DeepLearning/data/keras_trainResult_model_default_dataset_batch.csv'
restore_data = pd.read_csv(file_name, sep = ',')
restore_data = restore_data[['plug1_rssi_00:13','plug2_rssi_00:25','plug3_rssi_00:72']]
print(restore_data)

for index,row in restore_data.iterrows() :
    rssi_HashMap['00:13'] = row['plug1_rssi_00:13']
    rssi_HashMap['00:25'] = row['plug2_rssi_00:25']
    rssi_HashMap['00:72'] = row['plug3_rssi_00:72']
    rssi_HashMap['timestamp'] = str(datetime.utcnow())
    mongodb.putData(data = rssi_HashMap, tablename = 'rssi_real')



