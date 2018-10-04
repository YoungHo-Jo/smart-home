"""
    created by Arkenstone
    modified by Gyeongmin Kim
"""
__author__ = "Arkenstone"

import os
import sys
import pandas as pd
import numpy as np
# from sklearn.preprocessing import MinMaxScaler
# from trainingset_selection import TrainingSetSelection
from keras.models import Sequential, load_model, save_model
from keras.layers.recurrent import LSTM
from keras.layers.core import Dense, Dropout, Activation
from sklearn.model_selection import train_test_split
from livelossplot import PlotLossesKeras

from model_util import get_ids_and_files_in_dir, percentile_remove_outlier
from model_util import MinMaxScaler, NormalDistributionScaler, binning_date_y, seq2dataset, trainset_makeCSV

class KerasModel():
    def __init__(self,
                 input_dir,
                 input_filename,
                 output_dir,
                 output_filename_prefix,
                 training_field_length = 12,
                 timestep = 5,
                 scaler = 'mm',
                 **kwargs):
        """
        :param input_dir : directory contains the input files. Input will be used to make trainging data.
        :param input_filename : input file name what you want.
        :param output_dir : directory to save data after trained. default : input_dir
        :param output_filename : output file name what you want.  default : input_filename + result
        :param scaler: scale data set using - mm: MinMaxScaler, norm: NormalDistributionScaler
        :param **kwargs: lstm_output_dim=4: output dimension of LSTM layer;
                        activation_lstm='relu': activation function for LSTM layers;
                        activation_dense='relu': activation function for Dense layer;
                        activation_last='softmax': activation function for last layer;
                        drop_out=0.2: fraction of input units to drop;
                        np_epoch=25, the number of epoches to train the model. epoch is one forward pass and one backward pass of all the training examples;
                        batch_size=100: number of samples per gradient update. The higher the batch size, the more memory space you'll need;
                        loss='categorical_crossentropy': loss function;
                        optimizer='rmsprop'
        """
        self.input_dir = input_dir
        self.input_filename = input_filename
        self.output_dir = output_dir
        self.output_filename_prefix = output_filename_prefix
        self.training_field_length = training_field_length
        self.timestep = timestep
        self.scaler = scaler

        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

        self.test_size = kwargs.get('test_size', 0.2)
        self.lstm_output_dim = kwargs.get('lstm_output_dim', 8)
        self.activation_lstm = kwargs.get('activation_lstm', 'relu')
        self.activation_dense = kwargs.get('activation_dense', 'relu')
        # self.activation_lstm = kwargs.get('activation_lstm', 'elu')
        # self.activation_dense = kwargs.get('activation_dense', 'elu')
        self.activation_last = kwargs.get('activation_last', 'softmax')    # softmax for multiple output
        self.dense_layer = kwargs.get('dense_layer', 2)  # at least 2 layers
        self.lstm_layer = kwargs.get('lstm_layer', 2) # at least 2 layers
        self.drop_out = kwargs.get('drop_out', 0.2)
        self.nb_epoch = kwargs.get('nb_epoch', 25)
        self.batch_size = kwargs.get('batch_size', 1)
        # self.batch_size = kwargs.get('batch_size', 100)
        self.loss = kwargs.get('loss', 'categorical_crossentropy')
        self.optimizer = kwargs.get('optimizer', 'adam')


    def KerasModel_train(self, trainX, trainY, model_path):
        """
        :param trainX: training data set
        :param trainY: expect value of training data
        :param testX: test data set
        :param testY: expect value of test data
        :param model_path: h5 file to store the trained model
        :param override: override existing models
        :return: model after training
        """
        input_dim = trainX[0].shape[1]
        output_dim = trainY.shape[1]
        # print predefined parameters of current model:
        model = Sequential()
        # applying a LSTM layer with x dim output and y dim input. Use dropout parameter to avoid overfit
        model.add(LSTM(output_dim=self.lstm_output_dim,
                       input_dim=input_dim,
                       activation=self.activation_lstm,
                       dropout_U=self.drop_out,
                       return_sequences=True))
        for i in range(self.lstm_layer-2):
            model.add(LSTM(output_dim=self.lstm_output_dim,
                       activation=self.activation_lstm,
                       dropout_U=self.drop_out,
                       return_sequences=True ))
        # return sequences should be False to avoid dim error when concatenating with dense layer
        model.add(LSTM(output_dim=self.lstm_output_dim, activation=self.activation_lstm, dropout_U=self.drop_out))
        # applying a full connected NN to accept output from LSTM layer
        for i in range(self.dense_layer-1):
            model.add(Dense(output_dim=self.lstm_output_dim, activation=self.activation_dense))
            model.add(Dropout(self.drop_out))
        model.add(Dense(output_dim=output_dim, activation=self.activation_last))
        # configure the learning process
        model.compile(loss=self.loss, optimizer=self.optimizer, metrics=['accuracy'])
        # train the model with fixed number of epoches
        # model.fit(x=trainX, y=trainY, batch_size=self.nb_epoch, verbose=2, shuffle=False) 
        model.fit(x=trainX, y=trainY, nb_epoch=self.nb_epoch, batch_size=self.batch_size, callbacks=[PlotLossesKeras()])
        # model.fit(x=trainX, y=trainY, nb_epoch=self.nb_epoch, batch_size=self.batch_size, validation_data=(testX, testY))

        ##TODO : evalutate -> eval by timestep input sequently
        score = model.evaluate(trainX, trainY, self.batch_size)
        # print("Model evaluation: {}".format(score))
        # store model to json file
        save_model(model, model_path)


    @staticmethod
    def KerasModel_prediction(dataset, model_path):
        dataset = np.asarray(dataset)
        if not os.path.exists(model_path):
            raise ValueError("Lstm model not found! Train one first or check your input path: {}".format(model_path))
        model = load_model(model_path)
        predict_class = model.predict_classes(dataset)
        class_prob = model.predict_proba(dataset)
        return predict_class, class_prob


    def KerasModel_test(self, override=False):
        """
        :param override=Fasle: rerun the model prediction no matter if the expected output file exists
        :return: model file, model weights files, prediction file, discrepancy statistic bar plot file
        """

        ## 1. make training set file to csv from mongoDB
        trainset_makeCSV(self.input_dir, "rssiDummy1_final.csv")

        ## 2. each file convert to datafreame (csv -> pandas)
        filepath = self.input_dir + "/" + self.input_filename
        # print("Reading from file {}".format(enter_file))
        first_row_name = []
        first_row_name = np.append(first_row_name, ['rssi' + str(i) for i in range(1, 1+self.training_field_length)])
        first_row_name = np.append(first_row_name, ['current' + str(i) for i in range(1, 1+self.training_field_length)])

        df = pd.read_csv(filepath, header = None, names = first_row_name)
        df.index = range(len(df.index))
        # print("convert df from csv {}".format(df))


        # scale the train columns

        ## 4. Min Max -> scale control (Normalizate(defalut) or standardize)
        print("Scaling...")
        if self.scaler == 'mm':
            df, minVal, maxVal = MinMaxScaler(df, start_col_index=0, end_col_index=self.training_field_length)
        elif self.scaler == 'norm':
            df, meanVal, stdVal = NormalDistributionScaler(df, start_col_index=1, end_col_index=self.training_field_length+1)
        else:
            raise ValueError("Argument scaler must be mm or norm!")
        
        ## 5. extract special field domained by select_col
        for index in range(1,self.training_field_length+1) :
            # select_col : make first row -> field ['rssi1', .., 'rssi12', 'current1']
            select_col = []
            select_col = np.append(select_col, ['rssi' + str(i) for i in range(1, 1+self.training_field_length)])
            select_col = np.append(select_col, ['current' + str(index)])
            df_selected = df.ix[:, select_col]
            # # remove outlier records
            # df_selected = percentile_remove_outlier(df_selected, filter_start=1, filter_end=2+self.training_set_length)

            # ## 6. train, validate, test set
            # print("Randomly selecting training set and test set...")
            train_x, train_y = seq2dataset(df_selected.values, self.timestep)
            # all_data_x = np.asarray(df_bin.ix[:, 1:1+self.training_field_length]).reshape((len(df_bin.index), 1, self.training_field_length))
            # all_data_y = np.asarray(df_bin.ix[:, 1+self.training_field_length])
            # convert y label to one-hot dummy label
            y_dummy_label = np.asarray(pd.get_dummies(pd.DataFrame(train_y)))
            print("y_dummy_label : %d one-hot dummy vectors created" %(y_dummy_label.shape[0]))

            # # format train, test, validation data
            # sub_train, val_train, sub_test, val_test = train_test_split(all_data_x, y_dummy_label, test_size=self.test_size)
            # train_x, test_x, train_y, test_y = train_test_split(sub_train, sub_test, test_size=self.test_size)
            # # create and fit the NN model

            # ## 7. config model path 
            model_save_path = self.output_dir + "/" + self.output_filename_prefix + "-" + str(index) + ".h5"
            print("notice :: model will save to {}".format(model_save_path))
            # # check if model file exists

            # ## 8. model train
            if not os.path.exists(model_save_path) or override:
                self.KerasModel_train(train_x, train_y, model_path=model_save_path)
            # # generate prediction for training

            # ## 9. model predict
            # print("Predicting the output of validation set...")
            # val_predict_class, val_predict_prob = self.KerasModel_prediction(val_train, model_save_path=model_save_path)
            # # statistic of discrepancy between expected value and real value
            # total_sample_count = len(val_predict_class)
            # val_test_label = np.asarray([list(x).index(1) for x in val_test])
            # match_count = (np.asarray(val_predict_class) == np.asarray(val_test_label.ravel())).sum()
            # print("Precision using validation dataset is {}".format(float(match_count) / total_sample_count))

