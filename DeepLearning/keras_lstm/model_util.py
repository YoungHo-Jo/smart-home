import re
import os
import sys
import numpy as np
import pandas as pd
import tensorflow as tf
import keras
# from sqlalchemy import create_engine
sys.path.append("..")

from keras import backend as K
from keras.models import Sequential, load_model, save_model
from sklearn.manifold import TSNE
from sklearn.decomposition import PCA

from datetime import datetime
from scipy.stats import binned_statistic
from mongo import mongoDB
from myjson import Json


DIR_csvFile = '/home/kgm1306/Documents/DeepLearning/data/rssi_real1.csv'
local_DIR_csvFile = '/Users/gyeongmin/Final_project/DeepLearning/data/rssi_real1.csv'
# config = tf.ConfigProto(log_device_placement=True)
# config.gpu_options.allow_growth = True
# sess = tf.Session(config=config) 
# keras.backend.set_session(sess)

def file2list(file):
    # read in file to list
    data = []
    with open(file, 'rb') as fi:
        for line in fi:
            if line.strip():
                data.append(line.strip())
    fi.close()
    return data

def list2file(data, file):
    # write list into given file
    with open(file, 'w') as fo:
        for item in data:
            fo.write("%s\n" % item)
    fo.close()


def percentile_remove_outlier(df, filter_start, filter_end):
    # remove outlier records according to quantile outlier theory
    filter_region = df.ix[:, filter_start:filter_end+1]
    transaction_interval_array = np.asarray(filter_region).ravel()
    q1 = np.percentile(transaction_interval_array, 25)
    q3 = np.percentile(transaction_interval_array, 75)
    outlier_low = q1 - (q3 - q1) * 1.5
    outlier_high = q3 + (q3 - q1) * 1.5
    # make sure every element in the filtering region within normal range
    df_fil = df.ix[
        ((outlier_low < filter_region) & (filter_region < outlier_high)).sum(axis=1) == (filter_end - filter_start) + 1,]
    # re-index the filtering df from 0
    df_fil.index = range(len(df_fil.index))
    print("Outlier removed! Low boundary: {}, high boundary: {}".format(outlier_low, outlier_high))
    return df_fil


def MinMaxScaler(df, start_col_index, end_col_index, scale = False):
    # MinMax scale the training set columns of df, return scaled df and Min & Max value
    maxValue = np.asarray(df.ix[:, start_col_index:end_col_index]).ravel().max()
    minValue = np.asarray(df.ix[:, start_col_index:end_col_index]).ravel().min()
    df.ix[:, start_col_index:end_col_index] = df.ix[:, start_col_index:end_col_index].apply(
        lambda x: (x - minValue) / (maxValue - minValue))
    if scale :
        for index in range(start_col_index, end_col_index) :
            df.ix[:, index:index] = df.ix[:, index:index].apply(lambda x: index + 2**index*x)
        
    return df, minValue, maxValue


def NormalDistributionScaler(df, start_col_index, end_col_index):
    # scale data set to normal distribution, return scaled df and mean & std value
    mean = np.asarray(df.ix[:, start_col_index:end_col_index]).ravel().mean()
    std = np.asarray(df.ix[:, start_col_index:end_col_index]).ravel().std()
    df.ix[:, start_col_index:end_col_index] = df.ix[:, start_col_index:end_col_index].apply(
        lambda x: (x - mean) / std)
    return df, mean, std


def get_ids_and_files_in_dir(inputdir, range, input_file_regx="^(\d+)\.csv"):
    """
    :param range: tuple like (0, 100)
    :param input_file_regx: input file format for regular expression
    :return: enterprise ids and file paths list
    """
    ids, files = [], []
    for file in os.listdir(inputdir):
        pattern_match = re.match(input_file_regx, file)
        if pattern_match:
            current_id = pattern_match.group(1)
            if int(current_id) >= range[0] and int(current_id) <= range[1]:
                ids.append(current_id)
                files.append(file)
    return ids, files

"""
method (encoding, decoding to number from {plug, current} 
------------
 plugNum = {0,1,2,3}=> , currnet = {0,1}
 dataset = {0 : (0,0), 1 : (1,0), 2 : (2,0), 3 : (3,0)
            3 : (3,1), 4 : (4,1), 5 : (5,1), 6 : (3,0)
"""
def encodingDataset_X(code):
    features = []
    for feature in code :
        features.append(feature)
    return features
def encodingDataset_Y(subset_window) :
    rssi_num = subset_window[0]
    current_num = subset_window[1] + 1
    encoding_ret = rssi_num * 3 * current_num
    return int(encoding_ret)

def decodingDataset_Y(encoding_num) :
    current_num = int(encoding_num / 4)
    rssi_num = encoding_num % 4
    return rssi_num, current_num

