# utils/helpers.py

import pygame

def load_image(path):
    """Carica un'immagine e la converte per una migliore performance."""
    try:
        image = pygame.image.load(path).convert_alpha()
    except pygame.error as e:
        print(f'Impossibile caricare l'immagine: {path}')
        raise SystemExit(e)
    return image

def load_sound(path):
    """Carica un suono."""
    try:
        sound = pygame.mixer.Sound(path)
    except pygame.error as e:
        print(f'Impossibile caricare il suono: {path}')
        raise SystemExit(e)
    return sound