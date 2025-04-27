import unittest
import os
import json
from sistema_biblioteca.repositories.json_repository import JsonRepository

# Percorso per il file JSON di test
TEST_REPO_FILE = 'test_repo_data.json'

class TestJsonRepository(unittest.TestCase):

    def setUp(self):
        """Configura l'ambiente prima di ogni test."""
        # Assicura che il file di test sia vuoto all'inizio di ogni test
        self.repo = JsonRepository(TEST_REPO_FILE)
        self.repo.save_all([])

    def tearDown(self):
        """Pulisce l'ambiente dopo ogni test."""
        # Rimuovi il file JSON di test
        if os.path.exists(TEST_REPO_FILE):
            os.remove(TEST_REPO_FILE)

    def test_ensure_file_exists(self):
        """Testa la creazione automatica del file se non esiste."""
        if os.path.exists(TEST_REPO_FILE):
            os.remove(TEST_REPO_FILE)
        # L'inizializzazione dovrebbe creare il file
        repo = JsonRepository(TEST_REPO_FILE)
        self.assertTrue(os.path.exists(TEST_REPO_FILE))
        # Verifica che sia un JSON valido (lista vuota)
        with open(TEST_REPO_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            self.assertEqual(data, [])

    def test_load_all_empty(self):
        """Testa il caricamento da un file vuoto."""
        data = self.repo.load_all()
        self.assertEqual(data, [])

    def test_save_all_and_load_all(self):
        """Testa il salvataggio e il caricamento di dati."""
        test_data = [{'id': 1, 'name': 'Test 1'}, {'id': 2, 'name': 'Test 2'}]
        self.repo.save_all(test_data)
        loaded_data = self.repo.load_all()
        self.assertEqual(loaded_data, test_data)

    def test_add_item(self):
        """Testa l'aggiunta di un nuovo elemento."""
        item1 = {'id': 'a1', 'value': 'apple'}
        item2 = {'id': 'a2', 'value': 'banana'}
        self.repo.add(item1)
        self.repo.add(item2)
        loaded_data = self.repo.load_all()
        self.assertEqual(len(loaded_data), 2)
        self.assertIn(item1, loaded_data)
        self.assertIn(item2, loaded_data)

    def test_find_by_id(self):
        """Testa la ricerca di un elemento per ID."""
        item1 = {'id': 'f1', 'value': 'find_me'}
        item2 = {'id': 'f2', 'value': 'another'}
        self.repo.save_all([item1, item2])
        found_item = self.repo.find_by_id('f1', id_field='id')
        self.assertEqual(found_item, item1)
        not_found_item = self.repo.find_by_id('f3', id_field='id')
        self.assertIsNone(not_found_item)

    def test_update_item(self):
        """Testa l'aggiornamento di un elemento esistente."""
        item1 = {'id': 'u1', 'value': 'original'}
        item2 = {'id': 'u2', 'value': 'unchanged'}
        self.repo.save_all([item1, item2])
        updated_data = {'id': 'u1', 'value': 'updated'}
        updated = self.repo.update('u1', updated_data, id_field='id')
        self.assertTrue(updated)
        loaded_data = self.repo.load_all()
        self.assertEqual(len(loaded_data), 2)
        self.assertEqual(loaded_data[0], updated_data)
        self.assertEqual(loaded_data[1], item2)
        # Testa aggiornamento di ID non esistente
        not_updated = self.repo.update('u3', {'value': 'new'}, id_field='id')
        self.assertFalse(not_updated)

    def test_delete_item(self):
        """Testa l'eliminazione di un elemento."""
        item1 = {'id': 'd1', 'value': 'to_delete'}
        item2 = {'id': 'd2', 'value': 'to_keep'}
        self.repo.save_all([item1, item2])
        deleted = self.repo.delete('d1', id_field='id')
        self.assertTrue(deleted)
        loaded_data = self.repo.load_all()
        self.assertEqual(len(loaded_data), 1)
        self.assertEqual(loaded_data[0], item2)
        # Testa eliminazione di ID non esistente
        not_deleted = self.repo.delete('d3', id_field='id')
        self.assertFalse(not_deleted)

if __name__ == '__main__':
    unittest.main()