import keras
import tensorflow as tf
import pandas as pd
import numpy as np
import os
import sys
import csv
sys.path.append("..")

from sklearn.preprocessing import MinMaxScaler

from keras.models import Sequential
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
                ):
        self.totalPlug = totalPlug
        self.timesteps = timesteps
        self.trainSize = trainSize
        self.features = self.totalPlug*2
    
    def get_DataSet_from_mongoDB(self) :
        pd_drop = ['_id', 'timestep','__v']

        mongo = mongoDB()
        getData = mongo.getAllDatas(tablename = 'rssi_real')
        # print(getData)

        dataset = pd.DataFrame(getData)
        dataset_plugs = dataset.drop(pd_drop, axis=1)
        dataset_plugs = dataset_plugs.fillna(0)
        dataset_plugs.apply(pd.to_numeric, errors='ignore')

        dataset_plugs_list = []
        append_list = [0,0,0]
        for index, row in dataset_plugs.iterrows():
            row_to_float = pd.to_numeric(row)
            # df_list = pd.to_numeric(row).values.tolist()
            df_list = row_to_float.round(0).astype(int).values.tolist()
            df_list = df_list + append_list
            dataset_plugs_list.append(df_list)
            
        dataset_plugs = pd.DataFrame(dataset_plugs_list)

        return dataset_plugs

    def make_dataSet(self, dataSet) :
        train_X, train_Y = [], []
        test_X, test_Y = [], []

        print(len(dataSet))
        print(self.timesteps)
        scaled_dataSet = self.MinMaxScaler(dataSet)
        for i in range(0, len(dataSet)-self.timesteps):
            data = scaled_dataSet[i:(i+self.timesteps+1)]
            for d in range(len(data)-1):
                train_X.append(self.encoding_dataSet_X(data[d]))

        for i in range(self.timesteps,len(dataSet)) :
            train_Y.append([self.encoding_dataSet_Y(dataSet[i])])
        
        train_X = np.array(train_X)
        train_Y = np.array(train_Y)
        

        train_X = np.reshape(train_X, (np.size(train_Y,0), self.timesteps, self.features))
        train_Y = self.encoding_dataSet_Y_to_HashMap(train_Y)
        train_Y = np_utils.to_categorical(train_Y)

        return np.array(train_X), np.array(train_Y)

    def encoding_dataSet_X(self, data) :
        features = []
        for feature in data :
            features.append(feature)
        return features

    def encoding_dataSet_Y(self, dataSet_Y) :
        dataSet_rssi = dataSet_Y.T[:self.totalPlug]
        dataSet_current = dataSet_Y.T[self.totalPlug:]
        dataNum_Y = self.encoding_RSSI(dataSet_rssi) + self.encoding_Current(dataSet_current)
        print(dataNum_Y)

        return dataNum_Y
        
    def encoding_RSSI(self, dataSet_rssi) :
        ans = 0

        dataSet_rssi_list = np.array(dataSet_rssi.tolist())
        print(dataSet_rssi_list)
        
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

    def decoding_dataNum_Y(self, dataNum_y) :
        decodingSet_rssi = []
        decodingSet_current = []
        decodingSet = []

        currentnum, rssinum = 0,0
        for i in range(self.totalplug) :
            rssinum += datanum_y % 60**(i+1)
            datanum_y -= datanum_y % 60**(i+1)
        currentnum = int(datanum_y / 60**self.totalplug)
        
        for index in range(self.totalplug) :
            decodingset_current.append(currentnum>>index & 1)
            decodingset_rssi.append(15+int(rssinum / 60**index) % 60)
        
        decodingset = decodingset_rssi + decodingset_current
        
        return np.array(decodingset)
    
    def MinMaxScaler(self, dataSet) :
        """
        find col min values and max values of numpy
        """
        minvalue = []
        maxvalue = []
        maxvalue = np.max(dataSet, axis = 0)
        minvalue = np.min(dataSet, axis = 0) 

        df =  pd.DataFrame(dataSet,dtype = float)
        for index in range(self.totalPlug) :
            df.ix[:, index] = df.ix[:, index].apply(
                lambda x: (x - minvalue[index]) / (maxvalue[index] - minvalue[index]))

        dataSet = df.values
        return dataSet

    def encoding_dataSet_Y_to_HashMap(self, dataSet_Y) :
        #TODO : make hash table that hash file
        hashTable = dict()
        hash_filePath = '../data'
        hash_fileName = 'DL_HashMap4DataSetY.csv'
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

    
    def decoding_HashMap_to_dataSet_Y(self,hash_dataSet_Y) :
        hash_filePath = '../data'
        hash_fileName = 'DL_HashMap4DataSetY.csv'
        #TODO : dataSet_y should load from hashtable file
        with open(hash_filePath+'/'+hash_fileName, 'r') as infile:  # Just use 'w' mode in 3.x
            reader = csv.reader(infile)
            hashTable = dict((int(rows[0]),int(rows[1])) for rows in reader)
        
        dataSet_Y = []

        for data_value in hash_dataSet_Y :
            data_value = data_value[0]
            for key, value in hashTable.items():    # for name, age in dictionary.iteritems():  (for Python 2.x)
                if data_value == value :
                    dataSet_Y.append([key])
        
        return dataSet_Y
        
                
        
        
        
        



def main() :

    convert_dataset = DataSet_Util(totalPlug = 3, timesteps = 10, trainSize = 300)
    dataSet = convert_dataset.get_DataSet_from_mongoDB()

    # train_x, train_y, test_x, test_y = convert_dataset.make_dataSet(dataSet.values)
    train_x, train_y = convert_dataset.make_dataSet(dataSet.values)

    model = Sequential()
    model.add(LSTM(128, batch_input_shape = (2, 10, 6), stateful=True))
    model.add(Dense(train_y.shape[1], activation='softmax'))
        
    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

    num_epochs = 2000

    history = LossHistory()
    history.init()

    for epoch_idx in range(num_epochs):
        print ('epochs : ' + str(epoch_idx) )
        model.fit(train_x, train_y, epochs=1, batch_size=2, verbose=2, shuffle=False, callbacks=[history]) # 50 is X.shape[0]
        # model.reset_states()
        
    

if __name__ == '__main__' :
    main()