def seq2dataset(seq, window_size):
    print(window_size)
    dataset_X = []
    dataset_Y = []

    for i in range(len(seq)-window_size):
        subset = seq[i:(i+window_size+1)]
        for si in range(len(subset)-1):
            dataset_X.append(encodingDataset_X(subset[si]))
        dataset_Y.append([encodingDataset_Y(subset[window_size])])
    
    print(np.array(dataset_X).shape)
    print(np.array(dataset_Y).shape)
        
    return np.array(dataset_X), np.array(dataset_Y)


def kerasModel_prediction(modelDir, modelName, initDataSet , byStep = False) :
    # with K.tf.device('/gpu:0'):
        model_path = modelDir + "/" + modelName + ".h5"
        model = load_model(model_path)
        # predict_class = model.predict_classes(dataset)
        # class_prob = model.predict_proba(dataset)

        if byStep == True :
            return kerasModel_prediction_step(model, initDataSet)
        else :
            return kerasModel_prediction_all(model, initDataSet)

#timesteps : 10
def kerasModel_prediction_step(model, dataSet, predict_cnt = 30) : 
    seq_out = dataSet
    trainX, _ = _TEMP__maketrainSet()
    print(trainX)
    pred_out = model.predict(trainX, batch_size=1)

    for i in range(predict_cnt):
        idx = np.argmax(pred_out[i]) 
        seq_out.append(decodingDataset_Y(idx)) 
        
    print("one step prediction : ", seq_out)

    model.reset_states()
    return seq_out
    
def kerasModel_prediction_all(model, dataSet, predict_cnt = 0) :
    seq_in = dataSet
    seq_out = dataSet
    predict_cnt = dataSet.shape[0] if predict == 0 else predict

    seq_in_features = []

    for s in seq_in:
        features = encodingDataset_X(s)
        seq_in_features.append(features)

    for i in range(predict_cnt):
        sample_in = np.array(seq_in_features)
        sample_in = np.reshape(sample_in, (1, 10, 2)) # 샘플 수, 타입스텝 수, 속성 수
        pred_out = model.predict(sample_in)
        predict_Y = decodingDataset_Y(np.argmax(pred_out))
        
        
        features = encodingDataset_X(preidct_Y)
        seq_out.append(predict_Y) # seq_out는 최종 악보이므로 인덱스 값을 코드로 변환하여 저장
        seq_in_features.append(features)
        seq_in_features.pop(0)

    model.reset_states()
    return seq_out


def _TEMP__maketrainSet() :
    filepath = "/Users/gyeongmin/Documents/Final_project/DeepLearning/data/rssi_test1.csv"

    first_row_name = []
    first_row_name = np.append(first_row_name, 'plug_state')
    first_row_name = np.append(first_row_name, 'current_state')
    # # first_row_name = np.append(first_row_name, ['rssi' + str(i) for i in range(1, 1+self.training_field_length)])
    # # first_row_name = np.append(first_row_name, ['current' + str(i) for i in range(1, 1+self.training_field_length)])

    df = pd.read_csv(filepath, header = None, names = first_row_name, sep = ' ')
    df.index = range(len(df.index))
    # print("convert df from csv {}".format(df))


    # scale the train columns

    ## 4. Min Max -> scale control (Normalizate(defalut) or standardize)
    # print("Scaling...")
    # if self.scaler == 'mm':
    #     df, minVal, maxVal = MinMaxScaler(df, start_col_index=0, end_col_index=self.training_field_length)
    # elif self.scaler == 'norm':
    #     df, meanVal, stdVal = NormalDistributionScaler(df, start_col_index=1, end_col_index=self.training_field_length+1)
    # else:
    #     raise ValueError("Argument scaler must be mm or norm!")
    # print("df : {}".format(df))
    
    # df = df.astype(int) 
    df_new, _,_ = MinMaxScaler(df, start_col_index=0, end_col_index=df.shape[1]-1)
    ## 6. train, validate, test set
    # print("Randomly selecting training set and test set...")
    train_x, train_y = seq2dataset(df_new.values, 10)
    # all_data_x = np.asarray(df_bin.ix[:, 1:1+self.training_field_length]).reshape((len(df_bin.index), 1, self.training_field_length))
    # all_data_y = np.asarray(df_bin.ix[:, 1+self.training_field_length])
    # convert y label to one-hot dummy label
    # train_y = np_utils.to_categorical(train_y)
    train_x = np.reshape(train_x, (train_y.shape[0], 10, 2))

    return train_x, train_y
            

