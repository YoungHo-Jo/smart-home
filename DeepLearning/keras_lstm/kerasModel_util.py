"""
" TODO
" should remove index :100(line 55)
"""
import keras
import tensorflow as tf
import pandas as pd
import numpy as np
import os
import sys
import csv
sys.path.append("..")

from sklearn.preprocessing import MinMaxScaler

from keras import backend as K
from keras.models import Sequential, load_model, save_model
from keras.layers import Dense, LSTM
from keras.utils import np_utils

from datetime import datetime
from mongo import mongoDB
from myjson import Json

class LossHistory(keras.callbacks.Callback):
    def init(self):
        self.losses = []
        
    def on_epoch_end(self, batch, logs={}):
        self.losses.append(logs.get('loss'))

class DataSet_Util() :
    def __init__(self,
                totalPlug = 4,
                timesteps = 10,
                trainSize = 400,
                totalSize = 800,
                batchSize = 1,
                ):
        self.totalPlug = totalPlug
        self.timesteps = timesteps
        self.trainSize = trainSize
        self.features = self.totalPlug*2
        self.totalSize = totalSize
        self.batchSize = batchSize
        self.plugs_map  = dict()
    
    def get_DataSet_from_mongoDB(self) :
        pd_drop = ['_id', 'timestamp','__v']
        pd_drop_current = ['_id', 'timestamp','__v','cmd']
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

        dataset_plugs_current = dataset_current.drop(pd_drop_current, axis=1)
        dataset_plugs_current = dataset_plugs_current.fillna(0)
        dataset_plugs_current.apply(pd.to_numeric, errors='ignore')

        plugs_mac = list(dataset_plugs_rssi)
        for index, plug_mac in enumerate(plugs_mac) :
            plug_number = 'plug' + str(index+1)
            self.plugs_map[plug_number] = plug_mac
        
        dataset_plugs_list = []
        for (index_rssi, row_rssi), (index_current, row_current) in zip(dataset_plugs_rssi.iterrows(), dataset_plugs_current.iterrows()):
            row_to_float_rssi = pd.to_numeric(row_rssi)
            row_to_float_current = pd.to_numeric(row_current)
            # df_list = pd.to_numeric(row).values.tolist()
            df_list_rssi = row_to_float_rssi.round(0).astype(int).values.tolist()
            df_list_current = row_to_float_current.round(0).astype(int).values.tolist()

            dataset_plugs_list.append(df_list_rssi+df_list_current)
            
        dataset_plugs = pd.DataFrame(dataset_plugs_list)

        self.totalSize = len(dataset_plugs)
        # self.trainSize = int(self.totalSize / 2)
        self.trainSize = self.totalSize
        self.batchSize = self.setBatchSize()
        self.features  = dataset_plugs.shape[1]
        self.totalPlug = int(self.features/2)

        self.save_dataSet_info()

        return dataset_plugs


    def make_dataSet(self, dataSet) :
        train_X, train_Y = [], []
        test_X, test_Y = [], []

        scaled_dataSet = self.MinMaxScaler(dataSet)
        for i in range(0, self.trainSize-self.timesteps):
            data = scaled_dataSet[i:(i+self.timesteps+1)]
            for d in range(len(data)-1):
                train_X.append(self.encoding_dataSet_X(data[d]))

        for i in range(self.timesteps,self.trainSize) :
            train_Y.append([self.encoding_dataSet_Y(dataSet[i])])
        
        for i in range(0, len(dataSet)-self.timesteps):
            data = scaled_dataSet[i:(i+self.timesteps+1)]
            for d in range(len(data)-1):
                test_X.append(self.encoding_dataSet_X(data[d]))

        for i in range(self.timesteps, len(dataSet)) :
            test_Y.append([self.encoding_dataSet_Y(dataSet[i])])
        

        train_X = np.array(train_X)
        train_Y = np.array(train_Y)
        test_X = np.array(test_X)
        test_Y = np.array(test_Y)
        

        train_X = np.reshape(train_X, (np.size(train_Y,0), self.timesteps, self.features))
        train_Y = self.encoding_dataSet_Y_to_HashMap(train_Y)
        train_Y = np_utils.to_categorical(train_Y)

        print("make_dataSet shape :: train X \n{}".format(train_X.shape))
        print("make_dataSet shape :: train Y \n{}".format(train_Y.shape))
        print("make_dataSet shape :: test X \n{}".format(test_X.shape))
        print("make_dataSet shape :: test Y \n{}".format(test_Y.shape))

        # print("make_dataSet :: train X \n{}".format(train_X))
        # print("make_dataSet :: train Y \n{}".format(train_Y))
        # print("make_dataSet :: test X \n{}".format(test_X))
        # print("make_dataSet :: test Y \n{}".format(test_Y))

        return np.array(train_X), np.array(train_Y), np.array(test_X), np.array(test_Y)


    def make_predict_dataSet(self,dataSet, data_dir = '../data', model_dir = '../output', model_name = 'keras_trainResult_model', predict_times = 0, plugs_map = None) :
        
        """
        TODO
        ----------
        Add predict batch(all day), realtime method

        predict step
        ----------------
        1. step predict Y from predict_dataset(X)
        2. Y decoding (onehot -> hashmap -> decoding {rssi,current}
        3. predict : {index, rssi,current}, real RSSI : (maybe from mongo?) compare, and save
        4. Y detech to predict_dataset(X) and return 1 while end of list
        5. Finish make predict dataset <-> compare Real RSSI value on MongoDB(dataset, ofcourse)
        6. Draw override two rssi dataset graph 
        """
        PREDICT_REALTIME = (True if predict_times > 0 else False)
        PREDICT_BATCH    = (True if predict_times == 0  else False)

        model_path = model_dir + '/' + model_name + '.h5'
        model = load_model(model_path)
        print("notice :: model will load from {}".format(model_path))
        # if all
        if PREDICT_REALTIME :
            print("predict dataset :: PREDICT MODE -> realtime")
            predict_dataSet = dataSet
            self.plugs_map = plugs_map
        if PREDICT_BATCH :
            print("predict dataset :: PREDICT MODE -> batch")
            predict_dataSet = dataSet.loc[0:self.batchSize-1+self.timesteps-1]
        # if specific time
        print("predict_datset :{}".format(predict_dataSet.shape))

        # predict_dataSet = dataSet
        # default predict_times : total dataset
        if PREDICT_BATCH :
            # predict_times = self.totalSize - (self.batchSize + self.timesteps - 1)    # predict total Size
            # predict_times = 60*60*24                                                  # predict a day Size
            predict_times = 60*30                                                       # predict an hour Size

        for predict_time in range(0,predict_times) :
            ## first init!
            predict_trainX_batch = []

            for batch in range(self.batchSize) :
                predict_trainX = []
                predict_dataSet_timesteps = predict_dataSet.loc[batch+predict_time:batch+predict_time+self.timesteps-1].values
                # print("init : {}".format(predict_dataSet_timesteps))
                data = self.MinMaxScaler(predict_dataSet_timesteps)
                for d in range(len(data)):
                    predict_trainX.append(self.encoding_dataSet_X(data[d]))
                predict_trainX = np.array(predict_trainX)
                predict_trainX_batch.append(predict_trainX)
        
            predict_y_hashNum = []
            predict_trainX = []
            predict_trainX_batch = np.reshape(predict_trainX_batch, (self.batchSize, self.timesteps, self.features))
            predict_y_one_hot = model.predict(predict_trainX_batch, batch_size=self.batchSize)

            for one_hot in predict_y_one_hot :
                indexNum = np.argmax(one_hot)
                predict_y_hashNum.append(indexNum)

            predict_y_hashNum = self.decoding_HashMap_to_dataSet_Y(predict_y_hashNum)
            predict_y = self.decoding_dataSet_Y(predict_y_hashNum)
            new_predict_data = pd.DataFrame([predict_y[-1].tolist()])
            predict_dataSet = predict_dataSet.append(new_predict_data, ignore_index=True)
            # print("time {}, append : {}".format(predict_time, new_predict_data))
            # print("predict_dataSet {}".format(predict_dataSet))

        # dataset_header = ['plug1', 'plug2', 'plug3', 'current1', 'current2', 'current3']
        dataset_header_rssi = []
        dataset_header_current = []

        for plug_index, mac in self.plugs_map.items() :
            dataset_header_rssi.append(plug_index+'_rssi_'+str(mac))
            dataset_header_current.append(plug_index+'_current_'+str(mac))

        dataset_header = dataset_header_rssi + dataset_header_current

        predict_dataSet = predict_dataSet.loc[self.batchSize-1+self.timesteps-1:]

        default_dataset_name = data_dir + '/' + model_name + '_default_dataset'
        predict_dataset_name = data_dir + '/' + model_name + '_predict_dataset'
        K.clear_session()

        #TODO : open csv if all_predict 
        if PREDICT_BATCH :
            predict_dataset_name += '_batch.csv'
            default_dataset_name += '_batch.csv'

            predict_dataSet.to_csv(predict_dataset_name, encoding='utf-8', sep=',', index=False, header = dataset_header)
            dataSet.to_csv(default_dataset_name, encoding='utf-8', sep=',',index=False, header = dataset_header)
            self.putData_csv(csv_filepath = predict_dataset_name, tablename= 'predict') 
            

        if PREDICT_REALTIME :
            predict_dataset_name += '_realtime.csv'
            predict_dataSet.to_csv(predict_dataset_name, encoding='utf-8', sep=',', index=False, header = dataset_header)
            
        return predict_dataSet
        


    def encoding_dataSet_X(self, data) :
        features = []
        for feature in data :
            features.append(feature)
        return features

    def encoding_dataSet_Y(self, dataSet_Y) :
        dataSet_rssi = dataSet_Y.T[:self.totalPlug]
        dataSet_current = dataSet_Y.T[self.totalPlug:]
        dataNum_Y = self.encoding_RSSI(dataSet_rssi) + self.encoding_Current(dataSet_current)

        return dataNum_Y
        
    def encoding_RSSI(self, dataSet_rssi) :
        ans = 0

        dataSet_rssi_list = np.array(dataSet_rssi.tolist())
        
        for index in range(len(dataSet_rssi_list)) :
            ans += 60**index * int(dataSet_rssi_list[index]-15)

        return ans
        
    def encoding_Current(self, dataSet_current) :
        ans = 0
        # dataSet_current_list = dataSet_current.index.values
        dataSet_current_list = np.array(dataSet_current.tolist())
        
        for index in range(len(dataSet_current_list)) :
            ans += 2**index * dataSet_current_list[index]

        return ans * (60**4)

    def decoding_dataSet_Y(self, dataSet) :
        decodingSet = []

        for data in dataSet :
            decodingSet_rssi = []
            decodingSet_current = []
            currentnum, rssinum = 0,0

            for i in range(self.totalPlug) :
                rssinum += data % 60**(i+1)
                data -= data % 60**(i+1)
            currentnum = int(data / 60**self.totalPlug)
            
            for index in range(self.totalPlug) :
                decodingSet_current.append(currentnum>>index & 1)
                decodingSet_rssi.append(15+int(rssinum / 60**index) % 60)
            
            decoding_dataset = decodingSet_rssi + decodingSet_current
            decodingSet.append(decoding_dataset)
        
        return np.array(decodingSet)
    
    def MinMaxScaler(self, dataSet) :
        """
        find col min values and max values of numpy
        """
        minvalue = 15
        maxvalue = 75
        # maxvalue = np.max(dataSet, axis = 0)
        # minvalue = np.min(dataSet, axis = 0) 

        df =  pd.DataFrame(dataSet,dtype = float)
        for index in range(self.totalPlug) :
            df.ix[:, index] = df.ix[:, index].apply(
                # lambda x: (x - minvalue[index]) / (maxvalue[index] - minvalue[index]))
                lambda x: (x - minvalue) / (maxvalue - minvalue))

        dataSet = df.values
        return dataSet

    def encoding_dataSet_Y_to_HashMap(self, dataSet_Y) :
        #TODO : make hash table that hash file
        hashTable = dict()
        hash_filePath = '../data'
        hash_fileName = 'DL_Hashmap_for_Dataset.csv'
        index = 0
        hash_dataSet_Y = []
        for data in dataSet_Y :
            data = data[0]
            if not data in hashTable:
                hashTable[data] = index
                index += 1
            hash_dataSet_Y.append([hashTable[data]])
        
        if not os.path.exists(hash_filePath):
            os.makedirs(hash_filePath)
        with open(hash_filePath+'/'+hash_fileName, 'w') as outfile:  # Just use 'w' mode in 3.x
            w = csv.writer(outfile)
            w.writerows(hashTable.items())

        return hash_dataSet_Y

    
    def decoding_HashMap_to_dataSet_Y(self,hash_dataSet) :
        hash_filePath = '../data'
        hash_fileName = 'DL_HashMap_for_DataSet.csv'
        #TODO : dataSet_y should load from hashtable file
        with open(hash_filePath+'/'+hash_fileName, 'r') as infile:  # Just use 'w' mode in 3.x
            reader = csv.reader(infile)
            hashTable = dict((int(rows[1]),int(rows[0])) for rows in reader)
        
        dataSet_Y = []

        for data_value in hash_dataSet :
            # data_value = data_value[0]
            dataSet_Y.append(hashTable[data_value])
            # for key, value in hashTable.items():    # for name, age in dictionary.iteritems():  (for Python 2.x)
            #     if data_value == value :
            #         dataSet_Y.append(key)
        
        return dataSet_Y

    def setBatchSize(self) :
        batchsize = self.trainSize - self.timesteps
        batch_desire_num = 2
        batch_presence_num = batch_desire_num

        while (batchsize % batch_presence_num) != 0 :
            batch_presence_num += 1 

        return batch_presence_num

    
    def getBatchSize(self) :
        return self.batchSize
    
    def save_dataSet_info(self) :
        save_filePath = '../data'
        save_fileName = 'DL_dataset_info.csv'
        dataSet_info = dict()
        dataSet_info['plug1'] = self.plugs_map['plug1']
        dataSet_info['plug2'] = self.plugs_map['plug2']
        dataSet_info['plug3'] = self.plugs_map['plug3']
        dataSet_info['plug4'] = self.plugs_map['plug4']
        dataSet_info['totalSize'] = self.totalSize
        dataSet_info['trainSize'] = self.trainSize
        dataSet_info['batchSize'] = self.batchSize
        dataSet_info['features'] = self.features
        dataSet_info['timesteps'] = self.timesteps
        print("****************************************")
        print("           dataSet   info                     ")
        for info_key, info_value in dataSet_info.items() :
            print("{} : {}".format(info_key, info_value))
        print("****************************************")
        
        with open(save_filePath + '/' + save_fileName, 'w') as outfile:  # Just use 'w' mode in 3.x
            w = csv.writer(outfile)
            w.writerows(dataSet_info.items())

    def get_predict_res(self) :
        print("get_predict_res :: {}".format(self.predict_dataSet))
        return self.predict_dataSet.values.tolist()

    def res_csv(self, plugs_state) :
        res = ({ 
            "title": "DeepLearning",
            self.plugs_map['plug1'] :  plugs_state[0],
            self.plugs_map['plug2'] :  plugs_state[1],
            self.plugs_map['plug3'] :  plugs_state[2],
            self.plugs_map['plug4'] :  plugs_state[3],
            "timestamp" : str(datetime.now())
        })
        return res
        
    def putData_csv(self, csv_filepath, tablename = 'predict') :
        mongodb = mongoDB()
        predict_data = pd.read_csv(csv_filepath)
        current_data = predict_data[predict_data.columns[self.totalPlug:]]
        for _, row in current_data.iterrows() :
            res = self.res_csv(row.values.tolist())
            mongodb.putData(data = res, tablename= tablename) 
            
                


def main() :

    convert_dataset = DataSet_Util(totalPlug = 3, timesteps = 10, trainSize = 300, batchSize = 145)
    dataSet = convert_dataset.get_DataSet_from_mongoDB()

    # train_x, train_y, test_x, test_y = convert_dataset.make_dataSet(dataSet.values)
    train_x, train_y, test_x, test_y = convert_dataset.make_dataSet(dataSet.values)

    # model = Sequential()
    # model.add(LSTM(128, batch_input_shape = (2, 10, 6), stateful=True))
    # model.add(Dense(train_y.shape[1], activation='softmax'))
        
    # model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

    # num_epochs = 2000

    # history = LossHistory()
    # history.init()

    # for epoch_idx in range(num_epochs):
    #     print ('epochs : ' + str(epoch_idx) )
    #     model.fit(train_x, train_y, epochs=1, batch_size=2, verbose=2, shuffle=False, callbacks=[history]) # 50 is X.shape[0]
    #     # model.reset_states()
        
    

if __name__ == '__main__' :
    main()