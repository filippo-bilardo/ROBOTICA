import unittest
from sistema_biblioteca.models.libro import Libro
from sistema_biblioteca.models.utente import Utente
from sistema_biblioteca.models.prestito import Prestito
from datetime import datetime, timedelta

class TestModels(unittest.TestCase):

    def test_libro_creation(self):
        """Testa la creazione di un oggetto Libro."""
        libro = Libro(id='1', titolo='Il Signore degli Anelli', autore='J.R.R. Tolkien', anno=1954, disponibile=True)
        self.assertEqual(libro.id, '1')
        self.assertEqual(libro.titolo, 'Il Signore degli Anelli')
        self.assertEqual(libro.autore, 'J.R.R. Tolkien')
        self.assertEqual(libro.anno, 1954)
        self.assertTrue(libro.disponibile)

    def test_utente_creation(self):
        """Testa la creazione di un oggetto Utente."""
        utente = Utente(id='u1', nome='Mario Rossi', email='mario.rossi@example.com')
        self.assertEqual(utente.id, 'u1')
        self.assertEqual(utente.nome, 'Mario Rossi')
        self.assertEqual(utente.email, 'mario.rossi@example.com')

    def test_prestito_creation(self):
        """Testa la creazione di un oggetto Prestito."""
        data_prestito = datetime.now()
        data_scadenza = data_prestito + timedelta(days=30)
        prestito = Prestito(id='p1', libro_id='1', utente_id='u1', data_prestito=data_prestito, data_scadenza=data_scadenza, restituito=False)
        self.assertEqual(prestito.id, 'p1')
        self.assertEqual(prestito.libro_id, '1')
        self.assertEqual(prestito.utente_id, 'u1')
        self.assertEqual(prestito.data_prestito, data_prestito)
        self.assertEqual(prestito.data_scadenza, data_scadenza)
        self.assertFalse(prestito.restituito)

    def test_prestito_scaduto(self):
        """Testa se un prestito è scaduto."""
        data_prestito_scaduto = datetime.now() - timedelta(days=31)
        data_scadenza_scaduto = data_prestito_scaduto + timedelta(days=30)
        prestito_scaduto = Prestito(id='p2', libro_id='2', utente_id='u2', data_prestito=data_prestito_scaduto, data_scadenza=data_scadenza_scaduto, restituito=False)

        data_prestito_non_scaduto = datetime.now() - timedelta(days=10)
        data_scadenza_non_scaduto = data_prestito_non_scaduto + timedelta(days=30)
        prestito_non_scaduto = Prestito(id='p3', libro_id='3', utente_id='u3', data_prestito=data_prestito_non_scaduto, data_scadenza=data_scadenza_non_scaduto, restituito=False)

        self.assertTrue(prestito_scaduto.is_scaduto())
        self.assertFalse(prestito_non_scaduto.is_scaduto())

if __name__ == '__main__':
    unittest.main()