# analizzatore_dati/utils/helpers.py

import os

def ensure_dir_exists(directory_path: str):
    """Assicura che una directory esista, creandola se necessario."""
    if not os.path.exists(directory_path):
        print(f"Creazione della directory: {directory_path}")
        try:
            os.makedirs(directory_path)
            print("Directory creata con successo.")
        except OSError as e:
            print(f"Errore durante la creazione della directory {directory_path}: {e}")
            raise
    else:
        print(f"La directory '{directory_path}' esiste già.")

# Aggiungere qui altre funzioni di utilità (es. logging, formattazione, ecc.)