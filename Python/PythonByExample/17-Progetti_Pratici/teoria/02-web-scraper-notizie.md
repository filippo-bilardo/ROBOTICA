# Web Scraper di Notizie

In questo progetto, svilupperemo un web scraper che estrae e analizza notizie da siti web utilizzando le librerie Requests e BeautifulSoup. Questo strumento ci permetterà di raccogliere automaticamente informazioni da fonti online e di analizzarle per estrarre insight interessanti.

## Analisi del problema

Il nostro obiettivo è creare un'applicazione che possa:

1. Accedere a siti web di notizie
2. Estrarre titoli, contenuti e metadati degli articoli
3. Organizzare i dati in un formato strutturato
4. Analizzare i dati raccolti (es. analisi delle parole più frequenti, sentiment analysis)
5. Salvare i risultati per un uso futuro

### Requisiti

- Capacità di gestire diverse fonti di notizie
- Robustezza rispetto a cambiamenti nella struttura delle pagine web
- Rispetto delle politiche dei siti web (robots.txt, rate limiting)
- Interfaccia utente semplice per configurare e avviare lo scraping

## Progettazione

### Architettura del sistema

Il nostro web scraper sarà organizzato nei seguenti moduli:

1. **Modulo di scraping**: responsabile dell'accesso alle pagine web e dell'estrazione dei dati grezzi
2. **Parser specifici per sito**: componenti che sanno come estrarre informazioni da specifici siti di notizie
3. **Gestore dei dati**: organizza e salva i dati estratti
4. **Analizzatore**: esegue analisi sui dati raccolti
5. **Interfaccia utente**: permette all'utente di configurare e controllare il processo

### Diagramma delle classi

```
WebScraper
  ├── NewsFetcher
  │     ├── RequestHandler
  │     └── RateLimiter
  ├── NewsParser
  │     ├── GenericParser
  │     ├── SiteSpecificParser1
  │     └── SiteSpecificParser2
  ├── DataManager
  │     ├── NewsItem
  │     └── NewsDatabase
  ├── Analyzer
  │     ├── WordFrequencyAnalyzer
  │     └── SentimentAnalyzer
  └── UserInterface
```

## Implementazione

Vediamo ora come implementare il nostro web scraper passo dopo passo.

### 1. Configurazione dell'ambiente

Prima di tutto, installiamo le librerie necessarie:

```python
# Installazione delle dipendenze
# pip install requests beautifulsoup4 pandas nltk matplotlib
```

### 2. Modulo di scraping

Creiamo il modulo base per il fetching delle pagine web:

```python
# news_fetcher.py
import requests
import time
from urllib.parse import urlparse

class RequestHandler:
    def __init__(self, headers=None):
        self.session = requests.Session()
        self.headers = headers or {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
    def get(self, url):
        try:
            response = self.session.get(url, headers=self.headers)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            print(f"Errore durante il recupero di {url}: {e}")
            return None

class RateLimiter:
    def __init__(self, requests_per_minute=20):
        self.delay = 60.0 / requests_per_minute
        self.last_request = 0
        
    def wait(self):
        elapsed = time.time() - self.last_request
        if elapsed < self.delay:
            time.sleep(self.delay - elapsed)
        self.last_request = time.time()

class NewsFetcher:
    def __init__(self, requests_per_minute=15):
        self.handler = RequestHandler()
        self.limiter = RateLimiter(requests_per_minute)
        
    def fetch(self, url):
        self.limiter.wait()  # Rispetta il rate limiting
        return self.handler.get(url)
    
    def check_robots_txt(self, url):
        """Verifica se lo scraping è permesso dal robots.txt"""
        parsed_url = urlparse(url)
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
        robots_url = f"{base_url}/robots.txt"
        
        response = self.handler.get(robots_url)
        if response and response.status_code == 200:
            # Qui si potrebbe implementare un parser completo per robots.txt
            # Per semplicità, controlliamo solo se il nostro user-agent è esplicitamente bloccato
            if "User-agent: *\nDisallow: /" in response.text:
                return False
        return True
```

