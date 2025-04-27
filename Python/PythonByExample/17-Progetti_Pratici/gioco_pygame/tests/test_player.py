# tests/test_player.py

import unittest
import pygame
from entities.player import Player

class TestPlayer(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Inizializza Pygame una sola volta per tutti i test
        pygame.init()
        # Crea uno schermo fittizio (necessario per alcune operazioni di Pygame)
        cls.screen = pygame.display.set_mode((1, 1))

    def setUp(self):
        # Crea un'istanza di Player prima di ogni test
        self.player = Player(100, 100)

    def test_initial_position(self):
        self.assertEqual(self.player.rect.x, 100)
        self.assertEqual(self.player.rect.y, 100)

    def test_move_right(self):
        initial_x = self.player.rect.x
        self.player.move(5, 0) # Muovi a destra
        self.assertEqual(self.player.rect.x, initial_x + 5)

    def test_move_left(self):
        initial_x = self.player.rect.x
        self.player.move(-5, 0) # Muovi a sinistra
        self.assertEqual(self.player.rect.x, initial_x - 5)

    def test_move_down(self):
        initial_y = self.player.rect.y
        self.player.move(0, 5) # Muovi in basso
        self.assertEqual(self.player.rect.y, initial_y + 5)

    def test_move_up(self):
        initial_y = self.player.rect.y
        self.player.move(0, -5) # Muovi in alto
        self.assertEqual(self.player.rect.y, initial_y - 5)

    # Aggiungi altri test per la logica del giocatore (salto, attacco, ecc.)

    @classmethod
    def tearDownClass(cls):
        # Deinizializza Pygame dopo tutti i test
        pygame.quit()

if __name__ == '__main__':
    unittest.main()