def kerasModel_preprocessing_trainset(dir, fileName) :
    mongodb = mongoDB()
    myjson = Json()
    mongodb_getData = mongodb.getAllDatas(tablename='rssi')
    rssi, current, _ = myjson.decodingJson(mongodb_getData)
    path = dir + "/" + fileName
    csvList = []
    for _rssi, _current in zip(rssi, current) : 
        appendData = np.append(_rssi, _current)
        csvList.append(appendData.tolist())
    pdList = pd.DataFrame(csvList)
    pdList.to_csv(path, header = False)
    # pdList.to_csv(path, header = False, index = False)

    first_row_name = []
    first_row_name = np.append(first_row_name, 'plug_state')
    first_row_name = np.append(first_row_name, 'current_state')
    # # first_row_name = np.append(first_row_name, ['rssi' + str(i) for i in range(1, 1+self.training_field_length)])
    # # first_row_name = np.append(first_row_name, ['current' + str(i) for i in range(1, 1+self.training_field_length)])

    df = pd.read_csv(filepath, header = None, names = first_row_name, sep = ' ')
    df.index = range(len(df.index))
    # print("convert df from csv {}".format(df))


    # scale the train columns

    ## 4. Min Max -> scale control (Normalizate(defalut) or standardize)
    # print("Scaling...")
    # if self.scaler == 'mm':
    #     df, minVal, maxVal = MinMaxScaler(df, start_col_index=0, end_col_index=self.training_field_length)
    # elif self.scaler == 'norm':
    #     df, meanVal, stdVal = NormalDistributionScaler(df, start_col_index=1, end_col_index=self.training_field_length+1)
    # else:
    #     raise ValueError("Argument scaler must be mm or norm!")
    print("df : {}".format(df))
    
    # df = df.astype(int) 
    df_new, _,_ = MinMaxScaler(df, start_col_index=0, end_col_index=df.shape[1]-1)
    ## 6. train, validate, test set
    # print("Randomly selecting training set and test set...")
    train_x, train_y = seq2dataset(df_new.values, self.timesteps)
    # all_data_x = np.asarray(df_bin.ix[:, 1:1+self.training_field_length]).reshape((len(df_bin.index), 1, self.training_field_length))
    # all_data_y = np.asarray(df_bin.ix[:, 1+self.training_field_length])
    # convert y label to one-hot dummy label
    # train_y = np_utils.to_categorical(train_y)
    train_x = np.reshape(train_x, (train_y.shape[0], self.timesteps, self.features))

    return train_x, train_y


def n_SNE(dataSet, n_components=2) :
    with K.tf.device('/gpu:0'):
        model = TSNE(n_components=2, learning_rate=100, verbose=2)
        transformed_nSNE = model.fit_transform(dataSet)
    return transformed_nSNE


def append_end_column(arr, appendList) : 
    newArr = np.array([])
    for row, appendItem in zip(arr, appendList) :
        # print("row : %s, appendItem : %s" %(str(row), str(appendItem)))
        row = np.append(row, appendItem)
        newArr = np.vstack((newArr, row)) if newArr.size else np.concatenate((newArr, row))
    return newArr


def preprocessing_nSNE(dataframe, n_components=2) :
    with K.tf.device('/gpu:0'):
        df_rssi = dataframe.filter(regex='rssi[\d*]', axis=1)
        df_current = dataframe.filter(regex='current[\d*]', axis=1)

        df_rssi_nSNE = n_SNE(df_rssi.values, n_components = n_components)
        # df_new = append_end_column(df_rssi_nSNE.values, df_current.values)
        df_new = append_end_column(df_rssi_nSNE, df_current.values)

        print(df_new.shape)
        print(df_new)
        with open('../output/lstm_preprocessing_nSNE_result.txt', 'w') as file:
            file.write(np.array2string(df_new, threshold=np.nan, max_line_width=np.nan))
            print("model_util.preprocessing_nSNE :: save Result file to {}".format("~/output/lstm_preprocessing_nSNE_result.txt"))
    return df_new 
    # df_nSNE = n_SNE(df_rssi, n_components = n_components)

def putData_Mongo() :
    # csv = pd.read_csv(local_DIR_csvFile)
    csv = pd.read_csv(DIR_csvFile)
    data = csv.values
    # tag = ['time',  'rssi_data', 'current_data', 'cluster_kmean']
    tag = ['time',  'rssi_data', 'current_data']
    # for _data, _cluster in zip(data, cluster) :
    for _data in data : 
        time    = str(datetime.now())
        rssi    = _data[1:13]
        current = _data[13:25]
        # cluster_num = _cluster

        # value   = [time, rssi, current, cluster_num]
        value   = [time, rssi, current]
        json    = Json(tag, value)
        json_obj= json.encodingJson()
        mongodb = mongoDB()
        mongodb.putData(data = json_obj, tablename = 'rssi_test')


def main() : 
    # module test code
    # print("test")
    # putData_Mongo()
    initDataset = [(1,0),(1,0),(1,0),(1,0),(2,0),(2,0),(2,0),(2,0),(3,0),(3,0)]
    model_dir  = "/Users/gyeongmin/Documents/Final_project/DeepLearning/output"
    model_name = "rssi_final_test"
    kerasModel_prediction(model_dir, model_name, initDataset, byStep = True)


if __name__ == '__main__' :
    main()
