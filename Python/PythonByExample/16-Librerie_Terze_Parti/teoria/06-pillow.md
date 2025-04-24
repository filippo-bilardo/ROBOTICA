# Pillow: Elaborazione delle Immagini in Python

## Cos'è Pillow?

Pillow è una libreria per l'elaborazione delle immagini in Python. È un fork della libreria PIL (Python Imaging Library), che non è più mantenuta attivamente. Pillow estende PIL con nuove funzionalità e correzioni di bug, mantenendo la compatibilità con il codice esistente.

Pillow supporta una vasta gamma di formati di immagine e offre potenti funzionalità per manipolare, convertire e analizzare immagini.

## Perché usare Pillow?

- **Versatilità**: Supporta numerosi formati di immagine (JPEG, PNG, GIF, BMP, TIFF, ecc.)
- **Facilità d'uso**: API semplice e intuitiva per operazioni comuni
- **Funzionalità**: Offre strumenti per ridimensionare, ritagliare, ruotare, filtrare e molto altro
- **Integrazione**: Si integra bene con altre librerie come NumPy e Matplotlib
- **Attivo sviluppo**: Aggiornamenti regolari e supporto della comunità

## Installazione

Per installare Pillow, usa pip:

```bash
pip install Pillow
```

O con Anaconda:

```bash
conda install pillow
```

## Concetti Fondamentali

### Aprire e Salvare Immagini

```python
from PIL import Image

# Aprire un'immagine
img = Image.open('esempio.jpg')

# Mostrare informazioni sull'immagine
print(f"Formato: {img.format}")
print(f"Dimensioni: {img.size}")
print(f"Modalità: {img.mode}")

# Mostrare l'immagine
img.show()

# Salvare l'immagine in un altro formato
img.save('esempio.png')
```

### Creazione di Nuove Immagini

```python
from PIL import Image

# Creare una nuova immagine RGB (rosso, verde, blu)
img = Image.new('RGB', (300, 200), color='red')

# Salvare l'immagine
img.save('immagine_rossa.png')

# Creare un'immagine con sfondo trasparente (RGBA)
img_trasparente = Image.new('RGBA', (300, 200), color=(255, 0, 0, 128))  # Rosso semi-trasparente
img_trasparente.save('immagine_trasparente.png')
```

## Manipolazione delle Immagini

### Ridimensionamento

```python
from PIL import Image

# Aprire un'immagine
img = Image.open('esempio.jpg')

# Ridimensionare a dimensioni specifiche
img_ridimensionata = img.resize((800, 600))
img_ridimensionata.save('esempio_ridimensionato.jpg')

# Ridimensionare mantenendo le proporzioni
larghezza_base, altezza_base = img.size
rapporto = larghezza_base / altezza_base
nuova_larghezza = 800
nuova_altezza = int(nuova_larghezza / rapporto)

img_proporzionale = img.resize((nuova_larghezza, nuova_altezza))
img_proporzionale.save('esempio_proporzionale.jpg')
```

### Ritaglio

```python
from PIL import Image

# Aprire un'immagine
img = Image.open('esempio.jpg')

# Ritagliare una regione (sinistra, superiore, destra, inferiore)
regione = (100, 100, 400, 300)
img_ritagliata = img.crop(regione)
img_ritagliata.save('esempio_ritagliato.jpg')
```

### Rotazione e Capovolgimento

```python
from PIL import Image

# Aprire un'immagine
img = Image.open('esempio.jpg')

# Rotazione di 45 gradi (con riempimento bianco)
img_ruotata = img.rotate(45, expand=True, fillcolor='white')
img_ruotata.save('esempio_ruotato.jpg')

# Capovolgimento orizzontale
img_capovolta_h = img.transpose(Image.FLIP_LEFT_RIGHT)
img_capovolta_h.save('esempio_capovolta_h.jpg')

# Capovolgimento verticale
img_capovolta_v = img.transpose(Image.FLIP_TOP_BOTTOM)
img_capovolta_v.save('esempio_capovolta_v.jpg')
```

### Filtri e Miglioramenti

