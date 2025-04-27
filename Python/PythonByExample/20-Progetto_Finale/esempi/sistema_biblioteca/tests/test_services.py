import unittest
import os
import json
from sistema_biblioteca.models.libro import Libro
from sistema_biblioteca.models.utente import Utente
from sistema_biblioteca.models.prestito import Prestito
from sistema_biblioteca.services.catalogo_service import CatalogoService
from sistema_biblioteca.services.utenti_service import UtentiService
from sistema_biblioteca.services.prestiti_service import PrestitiService
from sistema_biblioteca.repositories.json_repository import JsonRepository
from sistema_biblioteca.repositories.repository_factory import RepositoryFactory
from datetime import datetime, timedelta

# Percorsi per i file JSON di test
TEST_LIBRI_FILE = 'test_libri.json'
TEST_UTENTI_FILE = 'test_utenti.json'
TEST_PRESTITI_FILE = 'test_prestiti.json'

class TestServices(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Configura l'ambiente per tutti i test dei servizi."""
        # Usa file JSON separati per i test
        cls.libri_repo = JsonRepository(TEST_LIBRI_FILE)
        cls.utenti_repo = JsonRepository(TEST_UTENTI_FILE)
        cls.prestiti_repo = JsonRepository(TEST_PRESTITI_FILE)

        # Sovrascrivi la factory per usare i repository di test
        RepositoryFactory.repositories = {
            'libri': cls.libri_repo,
            'utenti': cls.utenti_repo,
            'prestiti': cls.prestiti_repo
        }

        cls.catalogo_service = CatalogoService()
        cls.utenti_service = UtentiService()
        cls.prestiti_service = PrestitiService()

    @classmethod
    def tearDownClass(cls):
        """Pulisce l'ambiente dopo tutti i test."""
        # Rimuovi i file JSON di test
        for file_path in [TEST_LIBRI_FILE, TEST_UTENTI_FILE, TEST_PRESTITI_FILE]:
            if os.path.exists(file_path):
                os.remove(file_path)

    def setUp(self):
        """Pulisce i dati prima di ogni test."""
        self.libri_repo.save_all([])
        self.utenti_repo.save_all([])
        self.prestiti_repo.save_all([])

    # --- Test CatalogoService ---
    def test_aggiungi_libro(self):
        libro = self.catalogo_service.aggiungi_libro('Libro Test', 'Autore Test', 2023)
        self.assertIsNotNone(libro)
        self.assertEqual(libro.titolo, 'Libro Test')
        libri_salvati = self.libri_repo.load_all()
        self.assertEqual(len(libri_salvati), 1)
        self.assertEqual(libri_salvati[0]['titolo'], 'Libro Test')

    def test_cerca_libri(self):
        self.catalogo_service.aggiungi_libro('Libro A', 'Autore X', 2020)
        self.catalogo_service.aggiungi_libro('Libro B', 'Autore Y', 2021)
        risultati = self.catalogo_service.cerca_libri(query='Libro A')
        self.assertEqual(len(risultati), 1)
        self.assertEqual(risultati[0].titolo, 'Libro A')

    def test_rimuovi_libro(self):
        libro = self.catalogo_service.aggiungi_libro('Da Rimuovere', 'Autore Z', 2022)
        rimosso = self.catalogo_service.rimuovi_libro(libro.id)
        self.assertTrue(rimosso)
        libri_rimasti = self.libri_repo.load_all()
        self.assertEqual(len(libri_rimasti), 0)

    # --- Test UtentiService ---
    def test_registra_utente(self):
        utente = self.utenti_service.registra_utente('Utente Test', 'test@example.com')
        self.assertIsNotNone(utente)
        self.assertEqual(utente.nome, 'Utente Test')
        utenti_salvati = self.utenti_repo.load_all()
        self.assertEqual(len(utenti_salvati), 1)
        self.assertEqual(utenti_salvati[0]['nome'], 'Utente Test')

    def test_trova_utente_per_id(self):
        utente_reg = self.utenti_service.registra_utente('Utente Cerca', 'cerca@example.com')
        utente_trovato = self.utenti_service.trova_utente_per_id(utente_reg.id)
        self.assertIsNotNone(utente_trovato)
        self.assertEqual(utente_trovato.id, utente_reg.id)

    # --- Test PrestitiService ---
    def test_crea_prestito(self):
        libro = self.catalogo_service.aggiungi_libro('Libro Prestito', 'Autore P', 2023)
        utente = self.utenti_service.registra_utente('Utente Prestito', 'prestito@example.com')
        prestito = self.prestiti_service.crea_prestito(libro.id, utente.id)
        self.assertIsNotNone(prestito)
        self.assertEqual(prestito.libro_id, libro.id)
        self.assertEqual(prestito.utente_id, utente.id)
        self.assertFalse(prestito.restituito)
        # Verifica che il libro sia ora non disponibile
        libro_aggiornato = self.catalogo_service.trova_libro_per_id(libro.id)
        self.assertFalse(libro_aggiornato.disponibile)

    def test_restituisci_prestito(self):
        libro = self.catalogo_service.aggiungi_libro('Libro Restituzione', 'Autore R', 2023)
        utente = self.utenti_service.registra_utente('Utente Restituzione', 'restituzione@example.com')
        prestito = self.prestiti_service.crea_prestito(libro.id, utente.id)
        restituito = self.prestiti_service.restituisci_prestito(prestito.id)
        self.assertTrue(restituito)
        prestito_aggiornato = self.prestiti_service.trova_prestito_per_id(prestito.id)
        self.assertTrue(prestito_aggiornato.restituito)
        # Verifica che il libro sia di nuovo disponibile
        libro_aggiornato = self.catalogo_service.trova_libro_per_id(libro.id)
        self.assertTrue(libro_aggiornato.disponibile)

    def test_elenca_prestiti_scaduti(self):
        libro_scaduto = self.catalogo_service.aggiungi_libro('Libro Scaduto', 'Autore S', 2023)
        utente_scaduto = self.utenti_service.registra_utente('Utente Scaduto', 'scaduto@example.com')
        prestito = self.prestiti_service.crea_prestito(libro_scaduto.id, utente_scaduto.id)
        # Modifica manualmente la data di scadenza per renderla passata
        prestito.data_scadenza = datetime.now() - timedelta(days=1)
        self.prestiti_repo.update(prestito.id, prestito.to_dict())

        scaduti = self.prestiti_service.elenca_prestiti_scaduti()
        self.assertEqual(len(scaduti), 1)
        self.assertEqual(scaduti[0].id, prestito.id)

if __name__ == '__main__':
    unittest.main()