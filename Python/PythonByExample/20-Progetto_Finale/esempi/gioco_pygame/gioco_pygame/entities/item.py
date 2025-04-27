# Item entity module

import pygame
from ..engine.sprite import BaseSprite

class Item(BaseSprite):
    def __init__(self, x, y, item_type, *groups):
        super().__init__(*groups)
        # Item specific initialization
        self.item_type = item_type
        self.image = pygame.Surface([20, 20]) # Example size
        # Example: Different color based on type
        if self.item_type == 'coin':
            self.image.fill((255, 255, 0)) # Yellow placeholder
        else:
            self.image.fill((128, 128, 128)) # Grey placeholder
        self.rect = self.image.get_rect(topleft=(x, y))

    def update(self, *args, **kwargs):
        # Items are usually static, but could have animations
        pass

    def collect(self):
        # Logic when the player collects the item
        print(f"{self.item_type} collected!")
        self.kill() # Remove the item sprite