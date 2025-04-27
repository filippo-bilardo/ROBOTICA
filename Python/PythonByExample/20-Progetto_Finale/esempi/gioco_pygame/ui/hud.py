# ui/hud.py
import pygame

class HUD:
    def __init__(self, screen):
        self.screen = screen
        self.font = pygame.font.Font(None, 36)
        self.score = 0
        self.lives = 3

    def update(self, score, lives):
        self.score = score
        self.lives = lives

    def draw(self):
        # Disegna il punteggio
        score_text = self.font.render(f"Score: {self.score}", True, (255, 255, 255))
        self.screen.blit(score_text, (10, 10))

        # Disegna le vite
        lives_text = self.font.render(f"Lives: {self.lives}", True, (255, 255, 255))
        lives_rect = lives_text.get_rect(topright=(self.screen.get_width() - 10, 10))
        self.screen.blit(lives_text, lives_rect)