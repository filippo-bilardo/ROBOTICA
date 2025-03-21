##
# \Buzzer_10_play_rttt.py
#
#  RTTTL Player per Raspberry Pi Pico - Implementazione MicroPython
# Questo programma riproduce melodie in formato RTTTL (Ring Tone Text Transfer Language)
# su un buzzer collegato al Raspberry Pi Pico.
#
# https://wokwi.com/projects/426041520669602817
# https://github.com/filippo-bilardo/ROBOTICA/tree/main/Buzzer 
#
# @author Filippo Bilardo
# @version 1.0 21/03/25 - Versione iniziale

import machine
import time
import math

# Definizione delle note e frequenze
NOTE_MAP = {
    'c': 0, 'c#': 1, 'd': 2, 'd#': 3, 'e': 4, 'f': 5, 'f#': 6,
    'g': 7, 'g#': 8, 'a': 9, 'a#': 10, 'b': 11, 'h': 11, 'p': -1
}

# Pin per il buzzer - modifica in base al tuo collegamento
buzzer_pin = machine.Pin(15)  # GP15 come esempio
buzzer = machine.PWM(buzzer_pin)
buzzer.duty_u16(0)  # Inizialmente spento

def play_tone(frequency, duration_ms):
    """Riproduce un tono alla frequenza specificata per la durata indicata."""
    if frequency <= 0:
        buzzer.duty_u16(0)  # Pausa - nessun suono
        time.sleep_ms(int(duration_ms))  # Converti a intero
    else:
        # Calcola il periodo e imposta la frequenza
        buzzer.freq(int(frequency))
        buzzer.duty_u16(32767)  # 50% duty cycle
        time.sleep_ms(int(duration_ms * 0.9))  # 90% della durata per separare le note
        buzzer.duty_u16(0)  # Spegni il buzzer
        time.sleep_ms(int(duration_ms * 0.1))  # Pausa del 10%

def get_frequency(note, octave):
    """Calcola la frequenza di una nota in base all'ottava."""
    if note == 'p':  # Pausa
        return 0
    
    # Nota di base C4 = 261.63 Hz
    # Ogni semitono è 2^(1/12) volte la frequenza precedente
    base_c4 = 261.63
    semitone_ratio = math.pow(2, 1/12)
    
    # Calcola la distanza in semitoni da C4
    note_index = NOTE_MAP[note.lower()]
    octave_diff = octave - 4
    semitones_from_c4 = note_index + (octave_diff * 12)
    
    # Calcola la frequenza
    return base_c4 * math.pow(semitone_ratio, semitones_from_c4)

def parse_rtttl(rtttl_string):
    """Analizza una stringa RTTTL e la converte in una sequenza di note."""
    parts = rtttl_string.split(':')
    if len(parts) != 3:
        print("Formato RTTTL non valido!")
        return None, None
    
    name = parts[0].strip()
    defaults = parts[1].strip().split(',')
    notes = parts[2].strip().split(',')
    
    # Impostazioni predefinite
    default_duration = 4
    default_octave = 6
    default_bpm = 63
    
    # Analizza le impostazioni predefinite
    for setting in defaults:
        if '=' not in setting:
            continue
        key, value = setting.split('=')
        if key == 'd':
            default_duration = int(value)
        elif key == 'o':
            default_octave = int(value)
        elif key == 'b':
            default_bpm = int(value)
    
    # Calcola il tempo di base per una quarto (in millisecondi)
    quarter_note_duration = int(60000 / default_bpm)

    # Note parsate (nota, ottava, durata in millisecondi)     
    parsed_notes = []
    
    # Analizza ogni nota
    for note_str in notes:
        note_str = note_str.strip()
        if not note_str:
            continue
        
        # Durata
        duration = default_duration
        i = 0
        while i < len(note_str) and note_str[i].isdigit():
            duration_str = ''
            while i < len(note_str) and note_str[i].isdigit():
                duration_str += note_str[i]
                i += 1
            if duration_str:
                duration = int(duration_str)
        
        # Calcola la durata in millisecondi
        duration_ms = quarter_note_duration * (4 / duration)
        
        # Nota
        if i < len(note_str):
            note = note_str[i]
            i += 1
            
            # Diesis
            if i < len(note_str) and note_str[i] == '#':
                note += '#'
                i += 1
            
            # Ottava
            octave = default_octave
            if i < len(note_str) and note_str[i].isdigit():
                octave = int(note_str[i])
                i += 1
            
            # Nota puntata
            if i < len(note_str) and note_str[i] == '.':
                duration_ms *= 1.5
                i += 1
            
            # Aggiungi la nota parsata
            parsed_notes.append((note.lower(), octave, duration_ms))
    
    return name, parsed_notes

def play_rtttl(rtttl_string):
    """Riproduce una melodia in formato RTTTL."""
    name, notes = parse_rtttl(rtttl_string)
    if not notes:
        return
    
    print(f"Riproduzione di '{name}'...")
    
    for note, octave, duration_ms in notes:
        frequency = get_frequency(note, octave)
        play_tone(frequency, duration_ms)
    
    # Assicurati che il buzzer sia spento alla fine
    buzzer.duty_u16(0)
    print("Riproduzione completata")

# Esempio di melodie RTTTL
star_wars = "StarWars:d=4,o=5,b=120:8f,8f,8f,2a#.,2f.6,8d#6,8d6,8c6,2a#.6,f.6,8d#6,8d6,8c6,2a#.6,f.6,8d#6,8d6,8d#6,2c6"
mario = "Super Mario:d=4,o=5,b=100:16e6,16e6,32p,8e6,16c6,8e6,8g6,8p,8g,8p,8c6,16p,8g,16p,8e,16p,8a,8b,16a#,8a,16g.,16e6,16g6,8a6,16f6,8g6,8e6,16c6,16d6,8b,16p,8c6,16p,8g,16p,8e,16p,8a,8b,16a#,8a,16g.,16e6,16g6,8a6,16f6,8g6,8e6,16c6,16d6,8b"
tetris = "Tetris:d=4,o=5,b=160:e6,8b,8c6,8d6,16e6,16d6,8c6,8b,a,8a,8c6,e6,8d6,8c6,b,8b,8c6,d6,e6,c6,a,2a,8p,d6,8f6,a6,8g6,8f6,e6,8e6,8c6,e6,8d6,8c6,b,8b,8c6,d6,e6,c6,a,a"

# Funzione principale
def main():
    print("RTTTL Player per Raspberry Pi Pico")
    print("Collegare il buzzer al pin GP15")
    print("Avvio riproduzione...")
    
    play_rtttl(mario)
    time.sleep(1)
    play_rtttl(star_wars)
    time.sleep(1)
    play_rtttl(tetris)

if __name__ == "__main__":
    main()