### 3. Modulo di parsing

Implementiamo il parser per estrarre le informazioni dalle pagine HTML:

```python
# news_parser.py
from bs4 import BeautifulSoup
import re

class NewsItem:
    def __init__(self, title, content, author=None, date=None, url=None, source=None):
        self.title = title
        self.content = content
        self.author = author
        self.date = date
        self.url = url
        self.source = source
    
    def __str__(self):
        return f"{self.title} - {self.source} ({self.date})"

class GenericParser:
    """Parser generico che tenta di estrarre informazioni da qualsiasi sito di notizie"""
    
    def parse(self, html_content, url):
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Estrazione del titolo (di solito nei tag h1 o nei meta tag)
        title = soup.find('h1')
        if title:
            title = title.text.strip()
        else:
            meta_title = soup.find('meta', property='og:title')
            title = meta_title['content'] if meta_title else "Titolo non trovato"
        
        # Estrazione del contenuto (di solito in div con classi specifiche)
        content_div = soup.find('article') or soup.find('div', class_=re.compile(r'content|article|body'))
        content = ""
        if content_div:
            # Rimuoviamo elementi non rilevanti come pubblicità
            for ad in content_div.find_all('div', class_=re.compile(r'ad|banner|sponsor')):
                ad.decompose()
            
            paragraphs = content_div.find_all('p')
            content = '\n'.join([p.text.strip() for p in paragraphs])
        
        # Estrazione dell'autore
        author = soup.find('meta', property='author') or soup.find('a', rel='author')
        author = author['content'] if author and 'content' in author.attrs else \
                author.text.strip() if author else "Autore sconosciuto"
        
        # Estrazione della data
        date = soup.find('meta', property='article:published_time')
        date = date['content'] if date else "Data sconosciuta"
        
        # Estrazione della fonte
        source = urlparse(url).netloc
        
        return NewsItem(title, content, author, date, url, source)

class RepubblicaParser(GenericParser):
    """Parser specifico per il sito di Repubblica"""
    
    def parse(self, html_content, url):
        soup = BeautifulSoup(html_content, 'html.parser')
        
        title = soup.find('h1', class_='article-title')
        title = title.text.strip() if title else "Titolo non trovato"
        
        content_div = soup.find('div', class_='article-content')
        content = ""
        if content_div:
            paragraphs = content_div.find_all('p')
            content = '\n'.join([p.text.strip() for p in paragraphs])
        
        author_div = soup.find('div', class_='article-author')
        author = author_div.text.strip() if author_div else "Autore sconosciuto"
        
        date_div = soup.find('time', class_='article-date')
        date = date_div['datetime'] if date_div and 'datetime' in date_div.attrs else "Data sconosciuta"
        
        return NewsItem(title, content, author, date, url, "repubblica.it")
```

### 4. Gestore dei dati

Creiamo un modulo per gestire i dati estratti:

```python
# data_manager.py
import json
import os
import pandas as pd
from datetime import datetime

class NewsDatabase:
    def __init__(self, storage_dir="news_data"):
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
    
    def save_news_item(self, news_item):
        """Salva un singolo articolo in formato JSON"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{self.storage_dir}/{news_item.source}_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump({
                'title': news_item.title,
                'content': news_item.content,
                'author': news_item.author,
                'date': news_item.date,
                'url': news_item.url,
                'source': news_item.source
            }, f, ensure_ascii=False, indent=4)
        
        return filename
    
    def save_to_csv(self, news_items, filename="news_dataset.csv"):
        """Salva una lista di articoli in formato CSV"""
        data = [{
            'title': item.title,
            'content': item.content,
            'author': item.author,
            'date': item.date,
            'url': item.url,
            'source': item.source
        } for item in news_items]
        
        df = pd.DataFrame(data)
        csv_path = f"{self.storage_dir}/{filename}"
        df.to_csv(csv_path, index=False, encoding='utf-8')
        
        return csv_path
    
    def load_all_news(self):
        """Carica tutti gli articoli salvati"""
        news_items = []
        
        for filename in os.listdir(self.storage_dir):
            if filename.endswith('.json'):
                with open(f"{self.storage_dir}/{filename}", 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    news_items.append(NewsItem(
                        data['title'],
                        data['content'],
                        data['author'],
                        data['date'],
                        data['url'],
                        data['source']
                    ))
        
        return news_items
```

