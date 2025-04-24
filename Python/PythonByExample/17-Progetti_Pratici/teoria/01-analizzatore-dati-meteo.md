# Progetto: Analizzatore di Dati Meteo

## Introduzione

In questo progetto, svilupperemo un'applicazione Python per analizzare dati meteorologici. Utilizzeremo Pandas per la manipolazione dei dati e Matplotlib per la visualizzazione. Questo progetto metterà in pratica molte delle conoscenze acquisite nelle sezioni precedenti, in particolare l'uso delle librerie di terze parti.

## Obiettivi del progetto

- Caricare e pulire un dataset di dati meteorologici
- Eseguire analisi statistiche sui dati
- Creare visualizzazioni significative
- Identificare tendenze e pattern nei dati
- Salvare i risultati dell'analisi

## Prerequisiti

Per questo progetto avrai bisogno di:

- Python 3.6 o superiore
- Pandas
- Matplotlib
- NumPy

Puoi installare le librerie necessarie con pip:

```bash
pip install pandas matplotlib numpy
```

## Struttura del progetto

```
analizzatore_meteo/
├── data/
│   └── dati_meteo.csv
├── analizzatore.py
├── visualizzatore.py
└── main.py
```

## Fase 1: Preparazione dei dati

Iniziamo creando il file `analizzatore.py` che si occuperà di caricare e preparare i dati:

```python
# analizzatore.py
import pandas as pd
import numpy as np

class AnalizzatoreDatiMeteo:
    def __init__(self, file_path):
        """
        Inizializza l'analizzatore con il percorso del file dei dati meteo.
        
        Args:
            file_path (str): Percorso del file CSV contenente i dati meteo
        """
        self.file_path = file_path
        self.dati = None
    
    def carica_dati(self):
        """
        Carica i dati dal file CSV e li converte in un DataFrame Pandas.
        
        Returns:
            pandas.DataFrame: DataFrame contenente i dati meteo
        """
        try:
            self.dati = pd.read_csv(self.file_path)
            # Converti la colonna data in formato datetime
            self.dati['data'] = pd.to_datetime(self.dati['data'])
            print(f"Dati caricati con successo: {len(self.dati)} record trovati.")
            return self.dati
        except Exception as e:
            print(f"Errore durante il caricamento dei dati: {e}")
            return None
    
    def pulisci_dati(self):
        """
        Pulisce i dati rimuovendo valori mancanti e outlier.
        
        Returns:
            pandas.DataFrame: DataFrame pulito
        """
        if self.dati is None:
            print("Nessun dato caricato. Chiamare prima carica_dati().")
            return None
        
        # Copia i dati originali
        dati_puliti = self.dati.copy()
        
        # Rimuovi le righe con valori mancanti
        righe_iniziali = len(dati_puliti)
        dati_puliti = dati_puliti.dropna()
        print(f"Rimosse {righe_iniziali - len(dati_puliti)} righe con valori mancanti.")
        
        # Rimuovi outlier (esempio: temperature oltre i limiti ragionevoli)
        mask_temp = (dati_puliti['temperatura'] > -50) & (dati_puliti['temperatura'] < 60)
        dati_puliti = dati_puliti[mask_temp]
        print(f"Rimosse {len(dati_puliti) - sum(mask_temp)} righe con temperature anomale.")
        
        self.dati = dati_puliti
        return self.dati
    
    def statistiche_base(self):
        """
        Calcola statistiche di base sui dati meteo.
        
        Returns:
            dict: Dizionario contenente le statistiche calcolate
        """
        if self.dati is None:
            print("Nessun dato caricato. Chiamare prima carica_dati().")
            return None
        
        stats = {
            'temperatura_media': self.dati['temperatura'].mean(),
            'temperatura_min': self.dati['temperatura'].min(),
            'temperatura_max': self.dati['temperatura'].max(),
            'umidita_media': self.dati['umidita'].mean(),
            'precipitazioni_totali': self.dati['precipitazioni'].sum(),
            'giorni_pioggia': sum(self.dati['precipitazioni'] > 0),
            'periodo_analisi': {
                'inizio': self.dati['data'].min(),
                'fine': self.dati['data'].max(),
                'durata_giorni': (self.dati['data'].max() - self.dati['data'].min()).days
            }
        }
        
        return stats
    
    def dati_mensili(self):
        """
        Aggrega i dati per mese.
        
        Returns:
            pandas.DataFrame: DataFrame con i dati aggregati per mese
        """
        if self.dati is None:
            print("Nessun dato caricato. Chiamare prima carica_dati().")
            return None
        
        # Estrai mese e anno dalla data
        self.dati['anno'] = self.dati['data'].dt.year
        self.dati['mese'] = self.dati['data'].dt.month
        
        # Raggruppa per anno e mese
        dati_mensili = self.dati.groupby(['anno', 'mese']).agg({
            'temperatura': ['mean', 'min', 'max'],
            'umidita': 'mean',
            'precipitazioni': 'sum',
            'data': 'count'
        })
        
        # Rinomina le colonne
        dati_mensili.columns = ['temperatura_media', 'temperatura_min', 'temperatura_max', 
                               'umidita_media', 'precipitazioni_totali', 'giorni_registrati']
        
        return dati_mensili
```