```python
from PIL import Image, ImageFilter, ImageEnhance

# Aprire un'immagine
img = Image.open('esempio.jpg')

# Applicare un filtro di sfocatura
img_sfocata = img.filter(ImageFilter.BLUR)
img_sfocata.save('esempio_sfocato.jpg')

# Applicare un filtro di nitidezza
img_nitida = img.filter(ImageFilter.SHARPEN)
img_nitida.save('esempio_nitido.jpg')

# Applicare un filtro di contorno
img_contorno = img.filter(ImageFilter.FIND_EDGES)
img_contorno.save('esempio_contorno.jpg')

# Migliorare il contrasto
enhancer = ImageEnhance.Contrast(img)
img_contrasto = enhancer.enhance(1.5)  # Aumentare il contrasto del 50%
img_contrasto.save('esempio_contrasto.jpg')

# Migliorare la luminosità
enhancer = ImageEnhance.Brightness(img)
img_luminosa = enhancer.enhance(1.2)  # Aumentare la luminosità del 20%
img_luminosa.save('esempio_luminoso.jpg')

# Migliorare la saturazione del colore
enhancer = ImageEnhance.Color(img)
img_saturata = enhancer.enhance(1.5)  # Aumentare la saturazione del 50%
img_saturata.save('esempio_saturato.jpg')
```

### Conversione tra Modalità di Colore

```python
from PIL import Image

# Aprire un'immagine
img = Image.open('esempio.jpg')

# Convertire in scala di grigi
img_grigio = img.convert('L')
img_grigio.save('esempio_grigio.jpg')

# Convertire in bianco e nero (1 bit)
img_bn = img.convert('1')
img_bn.save('esempio_bn.jpg')

# Convertire in RGBA (aggiungere canale alfa)
img_rgba = img.convert('RGBA')
img_rgba.save('esempio_rgba.png')
```

## Disegno su Immagini

```python
from PIL import Image, ImageDraw, ImageFont

# Creare una nuova immagine
img = Image.new('RGB', (400, 300), color='white')

# Creare un oggetto di disegno
draw = ImageDraw.Draw(img)

# Disegnare forme
draw.rectangle((50, 50, 350, 250), outline='black', fill='lightblue')
draw.ellipse((100, 100, 300, 200), outline='red', fill='yellow')
draw.line((0, 0, 400, 300), fill='green', width=3)
draw.polygon([(200, 50), (350, 150), (200, 250), (50, 150)], outline='purple', fill='pink')

# Aggiungere testo
try:
    # Tentare di caricare un font di sistema
    font = ImageFont.truetype('arial.ttf', 24)
except IOError:
    # Se non disponibile, usare il font predefinito
    font = ImageFont.load_default()

draw.text((150, 30), 'Pillow Demo', fill='black', font=font)

# Salvare l'immagine
img.save('disegno.png')
```

## Lavorare con i Pixel

```python
from PIL import Image
import numpy as np

# Aprire un'immagine
img = Image.open('esempio.jpg')

# Convertire l'immagine in un array NumPy
img_array = np.array(img)

# Manipolare i pixel (esempio: invertire i colori)
img_invertita_array = 255 - img_array

# Convertire l'array NumPy in un'immagine Pillow
img_invertita = Image.fromarray(img_invertita_array)
img_invertita.save('esempio_invertito.jpg')

# Accesso diretto ai pixel (metodo più lento)
img_pixel = img.copy()
pixels = img_pixel.load()

larghezza, altezza = img_pixel.size
for x in range(larghezza):
    for y in range(altezza):
        r, g, b = pixels[x, y]
        # Aumentare il canale rosso
        pixels[x, y] = (min(r + 50, 255), g, b)

img_pixel.save('esempio_rosso.jpg')
```

## Elaborazione di Immagini Multiple

### Creazione di una GIF Animata

