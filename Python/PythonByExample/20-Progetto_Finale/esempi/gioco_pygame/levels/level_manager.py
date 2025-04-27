# levels/level_manager.py
import pygame

class LevelManager:
    def __init__(self):
        self.levels = [] # Lista dei livelli
        self.current_level_index = 0
        # Carica i dati dei livelli (es. da file TMX o JSON)
        self._load_levels()

    def _load_levels(self):
        # Logica per caricare le definizioni dei livelli
        print("Caricamento livelli...") # Placeholder
        # Esempio: self.levels.append(Level('level1.tmx'))
        pass

    def get_current_level(self):
        if 0 <= self.current_level_index < len(self.levels):
            return self.levels[self.current_level_index]
        return None

    def next_level(self):
        self.current_level_index += 1
        if self.current_level_index >= len(self.levels):
            # Fine del gioco o loop
            print("Fine dei livelli!")
            return False
        return True

    def update(self):
        level = self.get_current_level()
        if level:
            level.update()

    def draw(self, screen):
        level = self.get_current_level()
        if level:
            level.draw(screen)

# Potrebbe esserci anche una classe Level qui o in un file separato
# class Level:
#     def __init__(self, map_file):
#         # Carica mappa, oggetti, nemici...
#         pass
#     def update(self):
#         pass
#     def draw(self, screen):
#         pass