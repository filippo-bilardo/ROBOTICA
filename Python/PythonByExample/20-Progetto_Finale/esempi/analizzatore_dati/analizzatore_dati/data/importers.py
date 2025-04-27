# analizzatore_dati/data/importers.py

import pandas as pd
import requests
import json
from abc import ABC, abstractmethod

class BaseImporter(ABC):
    """Classe base astratta per gli importatori di dati."""
    def __init__(self, source):
        self.source = source

    @abstractmethod
    def import_data(self) -> pd.DataFrame:
        """Metodo astratto per importare i dati."""
        pass

class CSVImporter(BaseImporter):
    """Importa dati da un file CSV."""
    def import_data(self) -> pd.DataFrame:
        """Carica dati da un file CSV utilizzando pandas."""
        try:
            print(f"Importazione dati da CSV: {self.source}")
            df = pd.read_csv(self.source)
            print("Importazione CSV completata.")
            return df
        except FileNotFoundError:
            print(f"Errore: File CSV non trovato a '{self.source}'")
            raise
        except Exception as e:
            print(f"Errore durante l'importazione del CSV: {e}")
            raise

class JSONImporter(BaseImporter):
    """Importa dati da un file JSON."""
    def import_data(self) -> pd.DataFrame:
        """Carica dati da un file JSON utilizzando pandas."""
        try:
            print(f"Importazione dati da JSON: {self.source}")
            # pd.read_json può leggere diverse strutture JSON
            # orient='records' è comune per liste di oggetti JSON
            df = pd.read_json(self.source, orient='records', lines=False) # Prova 'lines=True' se ogni riga è un JSON
            print("Importazione JSON completata.")
            return df
        except FileNotFoundError:
            print(f"Errore: File JSON non trovato a '{self.source}'")
            raise
        except ValueError as e:
            print(f"Errore di formato JSON: {e}. Prova a specificare 'orient' o 'lines=True'.")
            raise
        except Exception as e:
            print(f"Errore durante l'importazione del JSON: {e}")
            raise

class APIImporter(BaseImporter):
    """Importa dati da un'API web."""
    def __init__(self, source, params=None, headers=None):
        """Inizializza con URL, parametri opzionali e header."""
        super().__init__(source)
        self.params = params or {}
        self.headers = headers or {}

    def import_data(self) -> pd.DataFrame:
        """Effettua una richiesta GET all'API e carica i dati JSON in un DataFrame."""
        try:
            print(f"Importazione dati da API: {self.source}")
            response = requests.get(self.source, params=self.params, headers=self.headers, timeout=10)
            response.raise_for_status()  # Solleva un'eccezione per risposte HTTP non riuscite (es. 404, 500)
            data = response.json()
            print("Risposta API ricevuta.")

            # L'API potrebbe restituire dati in formati diversi (lista di dict, dict con chiave dati, ecc.)
            # Questo è un esempio generico, potrebbe essere necessario adattarlo
            if isinstance(data, list):
                df = pd.DataFrame(data)
            elif isinstance(data, dict) and 'results' in data: # Esempio comune
                df = pd.DataFrame(data['results'])
            elif isinstance(data, dict) and 'data' in data: # Altro esempio comune
                df = pd.DataFrame(data['data'])
            else:
                # Prova a normalizzare se è un JSON complesso
                df = pd.json_normalize(data)

            print("Importazione API completata.")
            return df
        except requests.exceptions.RequestException as e:
            print(f"Errore di rete durante la chiamata API a '{self.source}': {e}")
            raise
        except json.JSONDecodeError:
            print(f"Errore: La risposta dall'API non è un JSON valido.")
            raise
        except Exception as e:
            print(f"Errore durante l'importazione dall'API: {e}")
            raise