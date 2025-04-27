#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servizio per la gestione dei prestiti.

Questo modulo contiene la classe PrestitiService che implementa la logica di business
per la gestione dei prestiti nel sistema di gestione della biblioteca.
"""

import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple

from sistema_biblioteca.models.prestito import Prestito
from sistema_biblioteca.models.libro import Libro
from sistema_biblioteca.models.utente import Utente
from sistema_biblioteca.repositories.repository_factory import JsonRepository

logger = logging.getLogger(__name__)


class PrestitiService:
    """
    Servizio per la gestione dei prestiti.
    
    Attributes:
        repository (JsonRepository[Prestito]): Il repository per i prestiti.
        libri_repository (JsonRepository[Libro]): Il repository per i libri.
        utenti_repository (JsonRepository[Utente]): Il repository per gli utenti.
    """
    
    def __init__(self, repository: JsonRepository[Prestito], 
                 libri_repository: JsonRepository[Libro],
                 utenti_repository: JsonRepository[Utente]):
        """
        Inizializza un nuovo servizio per i prestiti.
        
        Args:
            repository (JsonRepository[Prestito]): Il repository per i prestiti.
            libri_repository (JsonRepository[Libro]): Il repository per i libri.
            utenti_repository (JsonRepository[Utente]): Il repository per gli utenti.
        """
        self.repository = repository
        self.libri_repository = libri_repository
        self.utenti_repository = utenti_repository
    
    def get_all_prestiti(self) -> List[Prestito]:
        """
        Restituisce tutti i prestiti registrati.
        
        Returns:
            List[Prestito]: Una lista di tutti i prestiti.
        """
        return self.repository.get_all()
    
    def get_prestito_by_id(self, id: str) -> Prestito:
        """
        Restituisce un prestito per ID.
        
        Args:
            id (str): L'ID del prestito da cercare.
            
        Returns:
            Prestito: Il prestito trovato.
            
        Raises:
            KeyError: Se il prestito non esiste.
        """
        return self.repository.get_by_id(id)
    
    def crea_prestito(self, id_libro: str, id_utente: str, giorni_durata: int = 30) -> Tuple[Prestito, str]:
        """
        Crea un nuovo prestito.
        
        Args:
            id_libro (str): L'ID del libro da prestare.
            id_utente (str): L'ID dell'utente che prende in prestito il libro.
            giorni_durata (int): La durata del prestito in giorni.
            
        Returns:
            Tuple[Prestito, str]: Il prestito creato e un messaggio di esito.
            
        Raises:
            KeyError: Se il libro o l'utente non esistono.
            ValueError: Se il libro non è disponibile o l'utente non è attivo.
        """
        # Verifica che il libro esista
        try:
            libro = self.libri_repository.get_by_id(id_libro)
        except KeyError:
            raise KeyError(f"Libro con ID {id_libro} non trovato")
        
        # Verifica che l'utente esista
        try:
            utente = self.utenti_repository.get_by_id(id_utente)
        except KeyError:
            raise KeyError(f"Utente con ID {id_utente} non trovato")
        
        # Verifica che il libro sia disponibile
        if not libro.disponibile:
            raise ValueError(f"Il libro '{libro.titolo}' non è disponibile per il prestito")
        
        # Verifica che l'utente sia attivo
        if not utente.attivo:
            raise ValueError(f"L'utente {utente.nome_completo} non è attivo")
        
        # Crea il prestito
        data_prestito = datetime.now()
        data_restituzione_prevista = data_prestito + timedelta(days=giorni_durata)
        
        prestito = Prestito(
            id_libro=id_libro,
            id_utente=id_utente,
            data_prestito=data_prestito,
            data_restituzione_prevista=data_restituzione_prevista
        )
        
        # Aggiorna lo stato del libro
        libro.prestare()
        self.libri_repository.update(libro)
        
        # Salva il prestito
        self.repository.add(prestito)
        
        logger.info(f"Creato nuovo prestito: {prestito.id} - Libro: {libro.titolo}, Utente: {utente.nome_completo}")
        return prestito, f"Prestito creato con successo. Da restituire entro il {data_restituzione_prevista.strftime('%d/%m/%Y')}"
    
    def registra_restituzione(self, id_prestito: str) -> Tuple[Prestito, str]:
        """
        Registra la restituzione di un libro.
        
        Args:
            id_prestito (str): L'ID del prestito da chiudere.
            
        Returns:
            Tuple[Prestito, str]: Il prestito aggiornato e un messaggio di esito.
            
        Raises:
            KeyError: Se il prestito non esiste.
            ValueError: Se il prestito è già stato restituito.
        """
        # Verifica che il prestito esista
        try:
            prestito = self.repository.get_by_id(id_prestito)
        except KeyError:
            raise KeyError(f"Prestito con ID {id_prestito} non trovato")
        
        # Verifica che il prestito non sia già stato restituito
        if prestito.is_restituito:
            raise ValueError(f"Il prestito {id_prestito} è già stato restituito")
        
        # Registra la restituzione
        prestito.restituisci()
        
        # Aggiorna lo stato del libro
        try:
            libro = self.libri_repository.get_by_id(prestito.id_libro)
            libro.restituire()
            self.libri_repository.update(libro)
        except KeyError:
            logger.warning(f"Libro con ID {prestito.id_libro} non trovato durante la restituzione")
        
        # Salva il prestito aggiornato
        self.repository.update(prestito)
        
        # Prepara il messaggio di esito
        messaggio = "Restituzione registrata con successo"
        if prestito.is_in_ritardo:
            messaggio += f". Restituzione in ritardo di {prestito.giorni_ritardo} giorni"
        
        logger.info(f"Registrata restituzione per il prestito: {prestito.id}")
        return prestito, messaggio
    
    def rinnova_prestito(self, id_prestito: str, giorni_rinnovo: int = 30) -> Tuple[Prestito, str]:
        """
        Rinnova un prestito estendendo la data di restituzione prevista.
        
        Args:
            id_prestito (str): L'ID del prestito da rinnovare.
            giorni_rinnovo (int): Il numero di giorni di estensione.
            
        Returns:
            Tuple[Prestito, str]: Il prestito aggiornato e un messaggio di esito.
            
        Raises:
            KeyError: Se il prestito non esiste.
            ValueError: Se il prestito è già stato restituito o non può essere rinnovato.
        """
        # Verifica che il prestito esista
        try:
            prestito = self.repository.get_by_id(id_prestito)
        except KeyError:
            raise KeyError(f"Prestito con ID {id_prestito} non trovato")
        
        # Verifica che il prestito non sia già stato restituito
        if prestito.is_restituito:
            raise ValueError(f"Il prestito {id_prestito} è già stato restituito")
        
        # Rinnova il prestito
        if not prestito.rinnova(giorni_rinnovo):
            raise ValueError(f"Il prestito {id_prestito} non può essere rinnovato")
        
        # Salva il prestito aggiornato
        self.repository.update(prestito)
        
        logger.info(f"Rinnovato prestito: {prestito.id} - Nuova data di restituzione: {prestito.data_restituzione_prevista.strftime('%d/%m/%Y')}")
        return prestito, f"Prestito rinnovato con successo. Nuova data di restituzione: {prestito.data_restituzione_prevista.strftime('%d/%m/%Y')}"
    
    def get_prestiti_in_corso(self) -> List[Prestito]:
        """
        Restituisce i prestiti in corso (non restituiti).
        
        Returns:
            List[Prestito]: Una lista di prestiti in corso.
        """
        return [prestito for prestito in self.repository.get_all() if not prestito.is_restituito]
    
    def get_prestiti_in_ritardo(self) -> List[Prestito]:
        """
        Restituisce i prestiti in ritardo.
        
        Returns:
            List[Prestito]: Una lista di prestiti in ritardo.
        """
        return [prestito for prestito in self.repository.get_all() if not prestito.is_restituito and prestito.is_in_ritardo]
    
    def get_prestiti_by_utente(self, id_utente: str) -> List[Prestito]:
        """
        Restituisce i prestiti di un determinato utente.
        
        Args:
            id_utente (str): L'ID dell'utente.
            
        Returns:
            List[Prestito]: Una lista di prestiti dell'utente.
        """
        return [prestito for prestito in self.repository.get_all() if prestito.id_utente == id_utente]
    
    def get_prestiti_by_libro(self, id_libro: str) -> List[Prestito]:
        """
        Restituisce i prestiti di un determinato libro.
        
        Args:
            id_libro (str): L'ID del libro.
            
        Returns:
            List[Prestito]: Una lista di prestiti del libro.
        """
        return [prestito for prestito in self.repository.get_all() if prestito.id_libro == id_libro]
    
    def get_statistiche_prestiti(self) -> Dict[str, Any]:
        """
        Restituisce statistiche sui prestiti.
        
        Returns:
            Dict[str, Any]: Un dizionario con le statistiche.
        """
        prestiti = self.repository.get_all()
        
        # Calcola le statistiche
        totale_prestiti = len(prestiti)
        prestiti_in_corso = sum(1 for prestito in prestiti if not prestito.is_restituito)
        prestiti_restituiti = totale_prestiti - prestiti_in_corso
        prestiti_in_ritardo = sum(1 for prestito in prestiti if not prestito.is_restituito and prestito.is_in_ritardo)
        
        # Calcola la durata media dei prestiti restituiti
        durate = []
        for prestito in prestiti:
            if prestito.is_restituito:
                durata = (prestito.data_restituzione_effettiva - prestito.data_prestito).days
                durate.append(durata)
        
        durata_media = sum(durate) / len(durate) if durate else 0
        
        return {
            "totale_prestiti": totale_prestiti,
            "prestiti_in_corso": prestiti_in_corso,
            "prestiti_restituiti": prestiti_restituiti,
            "prestiti_in_ritardo": prestiti_in_ritardo,
            "durata_media_prestiti": durata_media
        }