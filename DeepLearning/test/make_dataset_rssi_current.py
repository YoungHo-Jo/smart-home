import requests
import json
import numpy as np
import pandas as pd
import sys
import os
import time

sys.path.append("..")
from mongo import mongoDB
from datetime import datetime
def get_DataSet_from_mongoDB() :
    pd_drop = ['_id', 'timestamp','__v']
    # pd_drop = ['_id', 'timestep','__v']

    mongo = mongoDB()
    getData_rssi = mongo.getAllDatas(tablename = 'rssi_real')
    getData_current = mongo.getAllDatas(tablename = 'current')
    # print(getData)

    dataset_rssi = pd.DataFrame(getData_rssi)
    dataset_current = pd.DataFrame(getData_current)
    # dataset = dataset.drop(dataset.index[:101]) #remove
    dataset_plugs_rssi = dataset_rssi.drop(pd_drop, axis=1)
    dataset_plugs_rssi = dataset_plugs_rssi.fillna(0)
    dataset_plugs_rssi.apply(pd.to_numeric, errors='ignore')

    dataset_plugs_current = dataset_current.drop(pd_drop, axis=1)
    dataset_plugs_current = dataset_plugs_current.fillna(0)
    dataset_plugs_current.apply(pd.to_numeric, errors='ignore')

    # plugs_mac = list(dataset_plugs)
    # for index, plug_mac in enumerate(plugs_mac) :
    #     plug_number = 'plug' + str(index+1)
    #     self.plugs_map[plug_number] = plug_mac
    
    dataset_plugs_list = []
    for (index_rssi, row_rssi), (index_current, row_current) in zip(dataset_plugs_rssi.iterrows(), dataset_plugs_current.iterrows()):
        row_to_float_rssi = pd.to_numeric(row_rssi)
        row_to_float_current = pd.to_numeric(row_current)
        # df_list = pd.to_numeric(row).values.tolist()
        df_list_rssi = row_to_float_rssi.round(0).astype(int).values.tolist()
        df_list_current = row_to_float_current.round(0).astype(int).values.tolist()

        dataset_plugs_list.append(df_list_rssi+df_list_current)
        
    dataset_plugs = pd.DataFrame(dataset_plugs_list)
    return dataset_plugs

def main() :
    res = get_DataSet_from_mongoDB()
    print(res)

if __name__ == '__main__' :
    main()