### 5. Analizzatore

Implementiamo l'analizzatore per estrarre informazioni dai dati raccolti:

```python
# analyzer.py
import re
from collections import Counter
import nltk
from nltk.corpus import stopwords
import matplotlib.pyplot as plt

# Scaricare le risorse necessarie per NLTK (da eseguire una volta)
# nltk.download('punkt')
# nltk.download('stopwords')

class WordFrequencyAnalyzer:
    def __init__(self, language='italian'):
        self.language = language
        self.stop_words = set(stopwords.words(language))
    
    def preprocess_text(self, text):
        """Pulisce e tokenizza il testo"""
        # Rimuove caratteri speciali e converte in minuscolo
        text = re.sub(r'[^\w\s]', '', text.lower())
        
        # Tokenizza il testo
        tokens = nltk.word_tokenize(text, language=self.language)
        
        # Rimuove le stop words
        tokens = [word for word in tokens if word not in self.stop_words and len(word) > 2]
        
        return tokens
    
    def analyze(self, news_items, top_n=20):
        """Analizza la frequenza delle parole in una lista di articoli"""
        all_tokens = []
        
        for item in news_items:
            tokens = self.preprocess_text(item.content)
            all_tokens.extend(tokens)
        
        # Conta la frequenza delle parole
        word_freq = Counter(all_tokens)
        
        # Restituisce le top N parole più frequenti
        return word_freq.most_common(top_n)
    
    def plot_word_frequency(self, word_freq, title="Parole più frequenti"):
        """Visualizza un grafico a barre delle parole più frequenti"""
        words, counts = zip(*word_freq)
        
        plt.figure(figsize=(12, 8))
        plt.bar(words, counts)
        plt.xlabel('Parole')
        plt.ylabel('Frequenza')
        plt.title(title)
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        
        return plt

class SentimentAnalyzer:
    """Analizzatore di sentiment (richiede librerie aggiuntive come TextBlob o VADER)"""
    
    def analyze(self, news_items):
        """Implementazione base - in un progetto reale si userebbe una libreria di sentiment analysis"""
        # Questo è solo un esempio semplificato
        positive_words = {'positivo', 'bene', 'ottimo', 'eccellente', 'felice', 'successo'}
        negative_words = {'negativo', 'male', 'pessimo', 'terribile', 'triste', 'fallimento'}
        
        results = []
        
        for item in news_items:
            text = item.content.lower()
            words = set(re.findall(r'\w+', text))
            
            positive_count = len(words.intersection(positive_words))
            negative_count = len(words.intersection(negative_words))
            
            if positive_count > negative_count:
                sentiment = "positivo"
            elif negative_count > positive_count:
                sentiment = "negativo"
            else:
                sentiment = "neutro"
            
            results.append({
                'title': item.title,
                'sentiment': sentiment,
                'positive_score': positive_count,
                'negative_score': negative_count
            })
        
        return results
```

### 6. Interfaccia utente

Creiamo una semplice interfaccia a riga di comando:

