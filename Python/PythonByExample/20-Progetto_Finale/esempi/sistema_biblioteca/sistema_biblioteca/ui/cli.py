#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Interfaccia a riga di comando per il Sistema di Gestione Biblioteca.

Questo modulo contiene la classe BibliotecaCLI che implementa un'interfaccia
a riga di comando per interagire con il sistema di gestione della biblioteca.
"""

import os
import sys
import logging
from typing import Dict, List, Any, Callable

from sistema_biblioteca.models.libro import Libro
from sistema_biblioteca.models.utente import Utente
from sistema_biblioteca.models.prestito import Prestito
from sistema_biblioteca.services.catalogo_service import CatalogoService
from sistema_biblioteca.services.utenti_service import UtentiService
from sistema_biblioteca.services.prestiti_service import PrestitiService

logger = logging.getLogger(__name__)


class BibliotecaCLI:
    """
    Interfaccia a riga di comando per il Sistema di Gestione Biblioteca.
    
    Questa classe fornisce un'interfaccia utente testuale per interagire
    con i servizi del sistema di gestione della biblioteca.
    
    Attributes:
        catalogo_service (CatalogoService): Il servizio per la gestione del catalogo libri.
        utenti_service (UtentiService): Il servizio per la gestione degli utenti.
        prestiti_service (PrestitiService): Il servizio per la gestione dei prestiti.
    """
    
    def __init__(self, catalogo_service: CatalogoService, 
                 utenti_service: UtentiService, 
                 prestiti_service: PrestitiService):
        """
        Inizializza una nuova interfaccia CLI per il sistema biblioteca.
        
        Args:
            catalogo_service: Il servizio per la gestione del catalogo libri.
            utenti_service: Il servizio per la gestione degli utenti.
            prestiti_service: Il servizio per la gestione dei prestiti.
        """
        self.catalogo_service = catalogo_service
        self.utenti_service = utenti_service
        self.prestiti_service = prestiti_service
        
        # Definizione dei menu
        self.menu_principale = {
            '1': ('Gestione Libri', self.menu_libri),
            '2': ('Gestione Utenti', self.menu_utenti),
            '3': ('Gestione Prestiti', self.menu_prestiti),
            '0': ('Esci', self.esci)
        }
        
        self.menu_libri_opzioni = {
            '1': ('Visualizza tutti i libri', self.visualizza_libri),
            '2': ('Cerca libro', self.cerca_libro),
            '3': ('Aggiungi libro', self.aggiungi_libro),
            '4': ('Modifica libro', self.modifica_libro),
            '5': ('Elimina libro', self.elimina_libro),
            '0': ('Torna al menu principale', lambda: None)
        }
        
        self.menu_utenti_opzioni = {
            '1': ('Visualizza tutti gli utenti', self.visualizza_utenti),
            '2': ('Cerca utente', self.cerca_utente),
            '3': ('Aggiungi utente', self.aggiungi_utente),
            '4': ('Modifica utente', self.modifica_utente),
            '5': ('Elimina utente', self.elimina_utente),
            '0': ('Torna al menu principale', lambda: None)
        }
        
        self.menu_prestiti_opzioni = {
            '1': ('Visualizza tutti i prestiti', self.visualizza_prestiti),
            '2': ('Cerca prestito', self.cerca_prestito),
            '3': ('Registra prestito', self.registra_prestito),
            '4': ('Registra restituzione', self.registra_restituzione),
            '5': ('Visualizza prestiti scaduti', self.visualizza_prestiti_scaduti),
            '0': ('Torna al menu principale', lambda: None)
        }
    
    def pulisci_schermo(self):
        """
        Pulisce lo schermo del terminale.
        """
        os.system('cls' if os.name == 'nt' else 'clear')
    
    def mostra_menu(self, titolo: str, opzioni: Dict[str, tuple]):
        """
        Mostra un menu con le opzioni specificate.
        
        Args:
            titolo: Il titolo del menu.
            opzioni: Un dizionario con le opzioni del menu.
        
        Returns:
            str: L'opzione selezionata dall'utente.
        """
        while True:
            self.pulisci_schermo()
            print(f"\n=== {titolo} ===\n")
            
            for chiave, (descrizione, _) in opzioni.items():
                print(f"{chiave}. {descrizione}")
            
            scelta = input("\nSeleziona un'opzione: ")
            
            if scelta in opzioni:
                return scelta
            
            print("\nOpzione non valida. Riprova.")
            input("Premi INVIO per continuare...")
    
    def esegui(self):
        """
        Avvia l'interfaccia a riga di comando.
        """
        while True:
            scelta = self.mostra_menu("Sistema di Gestione Biblioteca", self.menu_principale)
            _, funzione = self.menu_principale[scelta]
            risultato = funzione()
            
            if risultato is False:  # Se esci() restituisce False
                break
    
    def menu_libri(self):
        """
        Mostra il menu per la gestione dei libri.
        """
        while True:
            scelta = self.mostra_menu("Gestione Libri", self.menu_libri_opzioni)
            
            if scelta == '0':
                break
            
            _, funzione = self.menu_libri_opzioni[scelta]
            funzione()
            input("\nPremi INVIO per continuare...")
    
    def menu_utenti(self):
        """
        Mostra il menu per la gestione degli utenti.
        """
        while True:
            scelta = self.mostra_menu("Gestione Utenti", self.menu_utenti_opzioni)
            
            if scelta == '0':
                break
            
            _, funzione = self.menu_utenti_opzioni[scelta]
            funzione()
            input("\nPremi INVIO per continuare...")
    
    def menu_prestiti(self):
        """
        Mostra il menu per la gestione dei prestiti.
        """
        while True:
            scelta = self.mostra_menu("Gestione Prestiti", self.menu_prestiti_opzioni)
            
            if scelta == '0':
                break
            
            _, funzione = self.menu_prestiti_opzioni[scelta]
            funzione()
            input("\nPremi INVIO per continuare...")
    
    # Funzioni per la gestione dei libri
    def visualizza_libri(self):
        """
        Visualizza tutti i libri nel catalogo.
        """
        libri = self.catalogo_service.get_all_libri()
        
        if not libri:
            print("\nNessun libro presente nel catalogo.")
            return
        
        print("\nElenco dei libri nel catalogo:")
        print("-" * 80)
        print(f"{'ID':<10} {'Titolo':<30} {'Autore':<20} {'Disponibile':<10}")
        print("-" * 80)
        
        for libro in libri:
            disponibilita = "Sì" if libro.disponibile else "No"
            print(f"{libro.id:<10} {libro.titolo[:28]:<30} {libro.autore[:18]:<20} {disponibilita:<10}")
    
    def cerca_libro(self):
        """
        Cerca un libro nel catalogo.
        """
        termine = input("\nInserisci il termine di ricerca (titolo, autore o ISBN): ")
        libri = self.catalogo_service.cerca_libri(termine)
        
        if not libri:
            print(f"\nNessun libro trovato con il termine '{termine}'.")
            return
        
        print(f"\nRisultati della ricerca per '{termine}':")
        print("-" * 80)
        print(f"{'ID':<10} {'Titolo':<30} {'Autore':<20} {'Disponibile':<10}")
        print("-" * 80)
        
        for libro in libri:
            disponibilita = "Sì" if libro.disponibile else "No"
            print(f"{libro.id:<10} {libro.titolo[:28]:<30} {libro.autore[:18]:<20} {disponibilita:<10}")
    
    def aggiungi_libro(self):
        """
        Aggiunge un nuovo libro al catalogo.
        """
        print("\nInserisci i dati del nuovo libro:")
        
        titolo = input("Titolo: ")
        autore = input("Autore: ")
        isbn = input("ISBN: ")
        anno_pubblicazione = int(input("Anno di pubblicazione: "))
        editore = input("Editore: ")
        genere = input("Genere: ")
        
        libro = Libro(
            titolo=titolo,
            autore=autore,
            isbn=isbn,
            anno_pubblicazione=anno_pubblicazione,
            editore=editore,
            genere=genere
        )
        
        self.catalogo_service.aggiungi_libro(libro)
        print(f"\nLibro '{titolo}' aggiunto con successo al catalogo.")
    
    def modifica_libro(self):
        """
        Modifica un libro esistente nel catalogo.
        """
        id_libro = input("\nInserisci l'ID del libro da modificare: ")
        libro = self.catalogo_service.get_libro_by_id(id_libro)
        
        if not libro:
            print(f"\nNessun libro trovato con ID '{id_libro}'.")
            return
        
        print(f"\nModifica del libro '{libro.titolo}':")
        print("(Lascia vuoto per mantenere il valore attuale)")
        
        titolo = input(f"Titolo [{libro.titolo}]: ") or libro.titolo
        autore = input(f"Autore [{libro.autore}]: ") or libro.autore
        isbn = input(f"ISBN [{libro.isbn}]: ") or libro.isbn
        anno_str = input(f"Anno di pubblicazione [{libro.anno_pubblicazione}]: ")
        anno_pubblicazione = int(anno_str) if anno_str else libro.anno_pubblicazione
        editore = input(f"Editore [{libro.editore}]: ") or libro.editore
        genere = input(f"Genere [{libro.genere}]: ") or libro.genere
        
        libro.titolo = titolo
        libro.autore = autore
        libro.isbn = isbn
        libro.anno_pubblicazione = anno_pubblicazione
        libro.editore = editore
        libro.genere = genere
        
        self.catalogo_service.aggiorna_libro(libro)
        print(f"\nLibro '{titolo}' aggiornato con successo.")
    
    def elimina_libro(self):
        """
        Elimina un libro dal catalogo.
        """
        id_libro = input("\nInserisci l'ID del libro da eliminare: ")
        libro = self.catalogo_service.get_libro_by_id(id_libro)
        
        if not libro:
            print(f"\nNessun libro trovato con ID '{id_libro}'.")
            return
        
        conferma = input(f"\nSei sicuro di voler eliminare il libro '{libro.titolo}'? (s/n): ")
        
        if conferma.lower() == 's':
            self.catalogo_service.elimina_libro(id_libro)
            print(f"\nLibro '{libro.titolo}' eliminato con successo.")
        else:
            print("\nOperazione annullata.")
    
    # Funzioni per la gestione degli utenti
    def visualizza_utenti(self):
        """
        Visualizza tutti gli utenti registrati.
        """
        utenti = self.utenti_service.get_all_utenti()
        
        if not utenti:
            print("\nNessun utente registrato.")
            return
        
        print("\nElenco degli utenti registrati:")
        print("-" * 80)
        print(f"{'ID':<10} {'Nome':<20} {'Cognome':<20} {'Email':<30}")
        print("-" * 80)
        
        for utente in utenti:
            print(f"{utente.id:<10} {utente.nome:<20} {utente.cognome:<20} {utente.email:<30}")
    
    def cerca_utente(self):
        """
        Cerca un utente registrato.
        """
        termine = input("\nInserisci il termine di ricerca (nome, cognome o email): ")
        utenti = self.utenti_service.cerca_utenti(termine)
        
        if not utenti:
            print(f"\nNessun utente trovato con il termine '{termine}'.")
            return
        
        print(f"\nRisultati della ricerca per '{termine}':")
        print("-" * 80)
        print(f"{'ID':<10} {'Nome':<20} {'Cognome':<20} {'Email':<30}")
        print("-" * 80)
        
        for utente in utenti:
            print(f"{utente.id:<10} {utente.nome:<20} {utente.cognome:<20} {utente.email:<30}")
    
    def aggiungi_utente(self):
        """
        Aggiunge un nuovo utente.
        """
        print("\nInserisci i dati del nuovo utente:")
        
        nome = input("Nome: ")
        cognome = input("Cognome: ")
        email = input("Email: ")
        telefono = input("Telefono: ")
        indirizzo = input("Indirizzo: ")
        
        utente = Utente(
            nome=nome,
            cognome=cognome,
            email=email,
            telefono=telefono,
            indirizzo=indirizzo
        )
        
        self.utenti_service.aggiungi_utente(utente)
        print(f"\nUtente '{nome} {cognome}' aggiunto con successo.")
    
    def modifica_utente(self):
        """
        Modifica un utente esistente.
        """
        id_utente = input("\nInserisci l'ID dell'utente da modificare: ")
        utente = self.utenti_service.get_utente_by_id(id_utente)
        
        if not utente:
            print(f"\nNessun utente trovato con ID '{id_utente}'.")
            return
        
        print(f"\nModifica dell'utente '{utente.nome} {utente.cognome}':")
        print("(Lascia vuoto per mantenere il valore attuale)")
        
        nome = input(f"Nome [{utente.nome}]: ") or utente.nome
        cognome = input(f"Cognome [{utente.cognome}]: ") or utente.cognome
        email = input(f"Email [{utente.email}]: ") or utente.email
        telefono = input(f"Telefono [{utente.telefono}]: ") or utente.telefono
        indirizzo = input(f"Indirizzo [{utente.indirizzo}]: ") or utente.indirizzo
        
        utente.nome = nome
        utente.cognome = cognome
        utente.email = email
        utente.telefono = telefono
        utente.indirizzo = indirizzo
        
        self.utenti_service.aggiorna_utente(utente)
        print(f"\nUtente '{nome} {cognome}' aggiornato con successo.")
    
    def elimina_utente(self):
        """
        Elimina un utente registrato.
        """
        id_utente = input("\nInserisci l'ID dell'utente da eliminare: ")
        utente = self.utenti_service.get_utente_by_id(id_utente)
        
        if not utente:
            print(f"\nNessun utente trovato con ID '{id_utente}'.")
            return
        
        # Verifica se l'utente ha prestiti attivi
        prestiti_attivi = self.prestiti_service.get_prestiti_by_utente(id_utente)
        prestiti_attivi = [p for p in prestiti_attivi if not p.restituito]
        
        if prestiti_attivi:
            print(f"\nImpossibile eliminare l'utente '{utente.nome} {utente.cognome}' perché ha prestiti attivi.")
            return
        
        conferma = input(f"\nSei sicuro di voler eliminare l'utente '{utente.nome} {utente.cognome}'? (s/n): ")
        
        if conferma.lower() == 's':
            self.utenti_service.elimina_utente(id_utente)
            print(f"\nUtente '{utente.nome} {utente.cognome}' eliminato con successo.")
        else:
            print("\nOperazione annullata.")
    
    # Funzioni per la gestione dei prestiti
    def visualizza_prestiti(self):
        """
        Visualizza tutti i prestiti.
        """
        prestiti = self.prestiti_service.get_all_prestiti()
        
        if not prestiti:
            print("\nNessun prestito registrato.")
            return
        
        print("\nElenco dei prestiti:")
        print("-" * 100)
        print(f"{'ID':<10} {'Libro':<30} {'Utente':<30} {'Data Prestito':<15} {'Restituito':<10}")
        print("-" * 100)
        
        for prestito in prestiti:
            libro = self.catalogo_service.get_libro_by_id(prestito.id_libro)
            utente = self.utenti_service.get_utente_by_id(prestito.id_utente)
            
            titolo_libro = libro.titolo if libro else "<Libro non trovato>"
            nome_utente = f"{utente.nome} {utente.cognome}" if utente else "<Utente non trovato>"
            data_prestito = prestito.data_prestito.strftime("%d/%m/%Y")
            restituito = "Sì" if prestito.restituito else "No"
            
            print(f"{prestito.id:<10} {titolo_libro[:28]:<30} {nome_utente[:28]:<30} {data_prestito:<15} {restituito:<10}")
    
    def cerca_prestito(self):
        """
        Cerca un prestito.
        """
        print("\nCerca prestito per:")
        print("1. ID Prestito")
        print("2. ID Utente")
        print("3. ID Libro")
        
        scelta = input("\nSeleziona un'opzione: ")
        
        if scelta == '1':
            id_prestito = input("\nInserisci l'ID del prestito: ")
            prestito = self.prestiti_service.get_prestito_by_id(id_prestito)
            
            if not prestito:
                print(f"\nNessun prestito trovato con ID '{id_prestito}'.")
                return
            
            prestiti = [prestito]
        
        elif scelta == '2':
            id_utente = input("\nInserisci l'ID dell'utente: ")
            prestiti = self.prestiti_service.get_prestiti_by_utente(id_utente)
            
            if not prestiti:
                print(f"\nNessun prestito trovato per l'utente con ID '{id_utente}'.")
                return
        
        elif scelta == '3':
            id_libro = input("\nInserisci l'ID del libro: ")
            prestiti = self.prestiti_service.get_prestiti_by_libro(id_libro)
            
            if not prestiti:
                print(f"\nNessun prestito trovato per il libro con ID '{id_libro}'.")
                return
        
        else:
            print("\nOpzione non valida.")
            return
        
        print("\nRisultati della ricerca:")
        print("-" * 100)
        print(f"{'ID':<10} {'Libro':<30} {'Utente':<30} {'Data Prestito':<15} {'Restituito':<10}")
        print("-" * 100)
        
        for prestito in prestiti:
            libro = self.catalogo_service.get_libro_by_id(prestito.id_libro)
            utente = self.utenti_service.get_utente_by_id(prestito.id_utente)
            
            titolo_libro = libro.titolo if libro else "<Libro non trovato>"
            nome_utente = f"{utente.nome} {utente.cognome}" if utente else "<Utente non trovato>"
            data_prestito = prestito.data_prestito.strftime("%d/%m/%Y")
            restituito = "Sì" if prestito.restituito else "No"
            
            print(f"{prestito.id:<10} {titolo_libro[:28]:<30} {nome_utente[:28]:<30} {data_prestito:<15} {restituito:<10}")
    
    def registra_prestito(self):
        """
        Registra un nuovo prestito.
        """
        # Selezione del libro
        id_libro = input("\nInserisci l'ID del libro: ")
        libro = self.catalogo_service.get_libro_by_id(id_libro)
        
        if not libro:
            print(f"\nNessun libro trovato con ID '{id_libro}'.")
            return
        
        if not libro.disponibile:
            print(f"\nIl libro '{libro.titolo}' non è disponibile per il prestito.")
            return
        
        # Selezione dell'utente
        id_utente = input("\nInserisci l'ID dell'utente: ")
        utente = self.utenti_service.get_utente_by_id(id_utente)
        
        if not utente:
            print(f"\nNessun utente trovato con ID '{id_utente}'.")
            return
        
        # Creazione del prestito
        prestito = Prestito(
            id_libro=id_libro,
            id_utente=id_utente
        )
        
        self.prestiti_service.registra_prestito(prestito)
        print(f"\nPrestito del libro '{libro.titolo}' all'utente '{utente.nome} {utente.cognome}' registrato con successo.")
    
    def registra_restituzione(self):
        """
        Registra la restituzione di un libro.
        """
        id_prestito = input("\nInserisci l'ID del prestito da restituire: ")
        prestito = self.prestiti_service.get_prestito_by_id(id_prestito)
        
        if not prestito:
            print(f"\nNessun prestito trovato con ID '{id_prestito}'.")
            return
        
        if prestito.restituito:
            print("\nQuesto prestito è già stato restituito.")
            return
        
        libro = self.catalogo_service.get_libro_by_id(prestito.id_libro)
        utente = self.utenti_service.get_utente_by_id(prestito.id_utente)
        
        if not libro or not utente:
            print("\nErrore: libro o utente non trovato.")
            return
        
        self.prestiti_service.registra_restituzione(id_prestito)
        print(f"\nRestituzione del libro '{libro.titolo}' da parte dell'utente '{utente.nome} {utente.cognome}' registrata con successo.")
    
    def visualizza_prestiti_scaduti(self):
        """
        Visualizza i prestiti scaduti.
        """
        prestiti_scaduti = self.prestiti_service.get_prestiti_scaduti()
        
        if not prestiti_scaduti:
            print("\nNessun prestito scaduto.")
            return
        
        print("\nElenco dei prestiti scaduti:")
        print("-" * 120)
        print(f"{'ID':<10} {'Libro':<30} {'Utente':<30} {'Data Prestito':<15} {'Scadenza':<15} {'Giorni Ritardo':<15}")
        print("-" * 120)
        
        for prestito in prestiti_scaduti:
            libro = self.catalogo_service.get_libro_by_id(prestito.id_libro)
            utente = self.utenti_service.get_utente_by_id(prestito.id_utente)
            
            titolo_libro = libro.titolo if libro else "<Libro non trovato>"
            nome_utente = f"{utente.nome} {utente.cognome}" if utente else "<Utente non trovato>"
            data_prestito = prestito.data_prestito.strftime("%d/%m/%Y")
            data_scadenza = prestito.data_scadenza.strftime("%d/%m/%Y")
            giorni_ritardo = prestito.giorni_ritardo
            
            print(f"{prestito.id:<10} {titolo_libro[:28]:<30} {nome_utente[:28]:<30} {data_prestito:<15} {data_scadenza:<15} {giorni_ritardo:<15}")
    
    def esci(self):
        """
        Esce dall'applicazione.
        
        Returns:
            bool: False per indicare che l'applicazione deve terminare.
        """
        print("\nGrazie per aver utilizzato il Sistema di Gestione Biblioteca!")
        return False