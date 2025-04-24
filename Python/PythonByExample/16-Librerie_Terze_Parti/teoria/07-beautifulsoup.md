# Beautiful Soup: Web Scraping in Python

## Cos'è Beautiful Soup?

Beautiful Soup è una libreria Python progettata per estrarre dati da file HTML e XML. Il suo nome deriva da un poema di Lewis Carroll nel libro "Alice nel Paese delle Meraviglie". Beautiful Soup crea un albero di analisi dai documenti HTML/XML, fornendo metodi semplici per navigare, cercare e modificare l'albero.

La libreria è particolarmente utile per il web scraping, ovvero l'estrazione automatica di dati da siti web.

## Perché usare Beautiful Soup?

- **Semplicità**: API intuitiva che semplifica l'estrazione dei dati
- **Flessibilità**: Funziona con diversi parser HTML/XML
- **Robustezza**: Gestisce bene HTML malformato o incompleto
- **Potenza**: Offre metodi potenti per navigare e cercare nell'albero DOM
- **Popolarità**: Ampiamente utilizzata e con una vasta comunità di supporto

## Installazione

Per installare Beautiful Soup, usa pip:

```bash
pip install beautifulsoup4
```

Beautiful Soup supporta diversi parser HTML. Il più comune è `lxml`, che offre buone prestazioni:

```bash
pip install lxml
```

Alternativamente, puoi usare `html5lib` che è più tollerante con HTML malformato:

```bash
pip install html5lib
```

## Concetti Fondamentali

### Creazione di un oggetto Beautiful Soup

```python
from bs4 import BeautifulSoup

# Da una stringa HTML
html_doc = """
<html>
<head><title>Pagina di Esempio</title></head>
<body>
<p class="titolo">Questo è un paragrafo</p>
<p class="contenuto">Questo è un altro paragrafo</p>
<a href="https://www.esempio.it">Questo è un link</a>
</body>
</html>
"""

soup = BeautifulSoup(html_doc, 'html.parser')  # Usando il parser predefinito
# oppure
# soup = BeautifulSoup(html_doc, 'lxml')  # Usando lxml
# soup = BeautifulSoup(html_doc, 'html5lib')  # Usando html5lib

# Da un file HTML
with open('pagina.html', 'r') as file:
    soup = BeautifulSoup(file, 'html.parser')

# Da una risposta HTTP (usando requests)
import requests
response = requests.get('https://www.esempio.it')
soup = BeautifulSoup(response.text, 'html.parser')
```

### Navigazione dell'Albero DOM

```python
from bs4 import BeautifulSoup

html_doc = """
<html>
<head><title>Pagina di Esempio</title></head>
<body>
<p class="titolo">Questo è un paragrafo</p>
<p class="contenuto">Questo è un altro paragrafo</p>
<a href="https://www.esempio.it">Questo è un link</a>
</body>
</html>
"""

soup = BeautifulSoup(html_doc, 'html.parser')

# Accesso diretto agli elementi
print(soup.title)  # <title>Pagina di Esempio</title>
print(soup.title.name)  # 'title'
print(soup.title.string)  # 'Pagina di Esempio'
print(soup.p)  # <p class="titolo">Questo è un paragrafo</p>
print(soup.a)  # <a href="https://www.esempio.it">Questo è un link</a>
print(soup.a['href'])  # 'https://www.esempio.it'

# Navigazione tra elementi
print(soup.p.parent.name)  # 'body'
print(soup.p.next_sibling.next_sibling)  # <p class="contenuto">Questo è un altro paragrafo</p>
```

### Ricerca di Elementi

```python
from bs4 import BeautifulSoup

html_doc = """
<html>
<head><title>Pagina di Esempio</title></head>
<body>
<p class="titolo">Questo è un paragrafo</p>
<p class="contenuto">Questo è un altro paragrafo</p>
<a href="https://www.esempio.it">Questo è un link</a>
<a href="https://www.esempio.it/pagina">Questo è un altro link</a>
<div id="contenitore">
  <p>Paragrafo nel contenitore</p>
</div>
</body>
</html>
"""

soup = BeautifulSoup(html_doc, 'html.parser')

# Trovare tutti gli elementi di un certo tipo
tutti_i_paragrafi = soup.find_all('p')
print(len(tutti_i_paragrafi))  # 3

# Trovare elementi con attributi specifici
paragrafi_titolo = soup.find_all('p', class_='titolo')
print(paragrafi_titolo[0].string)  # 'Questo è un paragrafo'

# Trovare elementi per ID
contenitore = soup.find(id='contenitore')
print(contenitore.p.string)  # 'Paragrafo nel contenitore'

# Trovare elementi con selettori CSS
links = soup.select('a')
print(len(links))  # 2

paragrafi_in_div = soup.select('div p')
print(paragrafi_in_div[0].string)  # 'Paragrafo nel contenitore'

# Trovare il primo elemento
primo_paragrafo = soup.find('p')
print(primo_paragrafo['class'][0])  # 'titolo'
```

