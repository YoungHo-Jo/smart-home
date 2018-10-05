import os
import sys
import pandas as pd
import numpy as np
import tensorflow as tf
import keras

sys.path.append("..")

from keras import backend as K
from keras.models import Sequential, load_model, save_model
from keras.layers.recurrent import LSTM
from keras.layers.core import Dense, Dropout, Activation
from sklearn.model_selection import train_test_split

from neural_network import KerasModel
from mongo import mongoDB
from myjson import Json

# config = tf.ConfigProto(log_device_placement=True)
# config.gpu_options.allow_growth = True
# sess = tf.Session(config=config) 
# keras.backend.set_session(sess)

def KerasModel_init() : 
        input_dir = "../data"
        output_dir = "../output"
        # input_dir = "/Users/gyeongmin/Documents/Final_project/DeepLearning/data"
        # output_dir = "/Users/gyeongmin/Documents/Final_project/DeepLearning/output"
        log_file_path = output_dir + "/Lstm_final_log.txt"

        ## myUtil decalre
        kwargs = {
                "batch_size" : 145,
                "total_epochs" : 2000,
                "total_plugs" : 4,
                "timesteps" : 10,
                "train_size" : 300
        }

        kerasmodel = KerasModel(input_dir=input_dir,
                                output_dir=output_dir,
                                **kwargs
                                )
        kerasmodel.KerasModel_test()

def main() :
        KerasModel_init()

if __name__ == '__main__' :
        main()



