import json
import os
from typing import List, Dict, Any

class JsonRepository:
    """Un repository generico per salvare e caricare dati da un file JSON."""

    def __init__(self, file_path: str):
        """Inizializza il repository con il percorso del file JSON."""
        self.file_path = file_path
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        """Assicura che il file JSON esista, creandolo vuoto se necessario."""
        if not os.path.exists(self.file_path):
            # Crea le directory parent se non esistono
            os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
            # Crea un file JSON vuoto (lista vuota come default)
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump([], f)

    def load_all(self) -> List[Dict[str, Any]]:
        """Carica tutti i dati dal file JSON."""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Assicura che i dati siano una lista
                return data if isinstance(data, list) else []
        except (FileNotFoundError, json.JSONDecodeError):
            # Se il file non esiste o è corrotto, ritorna una lista vuota
            self._ensure_file_exists() # Tenta di ricreare il file se mancante
            return []

    def save_all(self, data: List[Dict[str, Any]]):
        """Salva tutti i dati nel file JSON."""
        try:
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
        except IOError as e:
            print(f"Errore durante il salvataggio dei dati su {self.file_path}: {e}")

    def add(self, item: Dict[str, Any]):
        """Aggiunge un nuovo elemento ai dati."""
        all_data = self.load_all()
        all_data.append(item)
        self.save_all(all_data)

    def find_by_id(self, item_id: Any, id_field: str = 'id') -> Dict[str, Any] | None:
        """Trova un elemento per ID."""
        all_data = self.load_all()
        for item in all_data:
            if item.get(id_field) == item_id:
                return item
        return None

    def update(self, item_id: Any, updated_data: Dict[str, Any], id_field: str = 'id'):
        """Aggiorna un elemento esistente per ID."""
        all_data = self.load_all()
        updated = False
        for i, item in enumerate(all_data):
            if item.get(id_field) == item_id:
                all_data[i] = updated_data
                updated = True
                break
        if updated:
            self.save_all(all_data)
        return updated

    def delete(self, item_id: Any, id_field: str = 'id') -> bool:
        """Elimina un elemento per ID."""
        all_data = self.load_all()
        initial_length = len(all_data)
        # Filtra mantenendo gli elementi che NON hanno l'ID specificato
        filtered_data = [item for item in all_data if item.get(id_field) != item_id]
        if len(filtered_data) < initial_length:
            self.save_all(filtered_data)
            return True
        return False