### Estrazione di Testo e Attributi

```python
from bs4 import BeautifulSoup

html_doc = """
<html>
<body>
<p class="titolo">Questo è un <b>paragrafo</b> con <i>formattazione</i></p>
<a href="https://www.esempio.it" title="Vai al sito">Questo è un link</a>
</body>
</html>
"""

soup = BeautifulSoup(html_doc, 'html.parser')

# Estrazione di testo
print(soup.p.string)  # None (perché contiene altri tag)
print(soup.p.text)  # 'Questo è un paragrafo con formattazione'
print(soup.p.get_text())  # 'Questo è un paragrafo con formattazione'

# Estrazione di attributi
link = soup.a
print(link['href'])  # 'https://www.esempio.it'
print(link.get('href'))  # 'https://www.esempio.it'
print(link.get('title'))  # 'Vai al sito'
print(link.get('nonexistent', 'default'))  # 'default'

# Ottenere tutti gli attributi
print(link.attrs)  # {'href': 'https://www.esempio.it', 'title': 'Vai al sito'}
```

## Esempi Pratici di Web Scraping

### Estrazione di Titoli da una Pagina Web

```python
import requests
from bs4 import BeautifulSoup

def estrai_titoli(url):
    # Effettuare la richiesta HTTP
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    response = requests.get(url, headers=headers)
    
    # Verificare che la richiesta sia andata a buon fine
    if response.status_code != 200:
        print(f"Errore nella richiesta: {response.status_code}")
        return []
    
    # Creare l'oggetto BeautifulSoup
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Estrarre tutti i titoli h1, h2, h3
    titoli = []
    for tag in soup.find_all(['h1', 'h2', 'h3']):
        titoli.append({
            'tipo': tag.name,
            'testo': tag.text.strip()
        })
    
    return titoli

# Esempio di utilizzo
url = "https://www.esempio.it"  # Sostituire con un URL reale
titoli = estrai_titoli(url)

for titolo in titoli:
    print(f"{titolo['tipo'].upper()}: {titolo['testo']}")
```

### Estrazione di una Tabella

```python
import requests
from bs4 import BeautifulSoup
import pandas as pd

def estrai_tabella(url, indice_tabella=0):
    """Estrae una tabella da una pagina web e la converte in DataFrame."""
    # Effettuare la richiesta HTTP
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    response = requests.get(url, headers=headers)
    
    # Verificare che la richiesta sia andata a buon fine
    if response.status_code != 200:
        print(f"Errore nella richiesta: {response.status_code}")
        return None
    
    # Creare l'oggetto BeautifulSoup
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Trovare tutte le tabelle
    tabelle = soup.find_all('table')
    
    if indice_tabella >= len(tabelle):
        print(f"Errore: tabella con indice {indice_tabella} non trovata")
        return None
    
    # Selezionare la tabella desiderata
    tabella = tabelle[indice_tabella]
    
    # Estrarre le intestazioni
    intestazioni = []
    for th in tabella.find_all('th'):
        intestazioni.append(th.text.strip())
    
    # Se non ci sono intestazioni, usare numeri di colonna
    if not intestazioni:
        # Determinare il numero di colonne dalla prima riga
        prima_riga = tabella.find('tr')
        if prima_riga:
            num_colonne = len(prima_riga.find_all(['td', 'th']))
            intestazioni = [f'Colonna {i+1}' for i in range(num_colonne)]
    
    # Estrarre le righe
    righe = []
    for tr in tabella.find_all('tr'):
        riga = []
        for td in tr.find_all(['td', 'th']):
            riga.append(td.text.strip())
        if riga:  # Ignorare righe vuote
            righe.append(riga)
    
    # Creare il DataFrame
    if righe:
        # Se la prima riga contiene le intestazioni, rimuoverla dai dati
        if len(righe[0]) == len(intestazioni) and all(a == b for a, b in zip(righe[0], intestazioni)):
            righe = righe[1:]
        
        # Assicurarsi che tutte le righe abbiano lo stesso numero di colonne
        righe_valide = [riga for riga in righe if len(riga) == len(intestazioni)]
        
        # Creare il DataFrame
        df = pd.DataFrame(righe_valide, columns=intestazioni)
        return df
    
    return None

# Esempio di utilizzo
url = "https://it.wikipedia.org/wiki/Campionato_mondiale_di_calcio"  # Sostituire con un URL reale
df = estrai_tabella(url, 1)  # Estrae la seconda tabella

if df is not None:
    print(df.head())
```

### Scraping di un Sito di Notizie

