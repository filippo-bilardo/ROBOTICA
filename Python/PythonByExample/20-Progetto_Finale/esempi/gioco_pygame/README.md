# Gioco Interattivo con Pygame

Questo progetto è un esempio di gioco interattivo sviluppato con la libreria Pygame. Si tratta di un semplice gioco platform 2D che dimostra l'utilizzo delle funzionalità di base di Pygame per la creazione di videogiochi.

## Funzionalità

- Grafica 2D con sprite animati
- Sistema di fisica semplificato per movimento e collisioni
- Gestione dell'input da tastiera e mouse
- Sistema di punteggio e vite
- Effetti sonori e musica di sottofondo
- Diversi livelli di gioco

## Struttura del progetto

```
gioco_pygame/
├── gioco_pygame/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── assets/
│   │   ├── images/
│   │   │   ├── player/
│   │   │   ├── enemies/
│   │   │   ├── backgrounds/
│   │   │   └── items/
│   │   ├── sounds/
│   │   │   ├── effects/
│   │   │   └── music/
│   │   └── fonts/
│   ├── engine/
│   │   ├── __init__.py
│   │   ├── sprite.py
│   │   ├── physics.py
│   │   ├── collision.py
│   │   └── animation.py
│   ├── entities/
│   │   ├── __init__.py
│   │   ├── player.py
│   │   ├── enemy.py
│   │   └── item.py
│   ├── levels/
│   │   ├── __init__.py
│   │   ├── level_loader.py
│   │   └── level_data/
│   │       ├── level1.json
│   │       ├── level2.json
│   │       └── level3.json
│   └── ui/
│       ├── __init__.py
│       ├── menu.py
│       ├── hud.py
│       └── game_over.py
├── tests/
│   ├── __init__.py
│   ├── test_physics.py
│   ├── test_collision.py
│   └── test_player.py
├── requirements.txt
├── setup.py
└── README.md
```

## Requisiti

- Python 3.8 o superiore
- Pygame 2.0.0 o superiore

## Installazione

```bash
# Clona il repository
git clone https://github.com/tuonome/gioco_pygame.git
cd gioco_pygame

# Crea un ambiente virtuale
python -m venv venv
source venv/bin/activate  # Su Windows: venv\Scripts\activate

# Installa le dipendenze
pip install -r requirements.txt

# Installa il pacchetto in modalità sviluppo
pip install -e .
```

## Utilizzo

Per avviare il gioco:

```bash
python -m gioco_pygame.main
```

Oppure, se installato come pacchetto:

```bash
gioco-pygame
```

### Controlli

- **Frecce direzionali**: Movimento del personaggio
- **Barra spaziatrice**: Salto
- **Z**: Attacco
- **ESC**: Pausa/Menu
- **F**: Schermo intero

## Documentazione

La documentazione completa è disponibile nella cartella `docs/` e include:

- Guida utente
- Documentazione tecnica
- Tutorial per estendere il gioco

## Sviluppo

### Aggiungere un nuovo livello

Per aggiungere un nuovo livello, crea un file JSON nella cartella `levels/level_data/` con la seguente struttura:

```json
{
  "name": "Nome del livello",
  "background": "backgrounds/background1.png",
  "music": "music/level1.mp3",
  "platforms": [
    {"x": 0, "y": 500, "width": 800, "height": 50},
    {"x": 200, "y": 400, "width": 100, "height": 20}
  ],
  "enemies": [
    {"type": "slime", "x": 300, "y": 450},
    {"type": "bat", "x": 500, "y": 300}
  ],
  "items": [
    {"type": "coin", "x": 250, "y": 350},
    {"type": "powerup", "x": 600, "y": 400}
  ],
  "player_start": {"x": 50, "y": 450},
  "exit": {"x": 750, "y": 450}
}
```

### Aggiungere un nuovo nemico

Per aggiungere un nuovo tipo di nemico, crea una nuova classe in `entities/enemy.py` che estende la classe base `Enemy`.

## Test

Per eseguire i test:

```bash
python -m unittest discover tests
```

## Contribuire

Se vuoi contribuire al progetto, segui questi passaggi:

1. Fai un fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/nome-feature`)
3. Fai commit delle tue modifiche (`git commit -m 'Aggiungi una nuova feature'`)
4. Pusha il branch (`git push origin feature/nome-feature`)
5. Apri una Pull Request

## Licenza

Questo progetto è distribuito con licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.

## Riconoscimenti

- Sprite e asset grafici: [OpenGameArt.org](https://opengameart.org/)
- Effetti sonori: [Freesound.org](https://freesound.org/)
- Musica: [Incompetech.com](https://incompetech.com/)