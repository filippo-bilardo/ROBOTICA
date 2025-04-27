# Collision detection module

import pygame

def check_collision(sprite1, sprite2):
    # Basic collision check between two sprites
    return pygame.sprite.collide_rect(sprite1, sprite2)

def check_group_collision(sprite, group):
    # Check collision between a sprite and a group
    return pygame.sprite.spritecollideany(sprite, group)