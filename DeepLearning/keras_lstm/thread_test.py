# -*- coding: utf-8 -*-

# tf.train.QueueRunner 예제

# original source:
# https://github.com/Hezi-Resheff/Oreilly-Learning-TensorFlow/blob/master/08__queues_threads/queue_basic.py

from __future__ import print_function

import tensorflow as tf

import threading
import time

# 세션을 실행한다.
sess = tf.InteractiveSession()

# 사이즈 100 큐를 생성하고 eqneue 노드를 정의한다.
# 임의의 값을 enqueue하는 enqueue_op 노드를 정의한다.
gen_random_normal = tf.random_normal(shape=())
queue = tf.RandomShuffleQueue(capacity=100, dtypes=[tf.float32],
                              min_after_dequeue=1)
enqueue_op = queue.enqueue(gen_random_normal)


# 10개의 쓰레드를 만들고 각각의 쓰레드가 병렬로(parallel) enqueue_op operation을 비동기적으로(asynchronous) 실행한다.
# 쓰레드를 컨트롤 할 수 있는 tf.train.Coordinator를 선언하고 각각의 쓰레드들을 tf.train.Coordinator에 넣어준다.
qr = tf.train.QueueRunner(queue, [enqueue_op] * 10)
coord = tf.train.Coordinator()
enqueue_threads = qr.create_threads(sess, coord=coord, start=True)

# 10개의 쓰레드가 병렬적으로 연산을 수행한다.
# 아웃풋 예시 :
# 25
# 77
# 100
print(sess.run(queue.size()))
time.sleep(0.0001)
print(sess.run(queue.size()))
time.sleep(0.0001)
print(sess.run(queue.size()))

coord.request_stop()
coord.join(enqueue_threads)
