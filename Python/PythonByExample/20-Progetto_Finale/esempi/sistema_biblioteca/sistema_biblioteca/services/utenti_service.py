#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servizio per la gestione degli utenti.

Questo modulo contiene la classe UtentiService che implementa la logica di business
per la gestione degli utenti nel sistema di gestione della biblioteca.
"""

import logging
from typing import List, Optional, Dict, Any

from sistema_biblioteca.models.utente import Utente
from sistema_biblioteca.repositories.repository_factory import JsonRepository

logger = logging.getLogger(__name__)


class UtentiService:
    """
    Servizio per la gestione degli utenti.
    
    Attributes:
        repository (JsonRepository[Utente]): Il repository per gli utenti.
    """
    
    def __init__(self, repository: JsonRepository[Utente]):
        """
        Inizializza un nuovo servizio per gli utenti.
        
        Args:
            repository (JsonRepository[Utente]): Il repository per gli utenti.
        """
        self.repository = repository
    
    def get_all_utenti(self) -> List[Utente]:
        """
        Restituisce tutti gli utenti registrati.
        
        Returns:
            List[Utente]: Una lista di tutti gli utenti.
        """
        return self.repository.get_all()
    
    def get_utente_by_id(self, id: str) -> Utente:
        """
        Restituisce un utente per ID.
        
        Args:
            id (str): L'ID dell'utente da cercare.
            
        Returns:
            Utente: L'utente trovato.
            
        Raises:
            KeyError: Se l'utente non esiste.
        """
        return self.repository.get_by_id(id)
    
    def add_utente(self, utente: Utente) -> Utente:
        """
        Aggiunge un utente al sistema.
        
        Args:
            utente (Utente): L'utente da aggiungere.
            
        Returns:
            Utente: L'utente aggiunto.
        """
        logger.info(f"Aggiunto nuovo utente: {utente.nome_completo}")
        return self.repository.add(utente)
    
    def update_utente(self, utente: Utente) -> Utente:
        """
        Aggiorna un utente nel sistema.
        
        Args:
            utente (Utente): L'utente da aggiornare.
            
        Returns:
            Utente: L'utente aggiornato.
            
        Raises:
            KeyError: Se l'utente non esiste.
        """
        logger.info(f"Aggiornato utente: {utente.nome_completo}")
        return self.repository.update(utente)
    
    def delete_utente(self, id: str) -> None:
        """
        Elimina un utente dal sistema.
        
        Args:
            id (str): L'ID dell'utente da eliminare.
            
        Raises:
            KeyError: Se l'utente non esiste.
        """
        utente = self.repository.get_by_id(id)
        logger.info(f"Eliminato utente: {utente.nome_completo}")
        self.repository.delete(id)
    
    def search_utenti(self, query: str) -> List[Utente]:
        """
        Cerca utenti nel sistema.
        
        Args:
            query (str): La query di ricerca.
            
        Returns:
            List[Utente]: Una lista di utenti che corrispondono alla query.
        """
        query = query.lower()
        results = []
        
        for utente in self.repository.get_all():
            # Cerca nel nome, cognome, email, telefono e indirizzo
            if (query in utente.nome.lower() or
                query in utente.cognome.lower() or
                query in utente.email.lower() or
                query in utente.telefono.lower() or
                query in utente.indirizzo.lower()):
                results.append(utente)
        
        return results
    
    def get_utenti_attivi(self) -> List[Utente]:
        """
        Restituisce gli utenti attivi nel sistema.
        
        Returns:
            List[Utente]: Una lista di utenti attivi.
        """
        return [utente for utente in self.repository.get_all() if utente.attivo]
    
    def disattiva_utente(self, id: str) -> Utente:
        """
        Disattiva un utente nel sistema.
        
        Args:
            id (str): L'ID dell'utente da disattivare.
            
        Returns:
            Utente: L'utente disattivato.
            
        Raises:
            KeyError: Se l'utente non esiste.
        """
        utente = self.repository.get_by_id(id)
        utente.disattiva()
        logger.info(f"Disattivato utente: {utente.nome_completo}")
        return self.repository.update(utente)
    
    def attiva_utente(self, id: str) -> Utente:
        """
        Attiva un utente nel sistema.
        
        Args:
            id (str): L'ID dell'utente da attivare.
            
        Returns:
            Utente: L'utente attivato.
            
        Raises:
            KeyError: Se l'utente non esiste.
        """
        utente = self.repository.get_by_id(id)
        utente.attiva()
        logger.info(f"Attivato utente: {utente.nome_completo}")
        return self.repository.update(utente)
    
    def get_statistiche_utenti(self) -> Dict[str, Any]:
        """
        Restituisce statistiche sugli utenti.
        
        Returns:
            Dict[str, Any]: Un dizionario con le statistiche.
        """
        utenti = self.repository.get_all()
        
        # Calcola le statistiche
        totale_utenti = len(utenti)
        utenti_attivi = sum(1 for utente in utenti if utente.attivo)
        utenti_non_attivi = totale_utenti - utenti_attivi
        
        return {
            "totale_utenti": totale_utenti,
            "utenti_attivi": utenti_attivi,
            "utenti_non_attivi": utenti_non_attivi
        }