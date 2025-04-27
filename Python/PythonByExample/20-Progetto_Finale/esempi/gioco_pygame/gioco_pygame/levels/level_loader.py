# Level loading module

import json
import os
from ..entities.player import Player
from ..entities.enemy import Enemy
from ..entities.item import Item
# Import other necessary entities like platforms, etc.

class LevelLoader:
    def __init__(self, level_dir):
        self.level_dir = level_dir

    def load_level(self, level_name, all_sprites, player_group, enemy_group, item_group, platform_group):
        """Loads a level from a JSON file."""
        level_path = os.path.join(self.level_dir, f"{level_name}.json")
        try:
            with open(level_path, 'r') as f:
                level_data = json.load(f)
        except FileNotFoundError:
            print(f"Error: Level file not found at {level_path}")
            return None
        except json.JSONDecodeError:
            print(f"Error: Could not decode JSON from {level_path}")
            return None

        # Clear existing sprite groups (optional, depends on game flow)
        # all_sprites.empty()
        # player_group.empty()
        # ... etc.

        player_start_pos = level_data.get('player_start', [100, 100])
        player = Player(player_start_pos[0], player_start_pos[1], all_sprites, player_group)

        for platform_data in level_data.get('platforms', []):
            # Assuming a Platform class exists
            # Platform(platform_data['x'], platform_data['y'], platform_data['width'], platform_data['height'], all_sprites, platform_group)
            pass

        for enemy_data in level_data.get('enemies', []):
            Enemy(enemy_data['x'], enemy_data['y'], all_sprites, enemy_group)

        for item_data in level_data.get('items', []):
            Item(item_data['x'], item_data['y'], item_data['type'], all_sprites, item_group)

        print(f"Level '{level_name}' loaded successfully.")
        return player # Or return all loaded objects if needed