## Fase 2: Visualizzazione dei dati

Ora creiamo il file `visualizzatore.py` per generare grafici dai nostri dati:

```python
# visualizzatore.py
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import os

class VisualizzatoreDatiMeteo:
    def __init__(self, dati):
        """
        Inizializza il visualizzatore con i dati meteo.
        
        Args:
            dati (pandas.DataFrame): DataFrame contenente i dati meteo
        """
        self.dati = dati
        # Crea una cartella per i grafici se non esiste
        os.makedirs('grafici', exist_ok=True)
    
    def grafico_temperature(self, salva=False):
        """
        Crea un grafico delle temperature nel tempo.
        
        Args:
            salva (bool): Se True, salva il grafico come file immagine
        """
        plt.figure(figsize=(12, 6))
        plt.plot(self.dati['data'], self.dati['temperatura'], 'r-', alpha=0.7)
        plt.title('Andamento delle Temperature')
        plt.xlabel('Data')
        plt.ylabel('Temperatura (°C)')
        plt.grid(True, linestyle='--', alpha=0.7)
        
        # Aggiungi linea della media mobile a 7 giorni
        media_mobile = self.dati['temperatura'].rolling(window=7).mean()
        plt.plot(self.dati['data'], media_mobile, 'b-', linewidth=2, label='Media mobile (7 giorni)')
        
        plt.legend()
        plt.tight_layout()
        
        if salva:
            plt.savefig('grafici/temperature.png', dpi=300)
            print("Grafico salvato come 'grafici/temperature.png'")
        
        plt.show()
    
    def grafico_precipitazioni(self, salva=False):
        """
        Crea un grafico delle precipitazioni nel tempo.
        
        Args:
            salva (bool): Se True, salva il grafico come file immagine
        """
        plt.figure(figsize=(12, 6))
        plt.bar(self.dati['data'], self.dati['precipitazioni'], color='b', alpha=0.7, width=1)
        plt.title('Precipitazioni Giornaliere')
        plt.xlabel('Data')
        plt.ylabel('Precipitazioni (mm)')
        plt.grid(True, linestyle='--', alpha=0.7, axis='y')
        
        if salva:
            plt.savefig('grafici/precipitazioni.png', dpi=300)
            print("Grafico salvato come 'grafici/precipitazioni.png'")
        
        plt.show()
    
    def grafico_correlazione(self, salva=False):
        """
        Crea un grafico di dispersione per mostrare la correlazione tra temperatura e umidità.
        
        Args:
            salva (bool): Se True, salva il grafico come file immagine
        """
        plt.figure(figsize=(10, 8))
        plt.scatter(self.dati['temperatura'], self.dati['umidita'], 
                   alpha=0.5, c=self.dati['precipitazioni'], cmap='viridis')
        
        plt.colorbar(label='Precipitazioni (mm)')
        plt.title('Correlazione tra Temperatura e Umidità')
        plt.xlabel('Temperatura (°C)')
        plt.ylabel('Umidità (%)')
        plt.grid(True, linestyle='--', alpha=0.7)
        
        # Aggiungi linea di tendenza
        z = np.polyfit(self.dati['temperatura'], self.dati['umidita'], 1)
        p = np.poly1d(z)
        plt.plot(self.dati['temperatura'], p(self.dati['temperatura']), "r--", alpha=0.8)
        
        if salva:
            plt.savefig('grafici/correlazione.png', dpi=300)
            print("Grafico salvato come 'grafici/correlazione.png'")
        
        plt.show()
    
    def grafico_mensile(self, salva=False):
        """
        Crea un grafico delle temperature medie mensili.
        
        Args:
            salva (bool): Se True, salva il grafico come file immagine
        """
        # Estrai mese e anno dalla data
        dati_mensili = self.dati.copy()
        dati_mensili['anno'] = dati_mensili['data'].dt.year
        dati_mensili['mese'] = dati_mensili['data'].dt.month
        
        # Calcola la media mensile delle temperature
        temp_mensili = dati_mensili.groupby(['anno', 'mese'])['temperatura'].mean().reset_index()
        
        # Crea etichette per l'asse x
        temp_mensili['etichetta'] = temp_mensili['anno'].astype(str) + '-' + temp_mensili['mese'].astype(str).str.zfill(2)
        
        plt.figure(figsize=(14, 6))
        plt.bar(temp_mensili['etichetta'], temp_mensili['temperatura'], color='orange', alpha=0.7)
        plt.title('Temperature Medie Mensili')
        plt.xlabel('Anno-Mese')
        plt.ylabel('Temperatura Media (°C)')
        plt.xticks(rotation=90)
        plt.grid(True, linestyle='--', alpha=0.7, axis='y')
        plt.tight_layout()
        
        if salva:
            plt.savefig('grafici/temperature_mensili.png', dpi=300)
            print("Grafico salvato come 'grafici/temperature_mensili.png'")
        
        plt.show()
    
    def dashboard_completa(self, salva=False):
        """
        Crea una dashboard con tutti i grafici principali.
        
        Args:
            salva (bool): Se True, salva il grafico come file immagine
        """
        plt.figure(figsize=(20, 15))
        
        # Grafico temperature
        plt.subplot(2, 2, 1)
        plt.plot(self.dati['data'], self.dati['temperatura'], 'r-', alpha=0.7)
        media_mobile = self.dati['temperatura'].rolling(window=7).mean()
        plt.plot(self.dati['data'], media_mobile, 'b-', linewidth=2, label='Media mobile (7 giorni)')
        plt.title('Andamento delle Temperature')
        plt.xlabel('Data')
        plt.ylabel('Temperatura (°C)')
        plt.legend()
        plt.grid(True, linestyle='--', alpha=0.7)
        
        # Grafico precipitazioni
        plt.subplot(2, 2, 2)
        plt.bar(self.dati['data'], self.dati['precipitazioni'], color='b', alpha=0.7, width=1)
        plt.title('Precipitazioni Giornaliere')
        plt.xlabel('Data')
        plt.ylabel('Precipitazioni (mm)')
        plt.grid(True, linestyle='--', alpha=0.7, axis='y')
        
        # Grafico correlazione
        plt.subplot(2, 2, 3)
        plt.scatter(self.dati['temperatura'], self.dati['umidita'], 
                   alpha=0.5, c=self.dati['precipitazioni'], cmap='viridis')
        plt.colorbar(label='Precipitazioni (mm)')
        plt.title('Correlazione tra Temperatura e Umidità')
        plt.xlabel('Temperatura (°C)')
        plt.ylabel('Umidità (%)')
        plt.grid(True, linestyle='--', alpha=0.7)
        
        # Grafico umidità
        plt.subplot(2, 2, 4)
        plt.plot(self.dati['data'], self.dati['umidita'], 'g-', alpha=0.7)
        plt.title('Andamento dell\'Umidità')
        plt.xlabel('Data')
        plt.ylabel('Umidità (%)')
        plt.grid(True, linestyle='--', alpha=0.7)
        
        plt.tight_layout()
        
        if salva:
            plt.savefig('grafici/dashboard.png', dpi=300)
            print("Dashboard salvata come 'grafici/dashboard.png'")
        
        plt.show()
```

