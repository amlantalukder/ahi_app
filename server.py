from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS, cross_origin
import os
import sys
import logging
import numpy as np
import pandas as pd
import glob
import joblib
from tqdm import tqdm
from xgboost import XGBClassifier

app = Flask(__name__, static_folder='web_app/build', static_url_path='')
CORS(app)

log_path = os.path.join(os.path.dirname(__file__), 'server.log')
logging.basicConfig(filename=log_path, 
                    format='%(asctime)s %(levelname)-8s %(message)s',
                    level=logging.INFO,
                    datefmt='%Y-%m-%d %H:%M:%S')

class PrefixMiddleware(object):

    def __init__(self, app, prefix=''):
        self.app = app
        self.prefix = prefix

    def __call__(self, environ, start_response):

        if environ['PATH_INFO'].startswith(self.prefix):
            environ['PATH_INFO'] = environ['PATH_INFO'][len(self.prefix):]
            environ['SCRIPT_NAME'] = self.prefix
            return self.app(environ, start_response)
        else:
            start_response('404', [('Content-Type', 'text/plain')])
            return ["This url does not belong to the app.".encode()]
        
app.wsgi_app = PrefixMiddleware(app.wsgi_app, prefix='/OSApredictor')

dir_server = os.path.dirname(__file__)
models = []
le, ss = None, None

# ---------------------------------------------------------------
def lprint(*args):
    print(*args)
    app.logger.info(args)

# ---------------------------------------------------------------
def loadModels():
    global models, le, ss
    model_files = glob.glob(f'{dir_server}/models/model_monte_carlo_*.json')
    c = 0
    for f in tqdm(model_files):
        
        c += 1
        perc = (c * 100 / len(model_files))
        if perc % 10 == 0: app.logger.info(f'{int(perc)}%')

        model = XGBClassifier()
        model.load_model(f)
        models.append(model)

    le = joblib.load(f'{dir_server}/models/labelencoder.pkl')
    ss = joblib.load(f'{dir_server}/models/standardscaler.pkl')

    lprint('Models loaded')

# ---------------------------------------------------------------
def predict(x):

    y = [m.predict_proba(x)[0, 1] for m in models]
    return np.mean(y)

# ---------------------------------------------------------------
def validate(data):

    predictors = {"sex": ["Sex", 0, 1],
                  "age": ["Age (Years)", 13, 100],
                  "weight": ["Weight (kg)", 22, 182],
                  "height": ["Height (cm)", 90, 211],
                  "initialo2": ["O2 (%)", 90, 100],
                  "initialhr": ["Heart Rate (bpm)", 40, 130],
                  "initialrr": ["Respiratory Rate (bpm)", 6, 40]
    }

    assert type(data) == dict, ValueError('Invalid data format')

    x = []
    for predictor in predictors:
        assert predictor in data, ValueError('Predictor not found')
        if predictor == 'sex':
            x.append(le.transform([data[predictor]])[0])
        else:
            try:
                value = float(data[predictor])
            except:
                raise ValueError(f'Invalid value was assigned to {predictors[predictor][0]}, value must be within {predictors[predictor][1]}-{predictors[predictor][2]}')
            
            if value < predictors[predictor][1] or value > predictors[predictor][2]:
                raise ValueError(f'Invalid value was assigned to {predictors[predictor][0]}, value must be within {predictors[predictor][1]}-{predictors[predictor][2]}')
            
            x.append(value)

    col_names = ['Sex', 'Age', 'Weight', 'Height', 'InitialO2', 'InitialHR', 'InititalRR']
    x = pd.DataFrame([x], columns=col_names)
    x[col_names[1:]] = ss.transform(x[col_names[1:]])

    return x

# ---------------------------------------------------------------
@app.route('/api/test', methods=['GET'])
@cross_origin()
def testServer():
    data = request.args.get('data')
    lprint(data)
    return f'<h1>Test server: Received data is {data}</h1>'
    

# ---------------------------------------------------------------
@app.route('/api/', methods=['POST'])
@cross_origin()
def getAhi():
    lprint('received inputs:', request.json)
    try:
        x = validate(request.json)
    except ValueError as e:
        return jsonify({'error': str(e)})
    label = predict(x)
    lprint(x, label)
    return jsonify({'ahi_level': float(label)})

# ---------------------------------------------------------------
@app.route('/')
@cross_origin()
def serve():
    lprint('Loading app ...')
    return send_from_directory(app.static_folder, 'index.html')

# ---------------------------------------------------------------
lprint('loading models ...')
loadModels()

# ---------------------------------------------------------------
if __name__ == '__main__':
    
    ip_address, port = '127.0.0.1', 5003
    
    app.logger.info(sys.argv)
    
    if len(sys.argv) > 2:
        ip_address, port = sys.argv[1:3]
    elif len(sys.argv) > 1:
        ip_address = sys.argv[1]
    
    app.run(host=ip_address, port=port, debug=False)