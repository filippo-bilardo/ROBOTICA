#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servizio per la gestione del catalogo libri.

Questo modulo contiene la classe CatalogoService che implementa la logica di business
per la gestione dei libri nel sistema di gestione della biblioteca.
"""

import logging
from typing import List, Optional, Dict, Any

from sistema_biblioteca.models.libro import Libro
from sistema_biblioteca.repositories.repository_factory import JsonRepository

logger = logging.getLogger(__name__)


class CatalogoService:
    """
    Servizio per la gestione del catalogo libri.
    
    Attributes:
        repository (JsonRepository[Libro]): Il repository per i libri.
    """
    
    def __init__(self, repository: JsonRepository[Libro]):
        """
        Inizializza un nuovo servizio per il catalogo libri.
        
        Args:
            repository (JsonRepository[Libro]): Il repository per i libri.
        """
        self.repository = repository
    
    def get_all_libri(self) -> List[Libro]:
        """
        Restituisce tutti i libri nel catalogo.
        
        Returns:
            List[Libro]: Una lista di tutti i libri.
        """
        return self.repository.get_all()
    
    def get_libro_by_id(self, id: str) -> Libro:
        """
        Restituisce un libro per ID.
        
        Args:
            id (str): L'ID del libro da cercare.
            
        Returns:
            Libro: Il libro trovato.
            
        Raises:
            KeyError: Se il libro non esiste.
        """
        return self.repository.get_by_id(id)
    
    def add_libro(self, libro: Libro) -> Libro:
        """
        Aggiunge un libro al catalogo.
        
        Args:
            libro (Libro): Il libro da aggiungere.
            
        Returns:
            Libro: Il libro aggiunto.
        """
        logger.info(f"Aggiunto nuovo libro: {libro.titolo} di {libro.autore}")
        return self.repository.add(libro)
    
    def update_libro(self, libro: Libro) -> Libro:
        """
        Aggiorna un libro nel catalogo.
        
        Args:
            libro (Libro): Il libro da aggiornare.
            
        Returns:
            Libro: Il libro aggiornato.
            
        Raises:
            KeyError: Se il libro non esiste.
        """
        logger.info(f"Aggiornato libro: {libro.titolo} di {libro.autore}")
        return self.repository.update(libro)
    
    def delete_libro(self, id: str) -> None:
        """
        Elimina un libro dal catalogo.
        
        Args:
            id (str): L'ID del libro da eliminare.
            
        Raises:
            KeyError: Se il libro non esiste.
        """
        libro = self.repository.get_by_id(id)
        logger.info(f"Eliminato libro: {libro.titolo} di {libro.autore}")
        self.repository.delete(id)
    
    def search_libri(self, query: str) -> List[Libro]:
        """
        Cerca libri nel catalogo.
        
        Args:
            query (str): La query di ricerca.
            
        Returns:
            List[Libro]: Una lista di libri che corrispondono alla query.
        """
        query = query.lower()
        results = []
        
        for libro in self.repository.get_all():
            # Cerca nel titolo, autore, ISBN, editore, genere e descrizione
            if (query in libro.titolo.lower() or
                query in libro.autore.lower() or
                query in libro.isbn.lower() or
                query in libro.editore.lower() or
                query in libro.genere.lower() or
                query in libro.descrizione.lower()):
                results.append(libro)
        
        return results
    
    def get_libri_by_genere(self, genere: str) -> List[Libro]:
        """
        Restituisce i libri di un determinato genere.
        
        Args:
            genere (str): Il genere dei libri da cercare.
            
        Returns:
            List[Libro]: Una lista di libri del genere specificato.
        """
        return [libro for libro in self.repository.get_all() if libro.genere.lower() == genere.lower()]
    
    def get_libri_by_autore(self, autore: str) -> List[Libro]:
        """
        Restituisce i libri di un determinato autore.
        
        Args:
            autore (str): L'autore dei libri da cercare.
            
        Returns:
            List[Libro]: Una lista di libri dell'autore specificato.
        """
        return [libro for libro in self.repository.get_all() if libro.autore.lower() == autore.lower()]
    
    def get_libri_disponibili(self) -> List[Libro]:
        """
        Restituisce i libri disponibili per il prestito.
        
        Returns:
            List[Libro]: Una lista di libri disponibili.
        """
        return [libro for libro in self.repository.get_all() if libro.disponibile]
    
    def get_statistiche_catalogo(self) -> Dict[str, Any]:
        """
        Restituisce statistiche sul catalogo libri.
        
        Returns:
            Dict[str, Any]: Un dizionario con le statistiche.
        """
        libri = self.repository.get_all()
        
        # Calcola le statistiche
        totale_libri = len(libri)
        libri_disponibili = sum(1 for libro in libri if libro.disponibile)
        libri_non_disponibili = totale_libri - libri_disponibili
        
        # Conta i libri per genere
        generi = {}
        for libro in libri:
            genere = libro.genere.lower()
            if genere in generi:
                generi[genere] += 1
            else:
                generi[genere] = 1
        
        # Conta i libri per autore
        autori = {}
        for libro in libri:
            autore = libro.autore.lower()
            if autore in autori:
                autori[autore] += 1
            else:
                autori[autore] = 1
        
        # Calcola l'anno di pubblicazione medio
        if totale_libri > 0:
            anno_medio = sum(libro.anno_pubblicazione for libro in libri) / totale_libri
        else:
            anno_medio = 0
        
        return {
            "totale_libri": totale_libri,
            "libri_disponibili": libri_disponibili,
            "libri_non_disponibili": libri_non_disponibili,
            "generi": generi,
            "autori": autori,
            "anno_pubblicazione_medio": anno_medio
        }