import json
from random import randrange
import requests
from bs4 import BeautifulSoup
from textblob import TextBlob, Word


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
            self.num = 0


def get_words(term, max_amount, section, synonyms=True):
    assert (isinstance(term, str) or isinstance(term, unicode)) and len(term.split()) == 1, "A term must be only a single word."
    try:
        url = "http://www.thesaurus.com/browse/{0}".format(term)
        data = BeautifulSoup(requests.get(url).text)
        terms = data.select(section)[0].findAll("li")
        terms = terms[:max_amount] if max_amount is not None else terms
        return [li.select("span.text")[0].getText() for li in terms]
    except:
        print("{0} has no {1}".format(term, 'synonyms' if synonyms else 'antonyms'))

def get_synonyms(term, max_amount=None):
    return get_words(term, max_amount, "div#filters-0")

def get_antonyms(term, max_amount=None):
    return get_words(term, max_amount, "section.antonyms", False)


def spell_corrector(text, similarity=0.01):
    assert isinstance(text, str) or isinstance(text, unicode), "The argument should be of str or unicode type."
    if len(text.split()) > 1:
        b = TextBlob(text).correct()
    else:
        b = Word(text).spellcheck()
        # return only those results, for which the similarity factor is greater than 0.01
        b = (next(iter(())) if item[1] <= 0.01 else item[0] for item in b)
    return list(b)


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