## Fase 3: Script principale

Infine, creiamo il file `main.py` che utilizzerà le classi che abbiamo definito:

```python
# main.py
import os
import pandas as pd
import numpy as np
from analizzatore import AnalizzatoreDatiMeteo
from visualizzatore import VisualizzatoreDatiMeteo

def crea_dati_esempio():
    """
    Crea un file CSV di esempio con dati meteo simulati.
    """
    # Assicurati che la directory esista
    os.makedirs('data', exist_ok=True)
    
    # Crea date per un anno
    date_range = pd.date_range(start='2022-01-01', end='2022-12-31')
    
    # Simula temperature con variazione stagionale
    temp_base = 15  # temperatura media annuale
    temp_ampiezza = 10  # variazione stagionale
    temperature = [temp_base + temp_ampiezza * np.sin((i/365) * 2 * np.pi) + np.random.normal(0, 3) 
                  for i in range(len(date_range))]
    
    # Simula umidità (inversamente correlata alla temperatura, con rumore)
    umidita = [80 - 0.5 * temp + np.random.normal(0, 10) for temp in temperature]
    umidita = [max(0, min(100, u)) for u in umidita]  # Limita tra 0 e 100%
    
    # Simula precipitazioni (più probabili con alta umidità)
    precipitazioni = []
    for u in umidita:
        prob_pioggia = u / 200  # Probabilità di pioggia basata sull'umidità
        if np.random.random() < prob_pioggia:
            # Se piove, quantità variabile
            precipitazioni.append(np.random.exponential(5))
        else:
            precipitazioni.append(0)
    
    # Crea DataFrame
    df = pd.DataFrame({
        'data': date_range,
        'temperatura': temperature,
        'umidita': umidita,
        'precipitazioni': precipitazioni
    })
    
    # Salva come CSV
    file_path = 'data/dati_meteo.csv'
    df.to_csv(file_path, index=False)
    print(f"File di esempio creato: {file_path}")
    return file_path

def main():
    # Verifica se il file dati esiste, altrimenti crealo
    file_path = 'data/dati_meteo.csv'
    if not os.path.exists(file_path):
        file_path = crea_dati_esempio()
    
    # Inizializza l'analizzatore e carica i dati
    analizzatore = AnalizzatoreDatiMeteo(file_path)
    dati = analizzatore.carica_dati()
    
    if dati is not None:
        # Pulisci i dati
        dati_puliti = analizzatore.pulisci_dati()
        
        # Calcola statistiche
        stats = analizzatore.statistiche_base()
        print("\nStatistiche di base:")
        for chiave, valore in stats.items():
            if chiave != 'periodo_analisi':
                print(f"  {chiave}: {valore:.2f}")
            else:
                print(f"  Periodo: {valore['inizio'].date()} - {valore['fine'].date()} ({valore['durata_giorni']} giorni)")
        
        # Calcola dati mensili
        dati_mensili = analizzatore.dati_mensili()
        print("\nDati mensili (prime 3 righe):")
        print(dati_mensili.head(3))
        
        # Inizializza il visualizzatore
        visualizzatore = VisualizzatoreDatiMeteo(dati_puliti)
        
        # Genera e salva i grafici
        print("\nGenerazione grafici...")
        visualizzatore.grafico_temperature(salva=True)
        visualizzatore.grafico_precipitazioni(salva=True)
        visualizzatore.grafico_correlazione(salva=True)
        visualizzatore.grafico_mensile(salva=True)
        visualizzatore.dashboard_completa(salva=True)
        
        print("\nAnalisi completata con successo!")

if __name__ == "__main__":
    main()
```