```python
import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime

def estrai_notizie(url):
    """Estrae titoli e link delle notizie da un sito."""
    # Effettuare la richiesta HTTP
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    response = requests.get(url, headers=headers)
    
    # Verificare che la richiesta sia andata a buon fine
    if response.status_code != 200:
        print(f"Errore nella richiesta: {response.status_code}")
        return []
    
    # Creare l'oggetto BeautifulSoup
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Questa parte varia a seconda della struttura del sito
    # Esempio generico per un sito di notizie
    notizie = []
    
    # Cercare articoli o div contenenti notizie
    # Nota: questi selettori devono essere adattati al sito specifico
    articoli = soup.select('article') or soup.select('.news-item') or soup.select('.article')
    
    for articolo in articoli:
        # Cercare titolo e link
        titolo_tag = articolo.find(['h1', 'h2', 'h3']) or articolo.find(class_=['title', 'headline'])
        link_tag = titolo_tag.find('a') if titolo_tag else None
        
        if titolo_tag:
            titolo = titolo_tag.text.strip()
            
            # Estrarre il link
            link = ''
            if link_tag and 'href' in link_tag.attrs:
                link = link_tag['href']
                # Gestire URL relativi
                if link.startswith('/'):
                    base_url = '/'.join(url.split('/')[:3])  # http://dominio.com
                    link = base_url + link
            
            # Cercare la data (questo varia molto tra i siti)
            data_tag = articolo.find(class_=['date', 'time', 'published']) or articolo.find('time')
            data = data_tag.text.strip() if data_tag else ''
            
            # Cercare un'anteprima o sommario
            sommario_tag = articolo.find(['p', 'div'], class_=['summary', 'excerpt', 'description'])
            sommario = sommario_tag.text.strip() if sommario_tag else ''
            
            notizie.append({
                'titolo': titolo,
                'link': link,
                'data': data,
                'sommario': sommario
            })
    
    return notizie

# Esempio di utilizzo
url = "https://www.esempio.it/notizie"  # Sostituire con un URL reale
notizie = estrai_notizie(url)

# Creare un DataFrame
df = pd.DataFrame(notizie)
print(df.head())

# Salvare i risultati
df.to_csv(f'notizie_{datetime.now().strftime("%Y%m%d")}.csv', index=False)
```

## Buone Pratiche per il Web Scraping

### Rispetto delle Regole del Sito

```python
import requests
from bs4 import BeautifulSoup
from urllib.robotparser import RobotFileParser
from urllib.parse import urlparse
import time

def is_scraping_allowed(url, user_agent='*'):
    """Verifica se lo scraping è consentito per l'URL specificato."""
    parsed_url = urlparse(url)
    robots_url = f"{parsed_url.scheme}://{parsed_url.netloc}/robots.txt"
    
    rp = RobotFileParser()
    rp.set_url(robots_url)
    
    try:
        rp.read()
        return rp.can_fetch(user_agent, url)
    except:
        # In caso di errore, assumiamo che lo scraping sia consentito
        return True

def scrape_with_respect(url, scraping_function, delay=3):
    """Esegue lo scraping rispettando robots.txt e con un ritardo tra le richieste."""
    user_agent = 'PythonScrapingBot/1.0'
    
    if not is_scraping_allowed(url, user_agent):
        print(f"Lo scraping non è consentito per {url}")
        return None
    
    # Aggiungere un ritardo prima della richiesta
    time.sleep(delay)
    
    # Effettuare la richiesta con un User-Agent appropriato
    headers = {'User-Agent': user_agent}
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        print(f"Errore nella richiesta: {response.status_code}")
        return None
    
    # Eseguire la funzione di scraping
    return scraping_function(response)

# Esempio di funzione di scraping
def estrai_titoli_da_risposta(response):
    soup = BeautifulSoup(response.text, 'html.parser')
    titoli = []
    for tag in soup.find_all(['h1', 'h2', 'h3']):
        titoli.append(tag.text.strip())
    return titoli

# Esempio di utilizzo
url = "https://www.esempio.it"  # Sostituire con un URL reale
titoli = scrape_with_respect(url, estrai_titoli_da_risposta)

if titoli:
    for titolo in titoli:
        print(titolo)
```

## Conclusione

Beautiful Soup è una libreria potente e flessibile per il web scraping in Python. La sua API intuitiva e la capacità di gestire HTML malformato la rendono uno strumento essenziale per l'estrazione di dati dal web.

Tuttavia, è importante ricordare che il web scraping deve essere eseguito in modo responsabile, rispettando i termini di servizio dei siti web, le direttive dei file robots.txt e limitando la frequenza delle richieste per non sovraccaricare i server.

Per progetti più complessi o siti web dinamici che utilizzano JavaScript per caricare i contenuti, potresti dover considerare l'uso di strumenti aggiuntivi come Selenium o Scrapy.

## Risorse Aggiuntive

- [Documentazione ufficiale di Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [Web Scraping con Python](https://realpython.com/beautiful-soup-web-scraper-python/)
- [Guida etica al Web Scraping](https://towardsdatascience.com/ethics-in-web-scraping-b96b18136f01)

## Navigazione

- [Torna all'indice delle librerie](../README.md)
- [Libreria precedente: Pillow](06-pillow.md)
- [Libreria successiva: SQLAlchemy](08-sqlalchemy.md)