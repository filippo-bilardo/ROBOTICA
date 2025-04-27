# Installazione

Questa sezione descrive i passaggi necessari per installare e configurare l'ambiente di sviluppo per il Gioco Pygame.

## Prerequisiti
- Python 3.x installato sul sistema.
- `pip` (il gestore di pacchetti Python).

## Passaggi di Installazione

1.  **Clonare il Repository (se applicabile):**
    ```bash
    git clone <URL_DEL_REPOSITORY>
    cd gioco_pygame
    ```

2.  **Creare un Ambiente Virtuale (consigliato):**
    ```bash
    python -m venv venv
    # Su Windows
    .\venv\Scripts\activate
    # Su macOS/Linux
    source venv/bin/activate
    ```

3.  **Installare le Dipendenze:**
    Assicurarsi di avere un file `requirements.txt` nella root del progetto.
    ```bash
    pip install -r requirements.txt
    ```
    Il file `requirements.txt` dovrebbe contenere almeno:
    ```
    pygame
    ```

4.  **Eseguire il Gioco:**
    ```bash
    python main.py
    ```

Ora dovresti essere in grado di eseguire il gioco sul tuo sistema locale.