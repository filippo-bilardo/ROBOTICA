# ui/menu.py
import pygame

class Menu:
    def __init__(self, screen):
        self.screen = screen
        self.font = pygame.font.Font(None, 74)
        self.options = ["Start Game", "Options", "Quit"]
        self.selected_option = 0

    def draw(self):
        self.screen.fill((0, 0, 0)) # Sfondo nero
        for i, option in enumerate(self.options):
            color = (255, 255, 255) # Bianco
            if i == self.selected_option:
                color = (255, 0, 0) # Rosso per l'opzione selezionata
            text_surface = self.font.render(option, True, color)
            text_rect = text_surface.get_rect(center=(self.screen.get_width() // 2, 150 + i * 100))
            self.screen.blit(text_surface, text_rect)

    def handle_input(self, event):
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_UP:
                self.selected_option = (self.selected_option - 1) % len(self.options)
            elif event.key == pygame.K_DOWN:
                self.selected_option = (self.selected_option + 1) % len(self.options)
            elif event.key == pygame.K_RETURN: # Tasto Invio
                return self.options[self.selected_option]
        return None # Nessuna azione selezionata