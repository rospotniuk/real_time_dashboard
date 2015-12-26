from flask import Flask, render_template
from flask.ext.socketio import SocketIO, emit

import os
import time
import json
from random import randint

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


@socketio.on('message2', namespace='/app')
def message():
    emit('pie_graph_data', [{'sector': 'Sector{}'.format(i+1), 'value': randint(0,10)} for i in xrange(5)])


class GetLatLon(object):
    def __init__(self, path):
        with open(path) as f:
            self.data = json.load(f)
        self.num = 0
        self.length = len(self.data)

    def __iter__(self):
        return self

    def __next__(self):
        if self.num < self.length:
            cur_num, self.num = self.num, self.num+1
            return self.data[cur_num]
        else:
            self.num = cur_num = 0

genLatLon = GetLatLon('static/countries-capitals.json')

@socketio.on('message3', namespace='/app')
def message():
    emit('map_data', genLatLon.__next__())


@socketio.on('disconnect', namespace='/app')
def disconnect():
    print 'Client disconnected!'


if __name__ == '__main__':
    socketio.run(app, debug=True, port=port)