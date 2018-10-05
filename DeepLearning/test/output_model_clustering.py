import matplotlib.pyplot as plt
import tensorflow as tf
import numpy as np
import pandas as pd
import requests
import json
import sys
import os
import time

sys.path.append("..")
sys.path.append("./tf-kalman")
sys.path.append("../keras_lstm")
from tfkalman import filters
from mongo import mongoDB
from datetime import datetime
from pylab import legend
from sklearn.cluster import AgglomerativeClustering 

import lstm_final as lstm
import model_util as util

import numpy as np
import pylab as pl

"""
This is for parsing MongoDB Data.
and preparing DL.
"""


def draw_PlugState(plugs_data) : 
    # plugs = list(plugs_data)
    # print(plugs)
    timestep = range(0,len(plugs_data.index))
    plugs = []
    for col_name in plugs_data.columns :
        plugs.append(list(map(int,plugs_data[col_name].values.tolist())))
    # print(timestep)

    for plug in plugs :
        plt.plot(timestep, plug)
        plt.show()

def draw_KalmanResult(x_axis, observations, predictions) : 
    pl.style.use('default')
    fig, ax = pl.subplots(figsize=(16, 6))
    ax.plot(x_axis, observations, 'C1', label='Observation')
    ax.plot(x_axis, predictions, 'C2', label='prediction')
    ax.legend()

def Agglomerative(dataSet, n_clusters = 9, draw = False) :
    # aggArr = np.array(dict2Arr(dataet))
    aggArr = np.array(dataSet)
    timestep = range(0,len(dataSet))
    # aggArr = np.asarray(dataSet)
    # aggArr = dataSet
    # print(aggArr)
    # print(aggArr.shape)

    # for linkage in ('ward', 'average', 'complete') :
    # for linkage in ('ward') :
    clustering = AgglomerativeClustering(n_clusters=n_clusters,linkage='complete')
    # agg.fit_predict(X = aggArr.shape)
    clustering.fit(aggArr)
    if draw == True :
        plt.figure()
        plt.plot(timestep, clustering.labels_)
        plt.show()
    
    return clustering.labels_

def KalmanFilter(plugs_data, Q_var = 0.005, R_var = 0.1, draw = False) : 
    plugs_predictions = []
    for plug_data in plugs_data :
        rnd = np.random.RandomState(0)

        # generate a noisy sine wave to act as our fake observations
        n_timesteps = len(plug_data)
        x_axis = np.linspace(0, n_timesteps, n_timesteps)
        observations = plug_data

        n = 1
        m = 1
        l = 1
        x = np.ones([1, 1])
        A = np.ones([1, 1])
        B = np.zeros([1, 1])
        P = np.ones([1, 1])
        # Q = np.array([[0.005]])
        Q = np.array([[Q_var]])
        H = np.ones([1, 1])
        u = np.zeros([1, 1])
        # R = np.array([[0.1]])
        R = np.array([[R_var]])

        predictions = []
        with tf.Session() as sess:
            kf = filters.KalmanFilter(x=x, A=A, B=B, P=P, Q=Q, H=H)
            predict = kf.predict()
            correct = kf.correct()
            tf.global_variables_initializer().run()
            for i in range(0, n_timesteps):
                x_pred, _ = sess.run(predict, feed_dict={kf.u: u})
                predictions.append(x_pred[0, 0])
                sess.run(correct, feed_dict={kf.z:np.array([[observations[i]]]), kf.R:R})

        if draw == True :
            draw_KalmanResult(x_axis,observations,predictions)
        plugs_predictions.append(predictions)
    if draw == True :
        pl.show()
    return plugs_predictions

def getPlugClusterList() :
    pd_drop = ['_id', 'timestep','__v']

    DRAW = False
    mongo = mongoDB()
    getData = mongo.getAllDatas(tablename = 'rssi_real')
    # print(getData)

    dataset = pd.DataFrame(getData)
    dataset = dataset.drop(dataset.index[:700])
    dataset = dataset.drop(pd_drop, axis=1)
    dataset_plugs = dataset.fillna(0)
    # draw_PlugState(dataset_plugs)

    list_plugs = dataset_plugs.values.tolist()      #[1,2,3,4][1,2,3,4][1,2,3,4]....*10000
    list_plugs_T = dataset_plugs.T.values.tolist()  #[[1 1 1 1 .. ][2 2 2 2..]..[4 4 4 ....]]

    # drawAgglomerative(dataset_plugs)
    list_plugs_kalman_T = KalmanFilter(list_plugs_T,Q_var = 0.01 ,R_var = 0.6, draw = DRAW)
    list_plugs_kalman_T = KalmanFilter(list_plugs_kalman_T, Q_var = 0.01, R_var = 0.2,draw=DRAW)

    list_plugs_kalman = list(map(list, zip(*list_plugs_kalman_T)))

    list_plugs_cluster = Agglomerative(list_plugs_kalman, draw = DRAW)

    return list_plugs_cluster

def main() :
    plugs_cluster = getPlugClusterList()
    csv_input_dir = "/home/kgm1306/Documents/DeepLearning/data"
    csv_input_filename = "rssi_real1_final.csv"
    util.list2file(plugs_cluster, csv_input_dir + "/" + csv_input_filename)
    lstm.KerasModel_init()

if __name__ == '__main__' :
    main()






