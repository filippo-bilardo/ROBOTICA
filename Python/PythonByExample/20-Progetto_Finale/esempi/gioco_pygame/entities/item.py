# entities/item.py
import pygame

class Item(pygame.sprite.Sprite):
    def __init__(self, x, y, item_type):
        super().__init__()
        self.item_type = item_type
        # Carica l'immagine appropriata in base al tipo di oggetto
        # self.image = ...
        # self.rect = self.image.get_rect(topleft=(x, y))
        print(f"Item '{self.item_type}' creato a ({x}, {y})") # Placeholder

    def update(self):
        # Logica di aggiornamento dell'oggetto (es. animazioni)
        pass