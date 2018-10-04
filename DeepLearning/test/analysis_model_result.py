import re
import os
import sys
import numpy as np
import pandas as pd
import tensorflow as tf
import keras
# from sqlalchemy import create_engine
sys.path.append("..")

from mongo import mongoDB
from myjson import Json
from keras.models import Sequential, load_model, save_model

model_path = "/Users/gyeongmin/Documents/Final_project/DeepLearning/output"
model = load_model(model_path)
predict_class = model.predict_classes(dataset)
class_prob = model.predict_proba(dataset)

