## check TODO! : decoding -> make general method(It is just working on current, cluster)
from datetime import datetime
import numpy as np

class Json : 
    def __init__(self, _key = None, _value = None) :
        self.key    = _key
        self.value  = _value

    def encodingJsonString(self) :
        json_string = '{'
        for _key, _value in zip(self.key, self.value) :
            json_string += ('\'' + str(_key) + '\': ') 

            if type(_value).__module__ == np.__name__ :
                json_string += np.array2string(_value, separator=',')
            else :
                json_string += ('\'' + str(_value) + '\'') 

            json_string += ', ' if self.key[-1] != _key else ''
        json_string += '}'
        # print("[JSON] json_string : " + json_string)

        return json_string

    def encodingJson(self) :
        json_dict = {}
        for _key, _value in zip(self.key, self.value) :
            json_dict[str(_key)] = _value 

        # print("[JSON] json_dict : ", end='')
        # print(json_dict)

        return json_dict

    def decodingJson(self, data, key = None, seperate = True) :
        result_rssi = []
        result_current = []
        result_cluster = []
        result_concat = []
        # if key == None :
        #     # running sample method
        #     return
        # else :
        for line_dict in data :
            result_rssi.append(line_dict['rssi_data'])
            result_current.append(line_dict['current_data'])
            # result_cluster.append(line_dict['cluster_kmean'])
            
            if not seperate :
                result_concat_line = line_dict['rssi_data'] + line_dict['current_data'] + line_dict['cluster_kmean'].split()
                result_concat_line = line_dict['rssi_data'] + line_dict['current_data'].split()
                result_concat.append(result_concat_line)

        if not seperate : 
            return result_concat
        
        result_rssi    = np.array(result_rssi)
        result_current = np.array(result_current)
        # result_cluster = np.array(result_cluster)

        return result_rssi, result_current, result_cluster
            
                

        
            
### example
def main() : 
    ## 0. global variable for Test
    tag     = ['time', 'rssi_data', 'current_data', 'temp_data']
    time    = str(datetime.now())
    rssi    = np.array([1,2,3,4,5,6,7,8,9,10,11,12])
    current = np.array([0,0,0,0,0,1,1,1,1,1,0,0])
    data = [{'rssi_data': ['-66', '-78', '-65', '-80', '-72', '-75', '-79', '-75', '-82', '-77', '-80', '-80'], 'current_data': ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'], '_id': '5b7e7094b8223c01f5900273', 'time': '2018-08-23T17:30:12.302Z', 'cluster_kmean': '0', '__v': 0}, {'rssi_data': ['-66', '-78', '-65', '-80', '-72', '-75', '-79', '-75', '-82', '-77', '-80', '-80'], 'current_data': ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'], '_id': '5b7e7094b8223c01f5900274', 'time': '2018-08-23T17:30:12.314Z', 'cluster_kmean': '1', '__v': 0}, {'rssi_data': ['-66', '-78', '-64', '-80', '-72', '-75', '-79', '-75', '-82', '-77', '-80', '-80'], 'current_data': ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'], '_id': '5b7e7094b8223c01f5900275', 'time': '2018-08-23T17:30:12.320Z', 'cluster_kmean': '0', '__v': 0}]
    cluster = 1

    value   = [time, rssi, current, cluster]

    ## 1. constrct
    # Should have same size of tag as contents number of vlaue(vlaue.shape[0])
    myjson = Json(tag, value)

    ## 2. method
    myjson.encodingJsonString()     # return string
    myjson.encodingJson()           # return dictionary (recommand)
    current, cluster = myjson.decodingJson(data) # return json Object -> numpy
    total = myjson.decodingJson(data, seperate=False) # return json Object -> numpy


if __name__ == '__main__':
    main()
