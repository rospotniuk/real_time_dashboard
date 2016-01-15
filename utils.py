import json
from random import randrange


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



def rewrite():
    with open('static/countries-capitals.json', "r") as f:
        data = json.load(f)

    for i in data:
        i["CapitalPopulation"] = unicode(randrange(1, 4*10**2) * 10**5)
        #del i["CapitalPopulation"]

    with open('static/countries-capitals.json', "w") as jsonFile:
        jsonFile.write(json.dumps(data))

def get_amount():
    with open('static/countries-capitals.json', "r") as f:
        data = json.load(f)
    return len(data)

#print get_amount()