```python
from PIL import Image, ImageDraw

# Creare una lista di frame
frames = []
colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple']

for color in colors:
    # Creare un nuovo frame
    frame = Image.new('RGB', (200, 200), color='white')
    draw = ImageDraw.Draw(frame)
    
    # Disegnare un cerchio colorato
    draw.ellipse((50, 50, 150, 150), fill=color)
    
    # Aggiungere il frame alla lista
    frames.append(frame)

# Salvare come GIF animata
frames[0].save(
    'animazione.gif',
    save_all=True,
    append_images=frames[1:],
    optimize=True,
    duration=200,  # Durata di ogni frame in millisecondi
    loop=0  # 0 significa loop infinito
)
```

### Unione di Immagini (Collage)

```python
from PIL import Image

# Creare una nuova immagine per il collage
collage_width = 800
collage_height = 600
collage = Image.new('RGB', (collage_width, collage_height), 'white')

# Supponiamo di avere una lista di percorsi di immagini
percorsi_immagini = ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg']

# Posizioni per le immagini nel collage
posizioni = [(0, 0), (400, 0), (0, 300), (400, 300)]

# Dimensione di ogni immagine nel collage
dimensione_thumbnail = (400, 300)

# Aggiungere ogni immagine al collage
for i, percorso in enumerate(percorsi_immagini):
    try:
        img = Image.open(percorso)
        img.thumbnail(dimensione_thumbnail)
        collage.paste(img, posizioni[i])
    except Exception as e:
        print(f"Errore con l'immagine {percorso}: {e}")

# Salvare il collage
collage.save('collage.jpg')
```

## Esempio Pratico: Filigrana su Immagini

```python
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import os

def aggiungi_filigrana(immagine_input, testo, output_path=None):
    """Aggiunge una filigrana di testo a un'immagine."""
    # Aprire l'immagine
    img = Image.open(immagine_input)
    
    # Creare un'immagine trasparente per la filigrana
    filigrana = Image.new('RGBA', img.size, (0, 0, 0, 0))
    
    # Creare un oggetto di disegno
    draw = ImageDraw.Draw(filigrana)
    
    # Scegliere il font e la dimensione
    try:
        font = ImageFont.truetype('arial.ttf', 36)
    except IOError:
        font = ImageFont.load_default()
    
    # Calcolare la dimensione del testo
    text_width, text_height = draw.textsize(testo, font=font)
    
    # Posizione del testo (centrato)
    x = (img.width - text_width) // 2
    y = (img.height - text_height) // 2
    
    # Disegnare il testo con ombra
    draw.text((x+2, y+2), testo, font=font, fill=(0, 0, 0, 128))  # Ombra
    draw.text((x, y), testo, font=font, fill=(255, 255, 255, 128))  # Testo
    
    # Convertire l'immagine originale in RGBA se non lo è già
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Combinare l'immagine originale con la filigrana
    img_con_filigrana = Image.alpha_composite(img, filigrana)
    
    # Determinare il percorso di output
    if output_path is None:
        nome_file = os.path.basename(immagine_input)
        nome_base, estensione = os.path.splitext(nome_file)
        output_path = f"{nome_base}_filigrana.png"
    
    # Salvare l'immagine risultante
    img_con_filigrana.save(output_path)
    print(f"Immagine con filigrana salvata come {output_path}")
    
    return output_path

# Esempio di utilizzo
aggiungi_filigrana('esempio.jpg', 'Copyright © 2023')
```

## Conclusione

Pillow è una libreria potente e versatile per l'elaborazione delle immagini in Python. Le sue funzionalità coprono una vasta gamma di operazioni, dalla semplice manipolazione delle immagini alla creazione di grafica complessa.

La sua integrazione con altre librerie scientifiche di Python, come NumPy e Matplotlib, la rende particolarmente utile per applicazioni di analisi delle immagini, computer vision e machine learning.

## Risorse Aggiuntive

- [Documentazione ufficiale di Pillow](https://pillow.readthedocs.io/)
- [Tutorial di Pillow](https://pillow.readthedocs.io/en/stable/handbook/tutorial.html)
- [Handbook di Pillow](https://pillow.readthedocs.io/en/stable/handbook/index.html)

## Navigazione

- [Torna all'indice delle librerie](../README.md)
- [Libreria precedente: Matplotlib](05-matplotlib.md)
- [Libreria successiva: Beautiful Soup](07-beautifulsoup.md)