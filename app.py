from flask import Flask, render_template
from flask.ext.socketio import SocketIO, emit

import os
import time
import re
from random import randint, choice

from utils import GetLatLon, get_antonyms, get_synonyms, spell_corrector

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_key'
socketio = SocketIO(app)
port = int(os.getenv('VCAP_APP_PORT', 5000))


@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('connect', namespace='/app')
def connect():
    emit('check_connection', {'data': 'Connected'})


@socketio.on('message', namespace='/app')
def message():
    emit('graph_data', {
                        'date': time.strftime("%a %m/%d/%Y"),
                        'time': time.strftime("%H:%M:%S"),
                        'value': randint(0,100)
    })


genLatLon = GetLatLon('static/countries-capitals.json')

@socketio.on('google_map', namespace='/app')
def google_map():
    emit('map_data', genLatLon.__next__())

@socketio.on('globe', namespace='/app')
def globe():
    emit('globe_data', [randint(0,90), randint(0,90)])
    #print 'globe'

@socketio.on('input_broadcast_event', namespace='/app')
def word_cloud_broadcast(msg):
    emit('input_broadcast', {'data': msg['data']})

@socketio.on('input_event', namespace='/app')
def word_cloud(msg):
    if len(msg['data'].split()) == 1:
        limit = 20   # Not more than `limit` antonyms and synonyms
        antonyms = get_antonyms(msg['data'], limit)
        synonyms = get_synonyms(msg['data'], limit)
        words = map(lambda x: {'text': x, 'flag': 1, 'size': randint(10,50)}, synonyms)
        words.extend(map(lambda x: {'text': x, 'size': randint(10,50)}, antonyms))
    else:
        words = map(lambda x: {'text': x, 'flag': choice([0, 1]), 'size': randint(10,50)}, re.findall("[a-zA-Z\d]+", msg['data']))
    emit('input', {'words': words})

@socketio.on('input_broadcast_event', namespace='/app')
def test_message(msg):
    emit('input_broadcast', {'data': msg['data']}, broadcast=True)

@socketio.on('disconnect', namespace='/app')
def disconnect():
    print('Client disconnected!')


if __name__ == '__main__':
    socketio.run(app, debug=True, port=port)