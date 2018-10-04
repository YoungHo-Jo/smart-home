# 0. 사용할 패키지 불러오기
import keras
import numpy as np
import pandas as pd

from keras.models import Sequential
from keras.layers import Dense, LSTM
from keras.utils import np_utils

import matplotlib.pyplot as plt

# 랜덤시드 고정시키기
max_idx_value = 13
timesteps = 100

output_value = 12
sample_value = 50
feature_value = 3
batch_value = 100

feature_timeIndex = 1
feature_rssiIndex = 13
feature_currentIndex = 25

# num_epochs = 2000
num_epochs = 300

np.random.seed(5)

# 손실 이력 클래스 정의
class LossHistory(keras.callbacks.Callback):
    def init(self):
        self.losses = []
        
    def on_epoch_end(self, batch, logs={}):
        self.losses.append(logs.get('loss'))

def encodingFeature(feature) :
    feature = [x+140 for x in feature]
    featureNum = 0
    for i in range(len(feature)) :
        featureNum += feature[i]*(100**i)
    
    return featureNum

def decodingFeature(featureNum) :
    feature = []
    while featureNum != 0 :
        feature.append(featureNum % 100)
        featureNum //= 100
    feature = [x-140 for x in feature]
    return feature
        

# 데이터셋 생성 함수
def seq2dataset(seq, window_size):
    dataset_X = []
    dataset_Y = [[] for y in range(output_value)]
    
    for i in range(len(seq)-window_size):
        
        subset = seq[i:(i+window_size+1)]
        
        for si in range(len(subset)-1):
            features = code2features(subset[si])            
            dataset_X.append(features)

        # dataset_Y[0].append(encodingFeature(subset[window_size,feature_rssiIndex]))
        dataset_Y[0].append(subset[window_size,feature_rssiIndex])
        
    return np.array(dataset_X), np.array(dataset_Y[0])

# 입력 속성이 여러 개인 모델 구성
def code2features(code):
    features = []

    features.append(encodingFeature(code[0:feature_timeIndex]))
    features.append(encodingFeature(code[feature_timeIndex:feature_rssiIndex]))
    features.append(encodingFeature(code[feature_rssiIndex:feature_currentIndex]))

    return features

# 1. 데이터 준비하기

# 코드 사전 정의

# code2idx = {'c4':0, 'd4':1, 'e4':2, 'f4':3, 'g4':4, 'a4':5, 'b4':6,
#             'c8':7, 'd8':8, 'e8':9, 'f8':10, 'g8':11, 'a8':12, 'b8':13}

# idx2code = {0:'c4', 1:'d4', 2:'e4', 3:'f4', 4:'g4', 5:'a4', 6:'b4',
#             7:'c8', 8:'d8', 9:'e8', 10:'f8', 11:'g8', 12:'a8', 13:'b8'}

# 시퀀스 데이터 정의
print("[CSV] pandas read rssi csv")
# with open(fname, 'r') as f:
#   print(f.read())
  #######################################################################
# csv = pd.read_csv("colab/data/rssiDummy.csv")
csv = pd.read_csv("data/rssiDummy.csv")
seq = csv.values
#set header of seq like(rssi0,rssi1,..rssi11, current0, current1, ..., current11)
#seq.columns=['Sepal length','Sepal width','Petal length','Petal width']
print("[CSV] done")

# # 2. 데이터셋 생성하기

print("[Dataset] make dataSet")
x_train, y_train = seq2dataset(seq, window_size = timesteps)
print("[Dataset] done")

print("x, y shape")
print(x_train.shape)
print(y_train.shape)

print("x, y_train")
print(x_train)
print(y_train)
# 입력을 (샘플 수, 타임스텝, 특성 수)로 형태 변환
print("[Reshape] x_train reshape")
x_train = np.reshape(x_train, 
                    ((x_train.shape[0] * x_train.shape[1]) // (timesteps * feature_value),
                     timesteps, 
                     feature_value)
                    )
print("[Reshape] x_train done")

# 라벨값에 대한 one-hot 인코딩 수행
print("[Reshape] y_train reshape")
y_train = np_utils.to_categorical(y_train)

one_hot_vec_size = y_train.shape[1]
print("[Reshape] y_train done")

print("one hot encoding vector size is ", one_hot_vec_size)

# 3. 모델 구성하기
model = Sequential()
model.add(LSTM(128, batch_input_shape = (batch_value, timesteps, feature_value), stateful=False))
model.add(Dense(one_hot_vec_size, activation='softmax'))
    
# 4. 모델 학습과정 설정하기
model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

# 5. 모델 학습시키기

history = LossHistory() # 손실 이력 객체 생성
history.init()

for epoch_idx in range(num_epochs):
    print ('epochs : ' + str(epoch_idx) )
    model.fit(x_train, y_train, epochs=1, batch_size=batch_value, verbose=2, shuffle=False, callbacks=[history]) # 50 is X.shape[0]
    model.reset_states()
    
# # 6. 학습과정 살펴보기

# plt.plot(history.losses)
# plt.ylabel('loss')
# plt.xlabel('epoch')
# plt.legend(['train'], loc='upper left')
# plt.show()

# # 7. 모델 평가하기
# scores = model.evaluate(x_train, y_train, batch_size=1)
# print("%s: %.2f%%" %(model.metrics_names[1], scores[1]*100))
# model.reset_states()

# 8. 모델 사용하기

pred_count = 50 # 최대 예측 개수 정의

# # 한 스텝 예측

# seq_out = ['g8', 'e8', 'e4', 'f8']
# pred_out = model.predict(x_train, batch_size=1)

# for i in range(pred_count):
#     idx = np.argmax(pred_out[i]) # one-hot 인코딩을 인덱스 값으로 변환
#     seq_out.append(idx2code[idx]) # seq_out는 최종 악보이므로 인덱스 값을 코드로 변환하여 저장
    
# print("one step prediction : ", seq_out)

# model.reset_states()

# # 곡 전체 예측

# seq_in = ['g8', 'e8', 'e4', 'f8']
# seq_out = seq_in

# seq_in_featrues = []

# for si in seq_in:
#     features = code2features(si)
#     seq_in_featrues.append(features)

# for i in range(pred_count):
#     sample_in = np.array(seq_in_featrues)
#     sample_in = np.reshape(sample_in, (1, 4, 2)) # 샘플 수, 타입스텝 수, 속성 수
#     pred_out = model.predict(sample_in)
#     idx = np.argmax(pred_out)
#     seq_out.append(idx2code[idx])
    
#     features = code2features(idx2code[idx])
#     seq_in_featrues.append(features)
#     seq_in_featrues.pop(0)

# model.reset_states()
    
# print("full song prediction : ", seq_out)