```python
# main.py
import argparse
from urllib.parse import urlparse

from news_fetcher import NewsFetcher
from news_parser import GenericParser, RepubblicaParser, NewsItem
from data_manager import NewsDatabase
from analyzer import WordFrequencyAnalyzer, SentimentAnalyzer

def get_parser_for_url(url):
    """Seleziona il parser appropriato in base all'URL"""
    domain = urlparse(url).netloc
    
    if 'repubblica.it' in domain:
        return RepubblicaParser()
    
    # Aggiungi altri parser specifici qui
    
    # Default: parser generico
    return GenericParser()

def main():
    parser = argparse.ArgumentParser(description='Web Scraper di Notizie')
    parser.add_argument('--url', help='URL dell\'articolo da analizzare')
    parser.add_argument('--file', help='File con lista di URL da analizzare')
    parser.add_argument('--analyze', action='store_true', help='Analizza gli articoli già scaricati')
    
    args = parser.parse_args()
    
    fetcher = NewsFetcher()
    db = NewsDatabase()
    
    if args.analyze:
        # Modalità analisi
        news_items = db.load_all_news()
        if not news_items:
            print("Nessun articolo trovato nel database.")
            return
        
        print(f"Analisi di {len(news_items)} articoli...")
        
        # Analisi della frequenza delle parole
        word_analyzer = WordFrequencyAnalyzer()
        word_freq = word_analyzer.analyze(news_items)
        
        print("\nParole più frequenti:")
        for word, count in word_freq:
            print(f"{word}: {count}")
        
        # Visualizzazione grafica
        plt = word_analyzer.plot_word_frequency(word_freq)
        plt.savefig("word_frequency.png")
        print("\nGrafico salvato come 'word_frequency.png'")
        
        # Analisi del sentiment
        sentiment_analyzer = SentimentAnalyzer()
        sentiment_results = sentiment_analyzer.analyze(news_items)
        
        print("\nAnalisi del sentiment:")
        for result in sentiment_results:
            print(f"{result['title']} - Sentiment: {result['sentiment']}")
        
    elif args.url:
        # Modalità singolo URL
        if not fetcher.check_robots_txt(args.url):
            print(f"Lo scraping non è permesso per {args.url} secondo robots.txt")
            return
        
        print(f"Scaricamento di {args.url}...")
        response = fetcher.fetch(args.url)
        
        if response and response.status_code == 200:
            parser = get_parser_for_url(args.url)
            news_item = parser.parse(response.text, args.url)
            
            print(f"Articolo estratto: {news_item}")
            filename = db.save_news_item(news_item)
            print(f"Articolo salvato come {filename}")
        else:
            print("Impossibile scaricare l'articolo.")
    
    elif args.file:
        # Modalità file con lista di URL
        news_items = []
        
        try:
            with open(args.file, 'r') as f:
                urls = [line.strip() for line in f if line.strip()]
            
            for url in urls:
                if not fetcher.check_robots_txt(url):
                    print(f"Lo scraping non è permesso per {url} secondo robots.txt")
                    continue
                
                print(f"Scaricamento di {url}...")
                response = fetcher.fetch(url)
                
                if response and response.status_code == 200:
                    parser = get_parser_for_url(url)
                    news_item = parser.parse(response.text, url)
                    news_items.append(news_item)
                    
                    print(f"Articolo estratto: {news_item}")
                    db.save_news_item(news_item)
                else:
                    print(f"Impossibile scaricare l'articolo da {url}")
            
            if news_items:
                csv_path = db.save_to_csv(news_items)
                print(f"\nTutti gli articoli sono stati salvati in {csv_path}")
        
        except FileNotFoundError:
            print(f"File {args.file} non trovato.")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
```

## Test e debugging

Per testare il nostro web scraper, possiamo seguire questi passaggi:

1. **Test del modulo di scraping**:
   - Verifica che il fetcher rispetti il rate limiting
   - Controlla che gestisca correttamente gli errori HTTP
   - Assicurati che rispetti le regole di robots.txt

2. **Test del parser**:
   - Prova il parser generico su diversi siti di notizie
   - Verifica che i parser specifici estraggano correttamente le informazioni
   - Controlla la gestione di casi particolari (articoli senza autore, ecc.)

3. **Test dell'analizzatore**:
   - Verifica che l'analisi delle parole frequenti funzioni correttamente
   - Controlla che la visualizzazione dei grafici sia chiara
   - Valuta l'accuratezza dell'analisi del sentiment

4. **Test dell'interfaccia utente**:
   - Prova tutte le modalità di funzionamento (URL singolo, file di URL, analisi)
   - Verifica che i messaggi all'utente siano chiari e informativi

