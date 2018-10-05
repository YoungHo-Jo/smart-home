import requests
import numpy as np
import pandas as pd
import json
import sys
import os
import time

sys.path.append("..")
from mongo import mongoDB
from datetime import datetime

"""
This is for save test on MongoDB(<-> interface)
the dataset will rssi value of plug1~4.

"""
mongo = mongoDB()

def getData() :

    filepath = "/Users/gyeongmin/Documents/Final_project/DeepLearning/data/rssi_test1.csv"

    first_row_name = []
    first_row_name = np.append(first_row_name, 'plug_state')
    first_row_name = np.append(first_row_name, 'current_state')
    # # first_row_name = np.append(first_row_name, ['rssi' + str(i) for i in range(1, 1+self.training_field_length)])
    # # first_row_name = np.append(first_row_name, ['current' + str(i) for i in range(1, 1+self.training_field_length)])

    df = pd.read_csv(filepath, header = None, names = first_row_name, sep = ' ')
    return df

def getSchema(tablename = 'rssi', plugnum = 1) :
    plug_data = ({
        "title": "DeepLearning",
        "plug1" :   1 if plugnum == 1 else 0,
        "plug2" :   1 if plugnum == 2 else 0,
        "plug3" :   1 if plugnum == 3 else 0,
        "plug4" :   1 if plugnum == 4 else 0,
        "timestep" : str(datetime.utcnow())
    })

def makeData(dataSet) :
    # print(dataSet)
    plug = dataSet["plug_state"]
    current = dataSet["current_state"]
    for p in plug :
        print(p)
    for c in current :
        print(c)
        # print(name)
        # print("name : {}, values : {}".format(name, values))

        # print("plug : {}, current : {}".format(data[0], data[1]))

    # mongo.putData(data = plug_data, tablename = 'predict')

def main() :
    print("main")
    dataSet = getData()
    makeData(dataSet)


if __name__ == '__main__' :
    main()