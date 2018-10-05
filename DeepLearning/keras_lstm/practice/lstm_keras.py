# !pip uninstall tensorflow tensorflow-gpu -y
# !pip install tensorflow-gpu
# 0. 사용할 패키지 불러오기
import sys
import keras
import numpy as np
import pandas as pd
sys.path.append("..")

from keras.models import Sequential
from keras.layers import Dense, LSTM
from keras.utils import np_utils

import mongo
import myjson 
import matplotlib.pyplot as plt



# 랜덤시드 고정시키기
max_idx_value = 13
timesteps = 4

output_value = 12
sample_value = 50
feature_value = 2

feature_timeIndex = 1
feature_rssiIndex = 13
feature_currentIndex = 25

# num_epochs = 2000
num_epochs = 100

np.random.seed(5)


# 손실 이력 클래스 정의
class LossHistory(keras.callbacks.Callback):
    def init(self):
        self.losses = []
        
    def on_epoch_end(self, batch, logs={}):
        self.losses.append(logs.get('loss'))

def encodingFeature(feature) :
    feature = [x for x in feature]
    featureNum = 0
    for i in range(len(feature)) :
        featureNum += feature[i]*(2**i)
#     featureNum += 2**13
#     print("featureNum : " + str(featureNum))
    return featureNum

def decodingFeature(featureNum) :
    feature = [0]*12
    for i in range(2,14) : 
      if featureNum - 2**i >= 0 :
        feature[i] = featureNum & 0x1<<(2**i)
    return feature
        

# 데이터셋 생성 함수
def seq2dataset(seq, window_size):
    dataset_X = []
    dataset_Y = []

#     dataset_Y = [[] for y in range(output_value)]
    
    for i in range(len(seq)-window_size):
        
        subset = seq[i:(i+window_size+1)]
        
        for si in range(len(subset)-1):
            features = code2features(subset[si])            
            dataset_X.append(features)

        # dataset_Y.append(encodingFeature(subset[window_size,1:]))
        dataset_Y.append(subset[window_size, 1:])
#         dataset_Y[0].append(subset[window_size,feature_rssiIndex])
        
#     return np.array(dataset_X), np.array(dataset_Y[0])
    return np.array(dataset_X), np.array(dataset_Y)


# 입력 속성이 여러 개인 모델 구성
def code2features(code):
	features = []

	features.append(code[1])
	for i in range(2, 14) :
		features.append(code[i])

	return features

def makeCSV(current, cluster) :
    csvList = []
    for _current, _cluster in zip(current, cluster) : 
        appendData = np.append(_cluster, _current)
        # appendData = np.append(_current, _cluster)
        csvList.append(appendData.tolist())
    pdList = pd.DataFrame(csvList)
    pdList.to_csv("./data/rssiDummy1_kmean.csv", header = False)
    # pdList.to_csv("./data/ressiDummy2_kmean.csv", header = False, index=False)

        

# 1. 데이터 준비하기

# 코드 사전 정의


# 시퀀스 데이터 정의
# 몽고로 부터 데이터 불러오기
key = ['rssi_data', 'cluster_kmean']

mongodb = mongo.mongoDB()
json = myjson.Json()
res = mongodb.getAllDatas()
current, cluster = json.decodingJson(res,key)

print("current")
print(current)
print("cluster")
print(cluster)
makeCSV(current, cluster)

# # 2. 데이터셋 생성하기

# print("[Dataset] make dataSet")
# x_train, y_train = seq2dataset(seq, window_size = timesteps)
# print("[Dataset] done")

# print("x, y shape")
# print(x_train.shape)
# print(y_train.shape)

# print("x, y_train")
# print(x_train)
# print(y_train)
# # 입력을 (샘플 수, 타임스텝, 특성 수)로 형태 변환
# print("[Reshape] x_train reshape")
# x_train = np.reshape(x_train, 
#                     ((x_train.shape[0] * x_train.shape[1]) // (timesteps * feature_value),
#                      timesteps, 
#                      feature_value)
#                     )
# print("[Reshape] x_train done")

# # 라벨값에 대한 one-hot 인코딩 수행
# print("[Reshape] y_train reshape")
# y_train = np_utils.to_categorical(y_train)

# one_hot_vec_size = y_train.shape[1]
# print("[Reshape] y_train done")

# print("one hot encoding vector size is ", one_hot_vec_size)

# # 3. 모델 구성하기
# model = Sequential()
# model.add(LSTM(128, batch_input_shape = (1, timesteps, feature_value), stateful=True))
# model.add(Dense(one_hot_vec_size, activation='softmax'))
    
# # 4. 모델 학습과정 설정하기
# model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

# # 5. 모델 학습시키기

# history = LossHistory() # 손실 이력 객체 생성
# history.init()

# for epoch_idx in range(num_epochs):
#     print ('epochs : ' + str(epoch_idx) )
#     model.fit(x_train, y_train, epochs=1, batch_size=1, verbose=2, shuffle=False, callbacks=[history]) # 50 is X.shape[0]
#     model.reset_states()
    
# # # 6. 학습과정 살펴보기

# # plt.plot(history.losses)
# # plt.ylabel('loss')
# # plt.xlabel('epoch')
# # plt.legend(['train'], loc='upper left')
# # plt.show()

# # # 7. 모델 평가하기
# # scores = model.evaluate(x_train, y_train, batch_size=1)
# # print("%s: %.2f%%" %(model.metrics_names[1], scores[1]*100))
# # model.reset_states()

# # 8. 모델 사용하기

# pred_count = 50 # 최대 예측 개수 정의

# # # 한 스텝 예측

# # seq_out = ['g8', 'e8', 'e4', 'f8']
# # pred_out = model.predict(x_train, batch_size=1)

# # for i in range(pred_count):
# #     idx = np.argmax(pred_out[i]) # one-hot 인코딩을 인덱스 값으로 변환
# #     seq_out.append(idx2code[idx]) # seq_out는 최종 악보이므로 인덱스 값을 코드로 변환하여 저장
    
# # print("one step prediction : ", seq_out)

# # model.reset_states()

# # # 곡 전체 예측

# # seq_in = ['g8', 'e8', 'e4', 'f8']
# # seq_out = seq_in

# # seq_in_featrues = []

# # for si in seq_in:
# #     features = code2features(si)
# #     seq_in_featrues.append(features)

# # for i in range(pred_count):
# #     sample_in = np.array(seq_in_featrues)
# #     sample_in = np.reshape(sample_in, (1, 4, 2)) # 샘플 수, 타입스텝 수, 속성 수
# #     pred_out = model.predict(sample_in)
# #     idx = np.argmax(pred_out)
# #     seq_out.append(idx2code[idx])
    
# #     features = code2features(idx2code[idx])
# #     seq_in_featrues.append(features)
# #     seq_in_featrues.pop(0)

# # model.reset_states()
    
# # print("full song prediction : ", seq_out)