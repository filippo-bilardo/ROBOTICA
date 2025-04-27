#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Modello Libro per il Sistema di Gestione Biblioteca.

Questo modulo contiene la classe Libro che rappresenta un libro
nel sistema di gestione della biblioteca.
"""

import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Optional, List


@dataclass
class Libro:
    """
    Rappresenta un libro nel sistema di gestione della biblioteca.
    
    Attributes:
        titolo (str): Il titolo del libro.
        autore (str): L'autore del libro.
        isbn (str): Il codice ISBN del libro.
        anno_pubblicazione (int): L'anno di pubblicazione del libro.
        editore (str): L'editore del libro.
        genere (str): Il genere del libro.
        disponibile (bool): Indica se il libro è disponibile per il prestito.
        id (str): L'identificatore unico del libro.
        data_aggiunta (datetime): La data in cui il libro è stato aggiunto al catalogo.
        descrizione (str): Una breve descrizione del libro.
        copie_totali (int): Il numero totale di copie del libro.
        copie_disponibili (int): Il numero di copie disponibili per il prestito.
        posizione (str): La posizione del libro nella biblioteca (es. "Scaffale A3").
        note (str): Note aggiuntive sul libro.
    """
    titolo: str
    autore: str
    isbn: str
    anno_pubblicazione: int
    editore: str
    genere: str
    disponibile: bool = True
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    data_aggiunta: datetime = field(default_factory=datetime.now)
    descrizione: str = ""
    copie_totali: int = 1
    copie_disponibili: int = 1
    posizione: str = ""
    note: str = ""
    
    def __post_init__(self):
        """
        Validazione dei dati dopo l'inizializzazione.
        """
        if not self.titolo or not self.autore or not self.isbn:
            raise ValueError("Titolo, autore e ISBN sono campi obbligatori")
        
        if self.anno_pubblicazione <= 0:
            raise ValueError("L'anno di pubblicazione deve essere un numero positivo")
        
        if self.copie_totali < 0 or self.copie_disponibili < 0:
            raise ValueError("Il numero di copie non può essere negativo")
        
        if self.copie_disponibili > self.copie_totali:
            raise ValueError("Il numero di copie disponibili non può superare il totale")
    
    def prestare(self) -> bool:
        """
        Presta una copia del libro se disponibile.
        
        Returns:
            bool: True se il prestito è avvenuto con successo, False altrimenti.
        """
        if self.copie_disponibili > 0:
            self.copie_disponibili -= 1
            self.disponibile = self.copie_disponibili > 0
            return True
        return False
    
    def restituire(self) -> bool:
        """
        Restituisce una copia del libro.
        
        Returns:
            bool: True se la restituzione è avvenuta con successo, False altrimenti.
        """
        if self.copie_disponibili < self.copie_totali:
            self.copie_disponibili += 1
            self.disponibile = True
            return True
        return False
    
    def to_dict(self) -> Dict:
        """
        Converte l'oggetto in un dizionario per la serializzazione.
        
        Returns:
            Dict: Un dizionario che rappresenta l'oggetto.
        """
        return {
            "id": self.id,
            "titolo": self.titolo,
            "autore": self.autore,
            "isbn": self.isbn,
            "anno_pubblicazione": self.anno_pubblicazione,
            "editore": self.editore,
            "genere": self.genere,
            "disponibile": self.disponibile,
            "data_aggiunta": self.data_aggiunta.isoformat(),
            "descrizione": self.descrizione,
            "copie_totali": self.copie_totali,
            "copie_disponibili": self.copie_disponibili,
            "posizione": self.posizione,
            "note": self.note
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Libro':
        """
        Crea un oggetto Libro da un dizionario.
        
        Args:
            data (Dict): Un dizionario che rappresenta un libro.
            
        Returns:
            Libro: Un'istanza della classe Libro.
        """
        # Gestione della data_aggiunta
        if "data_aggiunta" in data and isinstance(data["data_aggiunta"], str):
            data["data_aggiunta"] = datetime.fromisoformat(data["data_aggiunta"])
        
        return cls(**data)
    
    def __str__(self) -> str:
        """
        Restituisce una rappresentazione testuale del libro.
        
        Returns:
            str: Una stringa che rappresenta il libro.
        """
        stato = "Disponibile" if self.disponibile else "Non disponibile"
        return f"{self.titolo} di {self.autore} ({self.anno_pubblicazione}) - {stato}"