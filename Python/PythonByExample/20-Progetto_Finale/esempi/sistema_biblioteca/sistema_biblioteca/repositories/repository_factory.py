#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Factory per i repository del Sistema di Gestione Biblioteca.

Questo modulo contiene la classe RepositoryFactory che si occupa di creare
i repository per le entità principali del sistema: Libro, Utente e Prestito.
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Type, TypeVar, Generic

from sistema_biblioteca.models.libro import Libro
from sistema_biblioteca.models.utente import Utente
from sistema_biblioteca.models.prestito import Prestito

logger = logging.getLogger(__name__)

# Tipo generico per i modelli
T = TypeVar('T')


class JsonRepository(Generic[T]):
    """
    Repository generico per la persistenza dei dati in formato JSON.
    
    Attributes:
        file_path (Path): Il percorso del file JSON.
        model_class (Type[T]): La classe del modello.
        items (Dict[str, T]): Gli elementi memorizzati nel repository.
    """
    
    def __init__(self, file_path: Path, model_class: Type[T]):
        """
        Inizializza un nuovo repository JSON.
        
        Args:
            file_path (Path): Il percorso del file JSON.
            model_class (Type[T]): La classe del modello.
        """
        self.file_path = file_path
        self.model_class = model_class
        self.items: Dict[str, T] = {}
        self._load()
    
    def _load(self) -> None:
        """
        Carica i dati dal file JSON.
        """
        if not self.file_path.exists():
            logger.info(f"Il file {self.file_path} non esiste. Verrà creato al primo salvataggio.")
            return
        
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for item_data in data:
                    item = self.model_class.from_dict(item_data)
                    self.items[item.id] = item
            logger.info(f"Caricati {len(self.items)} elementi da {self.file_path}")
        except Exception as e:
            logger.error(f"Errore durante il caricamento dei dati da {self.file_path}: {e}")
    
    def _save(self) -> None:
        """
        Salva i dati nel file JSON.
        """
        try:
            # Crea la directory se non esiste
            self.file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Serializza gli oggetti in una lista di dizionari
            data = [item.to_dict() for item in self.items.values()]
            
            # Salva i dati nel file JSON
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Salvati {len(self.items)} elementi in {self.file_path}")
        except Exception as e:
            logger.error(f"Errore durante il salvataggio dei dati in {self.file_path}: {e}")
    
    def get_all(self) -> List[T]:
        """
        Restituisce tutti gli elementi nel repository.
        
        Returns:
            List[T]: Una lista di tutti gli elementi.
        """
        return list(self.items.values())
    
    def get_by_id(self, id: str) -> T:
        """
        Restituisce un elemento per ID.
        
        Args:
            id (str): L'ID dell'elemento da cercare.
            
        Returns:
            T: L'elemento trovato.
            
        Raises:
            KeyError: Se l'elemento non esiste.
        """
        if id not in self.items:
            raise KeyError(f"Elemento con ID {id} non trovato")
        return self.items[id]
    
    def add(self, item: T) -> T:
        """
        Aggiunge un elemento al repository.
        
        Args:
            item (T): L'elemento da aggiungere.
            
        Returns:
            T: L'elemento aggiunto.
        """
        self.items[item.id] = item
        self._save()
        return item
    
    def update(self, item: T) -> T:
        """
        Aggiorna un elemento nel repository.
        
        Args:
            item (T): L'elemento da aggiornare.
            
        Returns:
            T: L'elemento aggiornato.
            
        Raises:
            KeyError: Se l'elemento non esiste.
        """
        if item.id not in self.items:
            raise KeyError(f"Elemento con ID {item.id} non trovato")
        
        self.items[item.id] = item
        self._save()
        return item
    
    def delete(self, id: str) -> None:
        """
        Elimina un elemento dal repository.
        
        Args:
            id (str): L'ID dell'elemento da eliminare.
            
        Raises:
            KeyError: Se l'elemento non esiste.
        """
        if id not in self.items:
            raise KeyError(f"Elemento con ID {id} non trovato")
        
        del self.items[id]
        self._save()
    
    def clear(self) -> None:
        """
        Elimina tutti gli elementi dal repository.
        """
        self.items.clear()
        self._save()


class RepositoryFactory:
    """
    Factory per la creazione dei repository.
    
    Attributes:
        data_dir (Path): La directory dei file di dati.
    """
    
    def __init__(self, data_dir: Path):
        """
        Inizializza una nuova factory per i repository.
        
        Args:
            data_dir (Path): La directory dei file di dati.
        """
        self.data_dir = data_dir
        self.data_dir.mkdir(parents=True, exist_ok=True)
    
    def create_libri_repository(self) -> JsonRepository[Libro]:
        """
        Crea un repository per i libri.
        
        Returns:
            JsonRepository[Libro]: Un repository per i libri.
        """
        file_path = self.data_dir / "libri.json"
        return JsonRepository(file_path, Libro)
    
    def create_utenti_repository(self) -> JsonRepository[Utente]:
        """
        Crea un repository per gli utenti.
        
        Returns:
            JsonRepository[Utente]: Un repository per gli utenti.
        """
        file_path = self.data_dir / "utenti.json"
        return JsonRepository(file_path, Utente)
    
    def create_prestiti_repository(self) -> JsonRepository[Prestito]:
        """
        Crea un repository per i prestiti.
        
        Returns:
            JsonRepository[Prestito]: Un repository per i prestiti.
        """
        file_path = self.data_dir / "prestiti.json"
        return JsonRepository(file_path, Prestito)