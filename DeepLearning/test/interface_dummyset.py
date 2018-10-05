import requests
import json
import sys
import os
import time

sys.path.append("..")
from mongo import mongoDB
from datetime import datetime, timedelta

"""
This is for save test on MongoDB(<-> interface)
the dataset will rssi value of plug1~4.

"""
def putData() :
    time = datetime.utcnow() - timedelta(days=1)
    mongo = mongoDB()

    for i in range(0, 86400) : 
        time = time + timedelta(seconds=1)
        plug_data = ({
            "title": "DeepLearning",
            "plug1" :   int((i/5400) % 2),
            "plug2" :   int((i/10800) % 2),
            "plug3" :   int((i/21600) % 2),
            "plug4" :   int((i/43200) % 2),
            "timestep" : str(time)
        })

        mongo.putData(data = plug_data, tablename = 'predict')


def main() :
    putData()



if __name__ == '__main__' :
    main()