### Esempio di test

```python
# test_scraper.py
import unittest
from news_fetcher import NewsFetcher
from news_parser import GenericParser, NewsItem
from data_manager import NewsDatabase
from analyzer import WordFrequencyAnalyzer

class TestWebScraper(unittest.TestCase):
    def test_fetcher(self):
        fetcher = NewsFetcher()
        response = fetcher.fetch("https://www.example.com")
        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, 200)
    
    def test_parser(self):
        # Test con HTML di esempio
        html = """<html>
            <head><title>Articolo di Test</title></head>
            <body>
                <h1>Titolo dell'articolo</h1>
                <div class="article-content">
                    <p>Questo è il primo paragrafo.</p>
                    <p>Questo è il secondo paragrafo.</p>
                </div>
                <div class="article-author">Autore di Test</div>
            </body>
        </html>"""
        
        parser = GenericParser()
        news_item = parser.parse(html, "https://www.example.com/article")
        
        self.assertEqual(news_item.title, "Titolo dell'articolo")
        self.assertIn("primo paragrafo", news_item.content)
        self.assertIn("secondo paragrafo", news_item.content)
    
    def test_analyzer(self):
        # Crea alcuni articoli di test
        items = [
            NewsItem("Titolo 1", "Questo è un articolo positivo con parole positive.", "Autore 1"),
            NewsItem("Titolo 2", "Questo è un articolo negativo con parole negative.", "Autore 2"),
        ]
        
        analyzer = WordFrequencyAnalyzer()
        word_freq = analyzer.analyze(items)
        
        # Verifica che le parole più frequenti siano corrette
        words = [word for word, _ in word_freq]
        self.assertIn("articolo", words)
        self.assertIn("parole", words)

if __name__ == "__main__":
    unittest.main()
```

## Miglioramenti possibili

Ecco alcune idee per estendere e migliorare il nostro web scraper:

1. **Supporto per più siti**: Aggiungere parser specifici per altri siti di notizie popolari

2. **Interfaccia grafica**: Sviluppare una GUI con Tkinter o PyQt per rendere l'applicazione più user-friendly

3. **Analisi avanzata**: Implementare tecniche di NLP più sofisticate come:
   - Topic modeling per identificare gli argomenti principali
   - Named Entity Recognition per estrarre persone, luoghi e organizzazioni
   - Sentiment analysis più accurata utilizzando modelli pre-addestrati

4. **Monitoraggio continuo**: Aggiungere funzionalità per monitorare periodicamente i siti e notificare quando appaiono nuovi articoli su argomenti specifici

5. **Database più robusto**: Utilizzare SQLite o MongoDB per una gestione più efficiente dei dati

6. **Supporto multilingua**: Estendere l'analisi per supportare articoli in diverse lingue

7. **Visualizzazioni interattive**: Utilizzare librerie come Plotly per creare visualizzazioni interattive dei dati

8. **API REST**: Implementare un'API per consentire ad altre applicazioni di accedere ai dati raccolti

## Conclusioni

In questo progetto, abbiamo sviluppato un web scraper completo per l'estrazione e l'analisi di notizie da siti web. Abbiamo imparato come:

- Accedere a pagine web in modo rispettoso utilizzando rate limiting e controllo di robots.txt
- Estrarre informazioni strutturate da HTML utilizzando BeautifulSoup
- Organizzare e salvare i dati in formati utili
- Analizzare testi utilizzando tecniche di base di NLP
- Creare visualizzazioni per comprendere meglio i dati

Questo progetto può essere utilizzato come base per applicazioni più avanzate di data mining e analisi di testi, e può essere facilmente esteso per supportare nuove fonti di dati e tecniche di analisi.

## Navigazione

- [Torna all'indice dei progetti](../README.md)
- [Progetto precedente: Analizzatore di dati meteo](01-analizzatore-dati-meteo.md)
- [Progetto successivo: Applicazione web con Flask](03-applicazione-web-flask.md)