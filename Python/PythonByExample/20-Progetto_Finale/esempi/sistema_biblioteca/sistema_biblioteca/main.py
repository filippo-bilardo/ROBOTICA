#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sistema di Gestione Biblioteca - Punto di ingresso principale

Questo modulo contiene il punto di ingresso principale per l'applicazione
di gestione della biblioteca. Gestisce l'avvio dell'applicazione, il parsing
degli argomenti da riga di comando e l'inizializzazione dei componenti.
"""

import argparse
import logging
import sys
from pathlib import Path

from sistema_biblioteca.ui.cli import BibliotecaCLI
from sistema_biblioteca.repositories.repository_factory import RepositoryFactory
from sistema_biblioteca.services.catalogo_service import CatalogoService
from sistema_biblioteca.services.utenti_service import UtentiService
from sistema_biblioteca.services.prestiti_service import PrestitiService

# Configurazione del logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('biblioteca.log')
    ]
)

logger = logging.getLogger(__name__)


def parse_arguments():
    """
    Analizza gli argomenti da riga di comando.
    
    Returns:
        argparse.Namespace: Gli argomenti analizzati.
    """
    parser = argparse.ArgumentParser(
        description='Sistema di Gestione Biblioteca'
    )
    parser.add_argument(
        '--data-dir',
        type=str,
        default='./data',
        help='Directory per i file di dati (default: ./data)'
    )
    parser.add_argument(
        '--debug',
        action='store_true',
        help='Abilita la modalità debug'
    )
    
    return parser.parse_args()


def main():
    """
    Funzione principale che avvia l'applicazione.
    """
    # Parsing degli argomenti
    args = parse_arguments()
    
    # Configurazione del livello di logging
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.debug("Modalità debug attivata")
    
    # Creazione della directory dei dati se non esiste
    data_dir = Path(args.data_dir)
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Inizializzazione dei repository
    repository_factory = RepositoryFactory(data_dir)
    libri_repo = repository_factory.create_libri_repository()
    utenti_repo = repository_factory.create_utenti_repository()
    prestiti_repo = repository_factory.create_prestiti_repository()
    
    # Inizializzazione dei servizi
    catalogo_service = CatalogoService(libri_repo)
    utenti_service = UtentiService(utenti_repo)
    prestiti_service = PrestitiService(prestiti_repo, libri_repo, utenti_repo)
    
    # Inizializzazione dell'interfaccia utente
    cli = BibliotecaCLI(catalogo_service, utenti_service, prestiti_service)
    
    try:
        # Avvio dell'interfaccia utente
        logger.info("Avvio del Sistema di Gestione Biblioteca")
        cli.start()
    except KeyboardInterrupt:
        logger.info("Chiusura dell'applicazione richiesta dall'utente")
    except Exception as e:
        logger.error(f"Errore imprevisto: {e}", exc_info=True)
    finally:
        logger.info("Chiusura del Sistema di Gestione Biblioteca")


if __name__ == "__main__":
    main()