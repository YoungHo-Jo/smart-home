import requests
import pandas as pd

from random import randint
from datetime import datetime

class mongoDB :
    def __init__(self, rssi_data = [], current_data = [], ipAddress = '0.0.0.0', portAddress = '90') :
        self.rssi       = rssi_data
        self.current    = current_data 
        self.ip         = ipAddress
        self.port       = portAddress
        self.param      = '/api'
    
    def getUrl(self) :
        urlHeader = ('http://' +
               self.ip   + ':' + 
               self.port + 
               self.param
        )
        return urlHeader
    
    def sampleData(self) :
        print("[MONGO] makejsonData")
        json_data = ({ 
            # "title": "DeepLearning",
            # "time" : "2018-08-22T22:09:00", 
            "time" : str(datetime.now()), 
            "rssi_data" : self.rssi, 
            "current_data" : self.current 
        })
        return json_data
    
    def getRequest(self, url) :
        request = requests.get(url)
        reponse = request.json()
        
        return reponse
    
    def postRequest(self, url, json_data) :
        request = requests.post(url=url, data=json_data)
        reponse = request.json()

        return reponse

    def getAllDatas(self, tablename = 'rssi_test') :
        res = self.getRequest(self.getUrl() + '/' + tablename + '/all')
        # print("[res] : " + str(res))
        return res

    ### TODO : getData by time? 
    def getData(self, id, tablename = 'rssi_test') :
        res = self.getRequest(self.getUrl() + '/' + tablename + '/' + id)
        # print("[res] : " + str(res))

    def putData(self, data = None, tablename = 'rssi_test') :
        if data :
            res = self.postRequest(self.getUrl() + '/' + tablename + '/save', data)
        else : 
            res = self.postRequest(self.getUrl() + '/' + tablename + '/save', self.sampleData())
        # print("[res] : " + str(res))

            




def main() :
    # # test_rssi = [1,2,3,4,5,6,7,8,9,10,11,12]
    # # test_current = [0,0,0,0,0,1,1,1,1,1,1,0]            
    # for i in range(0, 1e9) :
    #     json_data = ({ 
    #         "title": "DeepLearning",
    #         # "time" : "2018-08-22T22:09:00", 
    #         "plug1" :   (i/100) % 2
    #         "plug2" :   (i/1000) % 2
    #         "plug3" :   (i/10000) % 2
    #         "plug4" :   (i/100000) % 2
    #         "timestep"         : str(datetime.now())
    #     })
    #     print(json_data)
    #     # json_data = ({ 
    #     #     "title": "DeepLearning",
    #     #     # "time" : "2018-08-22T22:09:00", 
    #     #     "time"         : str(datetime.now()), 
    #     #     "rssi_data"    : test_rssi, 
    #     #     "current_data" : test_current,
    #     #     "cluster_num"  : 11,
    #     #     "cluster_knn"  : 22
    #     # })

    ## 1. construct 
    # mongodb = mongoDB(rssi_data = test_rssi, current_data = test_current)
    mongodb = mongoDB()

    ## 2. method
    # mongodb.getAllDatas(tablename = 'predict')
    # mongodb.getAllDatas()
    # mongodb.putData()                   # follow Schema
    # mongodb.putData(data = json_data)   # Not related to Schema
    

if __name__ == '__main__' :
    main()

"""
### example
    [require] pip install requests

    ## 0. global variable for Test
    test_rssi = [1,2,3,4,5,6,7,8,9,10,11,12]
    test_current = [0,0,0,0,0,1,1,1,1,1,1,0]            
    json_data = ({ 
        # "title": "DeepLearning",
        # "time" : "2018-08-22T22:09:00", 
        "time"         : str(datetime.now()), 
        "rssi_data"    : test_rssi, 
        "current_data" : test_current,
        "cluster_num"  : 11,
        "cluster_knn"  : 22
    })

    ## 1. construct 
    mongodb = mongoDB(rssi_data = test_rssi, current_data = test_current)

    ## 2. method
    mongodb.getAllDatas()
    mongodb.putData()                   # follow Schema
    mongodb.putData(data = json_data)   # Not related to Schema

"""
