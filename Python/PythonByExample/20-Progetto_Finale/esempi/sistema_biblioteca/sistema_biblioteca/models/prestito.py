#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Modello Prestito per il Sistema di Gestione Biblioteca.

Questo modulo contiene la classe Prestito che rappresenta un prestito
di un libro a un utente nel sistema di gestione della biblioteca.
"""

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Dict, Optional


@dataclass
class Prestito:
    """
    Rappresenta un prestito di un libro a un utente.
    
    Attributes:
        id_libro (str): L'identificatore del libro prestato.
        id_utente (str): L'identificatore dell'utente che ha preso in prestito il libro.
        data_prestito (datetime): La data in cui è stato effettuato il prestito.
        data_restituzione_prevista (datetime): La data prevista per la restituzione.
        data_restituzione_effettiva (Optional[datetime]): La data in cui il libro è stato effettivamente restituito.
        id (str): L'identificatore unico del prestito.
        rinnovato (bool): Indica se il prestito è stato rinnovato.
        numero_rinnovi (int): Il numero di volte che il prestito è stato rinnovato.
        note (str): Note aggiuntive sul prestito.
    """
    id_libro: str
    id_utente: str
    data_prestito: datetime = field(default_factory=datetime.now)
    data_restituzione_prevista: datetime = field(default_factory=lambda: datetime.now() + timedelta(days=30))
    data_restituzione_effettiva: Optional[datetime] = None
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    rinnovato: bool = False
    numero_rinnovi: int = 0
    note: str = ""
    
    def __post_init__(self):
        """
        Validazione dei dati dopo l'inizializzazione.
        """
        if not self.id_libro or not self.id_utente:
            raise ValueError("ID libro e ID utente sono campi obbligatori")
        
        if self.data_restituzione_prevista < self.data_prestito:
            raise ValueError("La data di restituzione prevista non può essere anteriore alla data di prestito")
        
        if self.data_restituzione_effettiva and self.data_restituzione_effettiva < self.data_prestito:
            raise ValueError("La data di restituzione effettiva non può essere anteriore alla data di prestito")
    
    @property
    def is_restituito(self) -> bool:
        """
        Verifica se il libro è stato restituito.
        
        Returns:
            bool: True se il libro è stato restituito, False altrimenti.
        """
        return self.data_restituzione_effettiva is not None
    
    @property
    def is_in_ritardo(self) -> bool:
        """
        Verifica se il prestito è in ritardo.
        
        Returns:
            bool: True se il prestito è in ritardo, False altrimenti.
        """
        if self.is_restituito:
            return self.data_restituzione_effettiva > self.data_restituzione_prevista
        return datetime.now() > self.data_restituzione_prevista
    
    @property
    def giorni_ritardo(self) -> int:
        """
        Calcola i giorni di ritardo nella restituzione.
        
        Returns:
            int: Il numero di giorni di ritardo (0 se non c'è ritardo).
        """
        if not self.is_in_ritardo:
            return 0
        
        if self.is_restituito:
            delta = self.data_restituzione_effettiva - self.data_restituzione_prevista
        else:
            delta = datetime.now() - self.data_restituzione_prevista
        
        return max(0, delta.days)
    
    def restituisci(self) -> None:
        """
        Registra la restituzione del libro.
        """
        if not self.is_restituito:
            self.data_restituzione_effettiva = datetime.now()
    
    def rinnova(self, giorni: int = 30) -> bool:
        """
        Rinnova il prestito estendendo la data di restituzione prevista.
        
        Args:
            giorni (int): Il numero di giorni di estensione.
            
        Returns:
            bool: True se il rinnovo è avvenuto con successo, False altrimenti.
        """
        # Non si può rinnovare un prestito già restituito
        if self.is_restituito:
            return False
        
        # Limite al numero di rinnovi (esempio: massimo 3 rinnovi)
        if self.numero_rinnovi >= 3:
            return False
        
        self.data_restituzione_prevista = self.data_restituzione_prevista + timedelta(days=giorni)
        self.rinnovato = True
        self.numero_rinnovi += 1
        return True
    
    def to_dict(self) -> Dict:
        """
        Converte l'oggetto in un dizionario per la serializzazione.
        
        Returns:
            Dict: Un dizionario che rappresenta l'oggetto.
        """
        result = {
            "id": self.id,
            "id_libro": self.id_libro,
            "id_utente": self.id_utente,
            "data_prestito": self.data_prestito.isoformat(),
            "data_restituzione_prevista": self.data_restituzione_prevista.isoformat(),
            "data_restituzione_effettiva": self.data_restituzione_effettiva.isoformat() if self.data_restituzione_effettiva else None,
            "rinnovato": self.rinnovato,
            "numero_rinnovi": self.numero_rinnovi,
            "note": self.note
        }
        return result
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Prestito':
        """
        Crea un oggetto Prestito da un dizionario.
        
        Args:
            data (Dict): Un dizionario che rappresenta un prestito.
            
        Returns:
            Prestito: Un'istanza della classe Prestito.
        """
        # Gestione delle date
        if "data_prestito" in data and isinstance(data["data_prestito"], str):
            data["data_prestito"] = datetime.fromisoformat(data["data_prestito"])
        
        if "data_restituzione_prevista" in data and isinstance(data["data_restituzione_prevista"], str):
            data["data_restituzione_prevista"] = datetime.fromisoformat(data["data_restituzione_prevista"])
        
        if "data_restituzione_effettiva" in data and data["data_restituzione_effettiva"] and isinstance(data["data_restituzione_effettiva"], str):
            data["data_restituzione_effettiva"] = datetime.fromisoformat(data["data_restituzione_effettiva"])
        
        return cls(**data)
    
    def __str__(self) -> str:
        """
        Restituisce una rappresentazione testuale del prestito.
        
        Returns:
            str: Una stringa che rappresenta il prestito.
        """
        stato = "Restituito" if self.is_restituito else "In corso"
        if not self.is_restituito and self.is_in_ritardo:
            stato = f"In ritardo di {self.giorni_ritardo} giorni"
        
        return f"Prestito {self.id[:8]} - {stato} - Scadenza: {self.data_restituzione_prevista.strftime('%d/%m/%Y')}"