# analizzatore_dati/visualization/plotter.py

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

class DataPlotter:
    """Classe per creare visualizzazioni dai dati."""
    def __init__(self, dataframe: pd.DataFrame):
        if not isinstance(dataframe, pd.DataFrame):
            raise ValueError("L'input deve essere un DataFrame pandas.")
        self.df = dataframe
        # Imposta uno stile gradevole per i grafici
        sns.set_theme(style="whitegrid")

    def plot_histogram(self, column_name: str, bins: int = 10, save_path: str = None):
        """Crea un istogramma per una colonna numerica specificata."""
        if column_name not in self.df.columns:
            raise ValueError(f"La colonna '{column_name}' non esiste nel DataFrame.")
        if not pd.api.types.is_numeric_dtype(self.df[column_name]):
            raise TypeError(f"La colonna '{column_name}' non è numerica.")

        print(f"Creazione istogramma per '{column_name}'...")
        plt.figure(figsize=(10, 6))
        sns.histplot(self.df[column_name], bins=bins, kde=True)
        plt.title(f'Istogramma di {column_name}')
        plt.xlabel(column_name)
        plt.ylabel('Frequenza')

        if save_path:
            plt.savefig(save_path)
            print(f"Istogramma salvato in '{save_path}'")
        else:
            plt.show()
        plt.close() # Chiude la figura per liberare memoria

    def plot_scatterplot(self, x_column: str, y_column: str, save_path: str = None):
        """Crea un grafico a dispersione tra due colonne numeriche."""
        if x_column not in self.df.columns or y_column not in self.df.columns:
            raise ValueError(f"Una o entrambe le colonne '{x_column}', '{y_column}' non esistono.")
        if not pd.api.types.is_numeric_dtype(self.df[x_column]) or not pd.api.types.is_numeric_dtype(self.df[y_column]):
            raise TypeError("Entrambe le colonne devono essere numeriche per lo scatter plot.")

        print(f"Creazione scatter plot tra '{x_column}' e '{y_column}'...")
        plt.figure(figsize=(10, 6))
        sns.scatterplot(x=self.df[x_column], y=self.df[y_column])
        plt.title(f'Scatter Plot: {y_column} vs {x_column}')
        plt.xlabel(x_column)
        plt.ylabel(y_column)

        if save_path:
            plt.savefig(save_path)
            print(f"Scatter plot salvato in '{save_path}'")
        else:
            plt.show()
        plt.close()

    # Aggiungere qui altri metodi di plotting (es. boxplot, bar chart, ecc.)