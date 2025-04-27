# utils/helpers.py
import pygame

def load_image(path, colorkey=None):
    """Carica un'immagine e opzionalmente imposta una colorkey."""
    try:
        image = pygame.image.load(path)
    except pygame.error as message:
        print('Cannot load image:', path)
        raise SystemExit(message)
    image = image.convert()
    if colorkey is not None:
        if colorkey == -1:
            colorkey = image.get_at((0, 0))
        image.set_colorkey(colorkey, pygame.RLEACCEL)
    return image

def load_sound(path):
    """Carica un suono."""
    class NoneSound:
        def play(self): pass
    if not pygame.mixer or not pygame.mixer.get_init():
        return NoneSound()
    try:
        sound = pygame.mixer.Sound(path)
    except pygame.error as message:
        print('Cannot load sound:', path)
        raise SystemExit(message)
    return sound

# Altre funzioni di utilità possono essere aggiunte qui
# Esempio: funzione per scalare immagini, gestire collisioni specifiche, ecc.