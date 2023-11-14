from flask import Flask, request, jsonify
import os
import numpy as np
import pandas as pd
import glob
import joblib
from tqdm import tqdm
from xgboost import XGBClassifier

app = Flask(__name__)

dir_server = os.path.dirname(__file__)
models = []
le, ss = None, None

# ---------------------------------------------------------------


def loadModels():
    global models, le, ss
    for f in tqdm(glob.glob(f'{dir_server}/models/model_monte_carlo_*.json')):
        model = XGBClassifier()
        model.load_model(f)
        models.append(model)

    le = joblib.load(f'{dir_server}/models/labelencoder.pkl')
    ss = joblib.load(f'{dir_server}/models/standardscaler.pkl')

    print('Models loaded')

# ---------------------------------------------------------------


def predict(x):

    y = [m.predict_proba(x)[0, 1] for m in models]
    return np.mean(y)

# ---------------------------------------------------------------


def validate(data):

    assert type(data) == dict, ValueError('Invalid data format')

    x = []
    for predictor in ['sex', 'age', 'weight', 'height', 'initialo2', 'initialhr', 'initialrr']:
        assert predictor in data, ValueError('Predictor not found')
        if predictor == 'sex':
            x.append(le.transform([data[predictor]])[0])
        else:
            x.append(float(data[predictor]))

    col_names = ['Sex', 'Age', 'Weight', 'Height', 'InitialO2', 'InitialHR', 'InititalRR']
    x = pd.DataFrame([x], columns=col_names)
    x[col_names[1:]] = ss.transform(x[col_names[1:]])

    return x

# ---------------------------------------------------------------


@app.route('/', methods=['POST'])
def getAhi():
    print(request.json)
    try:
        x = validate(request.json)
    except ValueError as e:
        return jsonify({'error': e})
    label = predict(x)
    print(x, label)
    return jsonify({'ahi_level': float(label)})


if __name__ == '__main__':
    loadModels()
    app.run(debug=True)
