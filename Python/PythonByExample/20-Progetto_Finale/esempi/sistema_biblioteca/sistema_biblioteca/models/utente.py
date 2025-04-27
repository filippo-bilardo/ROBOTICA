#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Modello Utente per il Sistema di Gestione Biblioteca.

Questo modulo contiene la classe Utente che rappresenta un utente
registrato nel sistema di gestione della biblioteca.
"""

import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional


@dataclass
class Utente:
    """
    Rappresenta un utente registrato nel sistema di gestione della biblioteca.
    
    Attributes:
        nome (str): Il nome dell'utente.
        cognome (str): Il cognome dell'utente.
        email (str): L'indirizzo email dell'utente.
        telefono (str): Il numero di telefono dell'utente.
        indirizzo (str): L'indirizzo dell'utente.
        data_registrazione (datetime): La data di registrazione dell'utente.
        id (str): L'identificatore unico dell'utente.
        attivo (bool): Indica se l'utente è attivo nel sistema.
        note (str): Note aggiuntive sull'utente.
    """
    nome: str
    cognome: str
    email: str
    telefono: str = ""
    indirizzo: str = ""
    data_registrazione: datetime = field(default_factory=datetime.now)
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    attivo: bool = True
    note: str = ""
    
    def __post_init__(self):
        """
        Validazione dei dati dopo l'inizializzazione.
        """
        if not self.nome or not self.cognome or not self.email:
            raise ValueError("Nome, cognome e email sono campi obbligatori")
        
        # Validazione semplice dell'email
        if "@" not in self.email or "." not in self.email:
            raise ValueError("Formato email non valido")
    
    @property
    def nome_completo(self) -> str:
        """
        Restituisce il nome completo dell'utente.
        
        Returns:
            str: Il nome completo dell'utente (nome + cognome).
        """
        return f"{self.nome} {self.cognome}"
    
    def disattiva(self) -> None:
        """
        Disattiva l'utente nel sistema.
        """
        self.attivo = False
    
    def attiva(self) -> None:
        """
        Attiva l'utente nel sistema.
        """
        self.attivo = True
    
    def to_dict(self) -> Dict:
        """
        Converte l'oggetto in un dizionario per la serializzazione.
        
        Returns:
            Dict: Un dizionario che rappresenta l'oggetto.
        """
        return {
            "id": self.id,
            "nome": self.nome,
            "cognome": self.cognome,
            "email": self.email,
            "telefono": self.telefono,
            "indirizzo": self.indirizzo,
            "data_registrazione": self.data_registrazione.isoformat(),
            "attivo": self.attivo,
            "note": self.note
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Utente':
        """
        Crea un oggetto Utente da un dizionario.
        
        Args:
            data (Dict): Un dizionario che rappresenta un utente.
            
        Returns:
            Utente: Un'istanza della classe Utente.
        """
        # Gestione della data_registrazione
        if "data_registrazione" in data and isinstance(data["data_registrazione"], str):
            data["data_registrazione"] = datetime.fromisoformat(data["data_registrazione"])
        
        return cls(**data)
    
    def __str__(self) -> str:
        """
        Restituisce una rappresentazione testuale dell'utente.
        
        Returns:
            str: Una stringa che rappresenta l'utente.
        """
        stato = "Attivo" if self.attivo else "Non attivo"
        return f"{self.nome_completo} ({self.email}) - {stato}"