## Esecuzione del progetto

Per eseguire il progetto, segui questi passaggi:

1. Crea una nuova cartella per il progetto
2. Crea i tre file Python come descritto sopra
3. Esegui lo script principale con il comando:

```bash
python main.py
```

Al primo avvio, lo script creerà automaticamente un file di dati meteo di esempio e genererà vari grafici nella cartella `grafici`.

## Risultati attesi

Dopo l'esecuzione, dovresti vedere:

1. Un output nel terminale con statistiche sui dati
2. Vari grafici visualizzati sullo schermo
3. I grafici salvati nella cartella `grafici`

## Sfide aggiuntive

Ecco alcune idee per estendere il progetto:

1. **Previsione del tempo**: Implementa un modello di machine learning semplice per prevedere le temperature future
2. **Interfaccia utente**: Crea una GUI con Tkinter o un'interfaccia web con Flask
3. **Dati reali**: Modifica il programma per scaricare dati meteo reali da API pubbliche
4. **Analisi avanzate**: Aggiungi analisi statistiche più avanzate, come l'identificazione di anomalie climatiche
5. **Esportazione report**: Genera un report PDF con i risultati dell'analisi

## Conclusione

In questo progetto, abbiamo creato un'applicazione completa per l'analisi di dati meteorologici. Abbiamo utilizzato Pandas per la manipolazione dei dati e Matplotlib per la visualizzazione, mettendo in pratica molte delle conoscenze acquisite nelle sezioni precedenti del corso.

Questo progetto dimostra come combinare diverse librerie Python per creare un'applicazione utile e funzionale. Le tecniche apprese qui possono essere applicate a molti altri tipi di analisi dati.

## Navigazione

- [Torna all'indice dei progetti](../README.md)
- [Progetto successivo: Web scraper di notizie](02-web-scraper-notizie.md)