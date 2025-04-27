# Enemy entity module

import pygame
from ..engine.sprite import BaseSprite

class Enemy(BaseSprite):
    def __init__(self, x, y, *groups):
        super().__init__(*groups)
        # Enemy specific initialization
        self.image = pygame.Surface([40, 40]) # Example size
        self.image.fill((255, 0, 0)) # Red placeholder
        self.rect = self.image.get_rect(topleft=(x, y))
        self.velocity_x = 1 # Example movement
        self.velocity_y = 0

    def update(self, platforms):
        # Basic enemy AI / movement logic (placeholder)
        self.rect.x += self.velocity_x
        # Add collision with walls or platforms to reverse direction
        pass