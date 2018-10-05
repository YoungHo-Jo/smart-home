"""
    created by Arkenstone
    modified by Gyeongmin Kim
"""
__author__ = "Arkenstone"

import os
import sys
import pandas as pd
import numpy as np
import tensorflow as tf
import keras

from keras import backend as K
from keras.models import Sequential, load_model, save_model
from keras.layers import LSTM, Dense, Flatten
from keras.utils import np_utils
from sklearn.model_selection import train_test_split
from livelossplot import PlotLossesKeras
from kerasModel_util import DataSet_Util, LossHistory



# from model_util import get_ids_and_files_in_dir, percentile_remove_outlier, MinMaxScaler, NormalDistributionScaler
# from model_util import seq2dataset, trainset_makeCSV, preprocessing_nSNE

# config = tf.ConfigProto(log_device_placement=True)
# config.gpu_options.allow_growth = True
# sess = tf.Session(config=config) 
# keras.backend.set_session(sess)

class KerasModel(DataSet_Util):
    def __init__(self,
                 input_dir,
                 output_dir,
                 **kwargs):
        """
        :param input_dir : directory contains the input files. Input will be used to make trainging data.
        :param output_dir : directory to save data after trained. default : input_dir
        :param **kwargs: lstm_output_dim=4: output dimension of LSTM layer;
                        activation_lstm='relu': activation function for LSTM layers;
                        activation_dense='relu': activation function for Dense layer;
                        activation_last='softmax': activation function for last layer;
                        drop_out=0.2: fraction of input units to drop;
                        np_epoch=25, the number of epoches to train the model. epoch is one forward pass and one backward pass of all the training examples;
                        batch_size=100: number of samples per gradient update. The higher the batch size, the more memory space you'll need;
                        loss='': loss function;
                        optimizer='adam'
        """
        self.input_dir = input_dir
        self.output_dir = output_dir
        if not os.path.exists(self.input_dir):
            os.makedirs(self.input_dir)

        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

        self.lstm_output_dim = kwargs.get('lstm_output_dim', 8)
        self.activation_lstm = kwargs.get('activation_lstm', 'relu')
        self.activation_dense = kwargs.get('activation_dense', 'relu')
        self.activation_last = kwargs.get('activation_last', 'softmax')    # softmax for multiple output
        self.dense_layer = kwargs.get('dense_layer', 2)  # at least 2 layers
        self.lstm_layer = kwargs.get('lstm_layer', 2) # at least 2 layers
        self.drop_out = kwargs.get('drop_out', 0.2)
        self.nb_epoch = kwargs.get('total_epochs', 3000)
        self.batch_size = kwargs.get('batch_size', 1)
        self.total_plugs = kwargs.get('total_plugs', 4)
        self.timesteps = kwargs.get('timesteps', 10)
        self.train_size = kwargs.get('train_size', 300)

        self.features = self.total_plugs*2
        self.loss = kwargs.get('loss', 'categorical_crossentropy')
        self.optimizer = kwargs.get('optimizer', 'adam')

        # DataSet_Util.__init__(self,totalPlug = self.total_plugs, timesteps = self.timesteps, trainSize = self.train_size)


    def KerasModel_train(self, trainX, trainY, model_name = 'keras_trainResult_model.h5'):
        """
        :param trainX: training data set
        :param trainY: expect value of training data
        :param testX: test data set
        :param testY: expect value of test data
        :param model_path: h5 file to store the trained model
        :param override: override existing models
        :return: model after training
        """
        with K.tf.device('/gpu:0'):
            one_hot_vector = trainY.shape[1]
            
            print("****************************************")
            print("             train  info                     ")
            print("batch_size : {}".format(self.batch_size))
            print("timesteps : {}".format(self.timesteps))
            print("features : {}".format(self.features))
            print("activation : {}".format(self.activation_last))
            print("loss function : {}".format(self.loss))
            print("optimizer : {}".format(self.optimizer))
            print("total_epochs : {}\n".format(self.nb_epoch))

            print("trainX shape : {}".format(trainX.shape))
            print("trainY shape : {}".format(trainY.shape))
            print("one_hot_vector : {}".format(one_hot_vector))
            print("****************************************")

            model = Sequential()

            model.add(LSTM(128, stateful=True,
                        batch_input_shape=(self.batch_size, self.timesteps, self.features)))

            # model.add(LSTM(128, stateful=True, return_sequences = True,
            #             batch_input_shape=(self.batch_size, self.timesteps, self.features)))
            # model.add(LSTM(64, stateful=True))

            # model.add(Flatten())
            model.add(Dense(one_hot_vector, activation=self.activation_last))

            model.compile(loss=self.loss, optimizer=self.optimizer, metrics=['accuracy'])

            # train the model with fixed number of epoches
            for epo_idx in range(0,self.nb_epoch) :
                print ('epochs : ' + str(epo_idx) )
                model.fit(trainX, trainY, nb_epoch=1, verbose = 2, shuffle=False, batch_size=self.batch_size)
                model.reset_states()
                if (epo_idx+1) % 500 == 0 :
                    save_model(model, self.output_dir + '/' + model_name + '_epoch' + str(epo_idx+1) + '.h5')

            ##TODO : evalutate -> eval by timesteps input sequently
            score = model.evaluate(trainX, trainY, self.batch_size)
            # print("Model evaluation: {}".format(score))
            # store model to json file
            save_model(model, self.output_dir + '/' + model_name + '.h5')


    def KerasModel_test(self):
        """
        :param override=Fasle: rerun the model prediction no matter if the expected output file exists
        :return: model file, model weights files, prediction file, discrepancy statistic bar plot file
        """
        model_name = 'keras_trainResult_model'

        dataset_util = DataSet_Util(totalPlug = self.total_plugs, timesteps = self.timesteps, trainSize = self.train_size)
        dataSet = dataset_util.get_DataSet_from_mongoDB()
        self.batch_size = dataset_util.getBatchSize()

        train_x, train_y, test_x, test_y = dataset_util.make_dataSet(dataSet.values)

        # self.KerasModel_train(train_x, train_y, model_name = model_name)
        # print("notice :: model will save to {}".format(self.output_dir + '/' + model_name + '.h5'))
        predict_res = dataset_util.make_predict_dataSet(dataSet = dataSet, data_dir = self.input_dir, model_dir = self.output_dir, model_name = model_name, predict_times = 0)
        

