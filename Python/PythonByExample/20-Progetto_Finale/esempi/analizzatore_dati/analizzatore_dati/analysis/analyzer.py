# analizzatore_dati/analysis/analyzer.py

import pandas as pd

class DataAnalyzer:
    """Classe per eseguire analisi sui dati caricati."""
    def __init__(self, dataframe: pd.DataFrame):
        if not isinstance(dataframe, pd.DataFrame):
            raise ValueError("L'input deve essere un DataFrame pandas.")
        self.df = dataframe

    def get_summary_statistics(self) -> pd.DataFrame:
        """Calcola statistiche descrittive per le colonne numeriche."""
        print("Calcolo statistiche descrittive...")
        try:
            summary = self.df.describe()
            print("Statistiche calcolate.")
            return summary
        except Exception as e:
            print(f"Errore durante il calcolo delle statistiche: {e}")
            raise

    def get_value_counts(self, column_name: str) -> pd.Series:
        """Calcola il conteggio dei valori unici per una colonna specificata."""
        if column_name not in self.df.columns:
            raise ValueError(f"La colonna '{column_name}' non esiste nel DataFrame.")
        print(f"Calcolo conteggio valori per la colonna '{column_name}'...")
        try:
            counts = self.df[column_name].value_counts()
            print("Conteggio valori completato.")
            return counts
        except Exception as e:
            print(f"Errore durante il calcolo del conteggio valori: {e}")
            raise

    # Aggiungere qui altri metodi di analisi (es. correlazioni, aggregazioni, ecc.)