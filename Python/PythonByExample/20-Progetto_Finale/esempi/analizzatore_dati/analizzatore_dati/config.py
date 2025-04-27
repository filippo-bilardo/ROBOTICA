# analizzatore_dati/config.py

import yaml

def load_config(config_path='config.yaml'):
    """Carica la configurazione da un file YAML."""
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
            return config if config else {}
    except FileNotFoundError:
        print(f"Attenzione: File di configurazione '{config_path}' non trovato. Utilizzo configurazione di default.")
        return {}
    except yaml.YAMLError as e:
        print(f"Errore durante il parsing del file di configurazione '{config_path}': {e}")
        return {}

# Esempio di utilizzo (opzionale)
if __name__ == '__main__':
    # Crea un file config.yaml di esempio se non esiste
    default_config_content = """
    api_settings:
      base_url: "https://api.example.com"
      timeout: 10
    # Aggiungere altre configurazioni qui
    """
    try:
        with open('config.yaml', 'x', encoding='utf-8') as f:
            f.write(default_config_content)
            print("Creato file config.yaml di esempio.")
    except FileExistsError:
        pass # Il file esiste già

    config = load_config()
    print("Configurazione caricata:")
    print(config)
    api_url = config.get('api_settings', {}).get('base_url', 'URL non configurato')
    print(f"URL API: {api_url}")