#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test per l'interfaccia CLI del Sistema di Gestione Biblioteca.

Questo modulo contiene i test unitari per verificare il corretto funzionamento
dell'interfaccia a riga di comando del sistema di gestione della biblioteca.
"""

import unittest
from unittest.mock import MagicMock, patch
import io
import sys

from sistema_biblioteca.ui.cli import BibliotecaCLI
from sistema_biblioteca.models.libro import Libro
from sistema_biblioteca.models.utente import Utente
from sistema_biblioteca.models.prestito import Prestito


class TestBibliotecaCLI(unittest.TestCase):
    """
    Test per la classe BibliotecaCLI.
    """
    
    def setUp(self):
        """
        Configurazione iniziale per i test.
        """
        # Mock dei servizi
        self.catalogo_service = MagicMock()
        self.utenti_service = MagicMock()
        self.prestiti_service = MagicMock()
        
        # Creazione dell'istanza CLI con i mock
        self.cli = BibliotecaCLI(
            self.catalogo_service,
            self.utenti_service,
            self.prestiti_service
        )
        
        # Patch per la funzione pulisci_schermo
        self.pulisci_patch = patch.object(self.cli, 'pulisci_schermo')
        self.mock_pulisci = self.pulisci_patch.start()
    
    def tearDown(self):
        """
        Pulizia dopo i test.
        """
        self.pulisci_patch.stop()
    
    @patch('builtins.input', side_effect=['1', '0', '0'])
    def test_esegui_menu_libri(self, mock_input):
        """
        Testa l'esecuzione del menu libri.
        """
        with patch('sys.stdout', new=io.StringIO()) as fake_output:
            self.cli.esegui()
            output = fake_output.getvalue()
            
            # Verifica che il menu principale sia stato mostrato
            self.assertIn("Sistema di Gestione Biblioteca", output)
            # Verifica che il menu libri sia stato mostrato
            self.assertIn("Gestione Libri", output)
    
    @patch('builtins.input', side_effect=['2', '0', '0'])
    def test_esegui_menu_utenti(self, mock_input):
        """
        Testa l'esecuzione del menu utenti.
        """
        with patch('sys.stdout', new=io.StringIO()) as fake_output:
            self.cli.esegui()
            output = fake_output.getvalue()
            
            # Verifica che il menu principale sia stato mostrato
            self.assertIn("Sistema di Gestione Biblioteca", output)
            # Verifica che il menu utenti sia stato mostrato
            self.assertIn("Gestione Utenti", output)
    
    @patch('builtins.input', side_effect=['3', '0', '0'])
    def test_esegui_menu_prestiti(self, mock_input):
        """
        Testa l'esecuzione del menu prestiti.
        """
        with patch('sys.stdout', new=io.StringIO()) as fake_output:
            self.cli.esegui()
            output = fake_output.getvalue()
            
            # Verifica che il menu principale sia stato mostrato
            self.assertIn("Sistema di Gestione Biblioteca", output)
            # Verifica che il menu prestiti sia stato mostrato
            self.assertIn("Gestione Prestiti", output)
    
    @patch('builtins.input', side_effect=['0'])
    def test_esci(self, mock_input):
        """
        Testa l'uscita dall'applicazione.
        """
        with patch('sys.stdout', new=io.StringIO()) as fake_output:
            self.cli.esegui()
            output = fake_output.getvalue()
            
            # Verifica che il messaggio di uscita sia stato mostrato
            self.assertIn("Grazie per aver utilizzato", output)
    
    @patch('builtins.input', side_effect=['1', '1', '\n', '0', '0'])
    def test_visualizza_libri(self, mock_input):
        """
        Testa la visualizzazione dei libri.
        """
        # Configura il mock per restituire una lista di libri
        libro1 = Libro(id="1", titolo="Il Nome della Rosa", autore="Umberto Eco", isbn="123456789", anno_pubblicazione=1980, editore="Bompiani", genere="Romanzo storico")
        libro2 = Libro(id="2", titolo="1984", autore="George Orwell", isbn="987654321", anno_pubblicazione=1949, editore="Mondadori", genere="Distopia")
        self.catalogo_service.get_all_libri.return_value = [libro1, libro2]
        
        with patch('sys.stdout', new=io.StringIO()) as fake_output:
            self.cli.esegui()
            output = fake_output.getvalue()
            
            # Verifica che i libri siano stati visualizzati
            self.assertIn("Il Nome della Rosa", output)
            self.assertIn("1984", output)
            self.assertIn("Umberto Eco", output)
            self.assertIn("George Orwell", output)
    
    @patch('builtins.input', side_effect=['1', '3', 'Test Libro', 'Test Autore', '1234567890', '2023', 'Test Editore', 'Test Genere', '\n', '0', '0'])
    def test_aggiungi_libro(self, mock_input):
        """
        Testa l'aggiunta di un libro.
        """
        with patch('sys.stdout', new=io.StringIO()):
            self.cli.esegui()
            
            # Verifica che il metodo aggiungi_libro sia stato chiamato
            self.catalogo_service.aggiungi_libro.assert_called_once()
            # Verifica i parametri passati al metodo
            libro = self.catalogo_service.aggiungi_libro.call_args[0][0]
            self.assertEqual(libro.titolo, "Test Libro")
            self.assertEqual(libro.autore, "Test Autore")
            self.assertEqual(libro.isbn, "1234567890")
            self.assertEqual(libro.anno_pubblicazione, 2023)
            self.assertEqual(libro.editore, "Test Editore")
            self.assertEqual(libro.genere, "Test Genere")


if __name__ == '__main__':
    unittest.main()