# Guida alla riproduzione di brani RTTTL

Il formato RTTTL (Ring Tone Text Transfer Language) è un formato di dati sviluppato da Nokia per la creazione di suonerie. È un metodo testuale semplice per descrivere melodie che può essere utilizzato in vari contesti di programmazione, tra cui progetti con Arduino o altri microcontrollori.

## Struttura di base di un file RTTTL

Un file RTTTL è composto da tre sezioni principali:
1. Nome del brano
2. Impostazioni di default
3. Sequenza di note

La struttura generale è: `Nome:Impostazioni:Note`

### 1. Nome del brano
Il nome è semplicemente una stringa che identifica la melodia.

### 2. Impostazioni di default
Le impostazioni includono:
- `d` = durata predefinita delle note (1, 2, 4, 8, 16, 32)
- `o` = ottava predefinita (4, 5, 6, 7)
- `b` = battiti al minuto (BPM)

### 3. Sequenza di note
Ogni nota è definita nel formato: `[durata][nota][ottava][punto]`
- `durata`: opzionale, sovrascrive il valore predefinito
- `nota`: lettera da A a G, con eventuale diesis (#) o bemolle (b)
- `ottava`: opzionale, sovrascrive l'ottava predefinita
- `punto`: un punto (.) aggiunge metà della durata alla nota

## Esempio di implementazione in Arduino

Ecco un esempio di come implementare un player RTTTL base in Arduino:

[Scarica il codice completo](Buzzer_09_play_rtttl.ino)

```cpp
#include <Arduino.h>

#define BUZZER_PIN 8  // Pin collegato al buzzer

// Definizione delle frequenze delle note (in Hz)
#define NOTE_C4  262
#define NOTE_CS4 277
#define NOTE_D4  294
#define NOTE_DS4 311
#define NOTE_E4  330
#define NOTE_F4  349
#define NOTE_FS4 370
#define NOTE_G4  392
#define NOTE_GS4 415
#define NOTE_A4  440
#define NOTE_AS4 466
#define NOTE_B4  494
#define NOTE_C5  523
#define NOTE_CS5 554
#define NOTE_D5  587
#define NOTE_DS5 622
#define NOTE_E5  659
#define NOTE_F5  698
#define NOTE_FS5 740
#define NOTE_G5  784
#define NOTE_GS5 831
#define NOTE_A5  880
#define NOTE_AS5 932
#define NOTE_B5  988
#define NOTE_C6  1047
#define NOTE_P   0    // Pausa

// Un semplice esempio di melodia RTTTL
const char* rtttl = "Super Mario:d=4,o=5,b=100:16e6,16e6,32p,8e6,16c6,8e6,8g6,8p,8g,8p";

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("RTTTL Player");
  
  playRTTTL(rtttl);
}

void loop() {
  // Nulla da fare qui
}

// Funzione per ottenere il valore di frequenza di una nota
int getFrequency(char note, int octave, bool sharp) {
  int baseNote = 0;
  
  switch(note) {
    case 'c': baseNote = NOTE_C4; break;
    case 'd': baseNote = NOTE_D4; break;
    case 'e': baseNote = NOTE_E4; break;
    case 'f': baseNote = NOTE_F4; break;
    case 'g': baseNote = NOTE_G4; break;
    case 'a': baseNote = NOTE_A4; break;
    case 'b': baseNote = NOTE_B4; break;
    case 'p': return 0; // Pausa
  }
  
  // Applica il diesis se necessario
  if (sharp && note != 'e' && note != 'b') {
    baseNote *= 1.059463; // Approssimazione del rapporto tra note
  }
  
  // Calcola la frequenza in base all'ottava
  if (octave == 4) return baseNote;
  if (octave == 5) return baseNote * 2;
  if (octave == 6) return baseNote * 4;
  
  return baseNote;
}

void playRTTTL(const char* rtttl) {
  // Saltare il nome
  const char* p = rtttl;
  while(*p && *p != ':') p++;
  p++;  // salta il ':'
  
  // Impostazioni predefinite
  int defaultDuration = 4;
  int defaultOctave = 6;
  int bpm = 63;
  
  // Leggi le impostazioni predefinite
  while(*p && *p != ':') {
    switch(*p) {
      case 'd': // Durata
        p += 2; // Salta 'd='
        defaultDuration = 0;
        while(isdigit(*p)) {
          defaultDuration = (defaultDuration * 10) + (*p++ - '0');
        }
        break;
      case 'o': // Ottava
        p += 2; // Salta 'o='
        defaultOctave = *p++ - '0';
        break;
      case 'b': // BPM
        p += 2; // Salta 'b='
        bpm = 0;
        while(isdigit(*p)) {
          bpm = (bpm * 10) + (*p++ - '0');
        }
        break;
    }
    p++; // Vai al prossimo carattere
  }
  p++; // Salta il secondo ':'
  
  // Ora leggi e riproduci le note
  while(*p) {
    // Durata
    int duration = defaultDuration;
    if(isdigit(*p)) {
      duration = 0;
      while(isdigit(*p)) {
        duration = (duration * 10) + (*p++ - '0');
      }
    }
    
    // Calcola la durata effettiva in millisecondi
    int timeMs = (60000 / bpm) * (4 / duration);
    
    // Leggi la nota
    char note = 'c';
    if(*p >= 'a' && *p <= 'g') {
      note = *p;
      p++;
    } else if(*p >= 'A' && *p <= 'G') {
      note = *p + 32; // Conversione a minuscolo
      p++;
    } else if(*p == 'p' || *p == 'P') {
      note = 'p'; // Pausa
      p++;
    }
    
    // Verifica se c'è un diesis
    bool sharp = false;
    if(*p == '#') {
      sharp = true;
      p++;
    }
    
    // Ottava
    int octave = defaultOctave;
    if(isdigit(*p)) {
      octave = *p++ - '0';
    }
    
    // Nota puntata
    if(*p == '.') {
      timeMs = timeMs * 3 / 2;
      p++;
    }
    
    // Riproduci la nota
    int freq = getFrequency(note, octave, sharp);
    if(freq > 0) {
      tone(BUZZER_PIN, freq, timeMs * 0.9); // Il 90% della durata per separare le note
    } else {
      noTone(BUZZER_PIN);
    }
    
    // Attendi il tempo necessario
    delay(timeMs);
    noTone(BUZZER_PIN);
    
    // Salta eventuali separatori
    while(*p == ',' || *p == ' ') p++;
  }
}

```

## Implementazione migliorata in una libreria

Per un uso più avanzato, è consigliabile creare una libreria dedicata che offra maggiore flessibilità. Ecco una proposta di implementazione:

```cpp
// RTTTLPlayer.h
#ifndef RTTTL_PLAYER_H
#define RTTTL_PLAYER_H

#include <Arduino.h>

class RTTTLPlayer {
public:
  RTTTLPlayer(uint8_t buzzerPin);
  
  // Imposta un nuovo brano
  void setMelody(const char* rtttlString);
  
  // Riproduci completamente il brano
  void play();
  
  // Riproduci la prossima nota e ritorna true se ci sono altre note
  bool playNextNote();
  
  // Ferma la riproduzione
  void stop();
  
  // Ottieni informazioni sul brano
  const char* getTitle();
  int getBPM();
  
private:
  uint8_t _pin;          // Pin buzzer
  const char* _melody;   // Stringa RTTTL
  const char* _notePtr;  // Puntatore alla posizione corrente
  
  char _title[32];       // Buffer per il titolo
  int _defaultDuration;  // Durata predefinita
  int _defaultOctave;    // Ottava predefinita
  int _bpm;              // Battiti al minuto
  
  bool _isPlaying;       // Flag per indicare se sta riproducendo
  
  // Metodi interni
  void parseSettings();
  int getFrequency(char note, int octave, bool sharp);
};

#endif

```

```cpp
// RTTTLPlayer.cpp
#include "RTTTLPlayer.h"

// Definizione delle frequenze di base (ottava 4)
const int FREQUENCIES[] = {
  262, // C
  277, // C#
  294, // D
  311, // D#
  330, // E
  349, // F
  370, // F#
  392, // G
  415, // G#
  440, // A
  466, // A#
  494  // B
};

RTTTLPlayer::RTTTLPlayer(uint8_t buzzerPin) {
  _pin = buzzerPin;
  _melody = nullptr;
  _notePtr = nullptr;
  _isPlaying = false;
  
  pinMode(_pin, OUTPUT);
}

void RTTTLPlayer::setMelody(const char* rtttlString) {
  _melody = rtttlString;
  _notePtr = nullptr;
  _isPlaying = false;
  
  // Estrai il titolo
  const char* p = _melody;
  int i = 0;
  while(*p && *p != ':' && i < sizeof(_title) - 1) {
    _title[i++] = *p++;
  }
  _title[i] = '\0';
  
  // Salta al punto dopo le impostazioni
  while(*p && *p != ':') p++;
  p++; // Salta il primo ':'
  
  // Impostazioni predefinite
  _defaultDuration = 4;
  _defaultOctave = 6;
  _bpm = 63;
  
  // Leggi le impostazioni
  while(*p && *p != ':') {
    switch(*p) {
      case 'd': // Durata
        p += 2; // Salta 'd='
        _defaultDuration = 0;
        while(isdigit(*p)) {
          _defaultDuration = (_defaultDuration * 10) + (*p++ - '0');
        }
        break;
      case 'o': // Ottava
        p += 2; // Salta 'o='
        _defaultOctave = *p++ - '0';
        break;
      case 'b': // BPM
        p += 2; // Salta 'b='
        _bpm = 0;
        while(isdigit(*p)) {
          _bpm = (_bpm * 10) + (*p++ - '0');
        }
        break;
    }
    p++; // Vai al prossimo carattere
  }
  p++; // Salta il secondo ':'
  
  _notePtr = p; // Imposta il puntatore all'inizio delle note
}

void RTTTLPlayer::play() {
  if (!_melody) return;
  
  // Reimposta il puntatore all'inizio delle note
  const char* p = _melody;
  while(*p && *p != ':') p++;
  p++; // Salta il primo ':'
  while(*p && *p != ':') p++;
  p++; // Salta il secondo ':'
  
  _notePtr = p;
  _isPlaying = true;
  
  // Riproduci tutte le note
  while(_isPlaying && playNextNote()) {
    // Continua finché ci sono note
  }
}

bool RTTTLPlayer::playNextNote() {
  if (!_melody || !_notePtr || !*_notePtr) return false;
  
  const char* p = _notePtr;
  
  // Durata
  int duration = _defaultDuration;
  if(isdigit(*p)) {
    duration = 0;
    while(isdigit(*p)) {
      duration = (duration * 10) + (*p++ - '0');
    }
  }
  
  // Calcola la durata effettiva in millisecondi
  int timeMs = (60000 / _bpm) * (4 / duration);
  
  // Leggi la nota
  char note = 'c';
  if(*p >= 'a' && *p <= 'g') {
    note = *p;
    p++;
  } else if(*p >= 'A' && *p <= 'G') {
    note = *p + 32; // Conversione a minuscolo
    p++;
  } else if(*p == 'p' || *p == 'P') {
    note = 'p'; // Pausa
    p++;
  }
  
  // Verifica se c'è un diesis
  bool sharp = false;
  if(*p == '#') {
    sharp = true;
    p++;
  }
  
  // Ottava
  int octave = _defaultOctave;
  if(isdigit(*p)) {
    octave = *p++ - '0';
  }
  
  // Nota puntata
  if(*p == '.') {
    timeMs = timeMs * 3 / 2;
    p++;
  }
  
  // Riproduci la nota
  int freq = getFrequency(note, octave, sharp);
  if(freq > 0) {
    tone(_pin, freq, timeMs * 0.9); // Il 90% della durata per separare le note
  } else {
    noTone(_pin);
  }
  
  // Attendi il tempo necessario
  delay(timeMs);
  noTone(_pin);
  
  // Salta eventuali separatori
  while(*p == ',' || *p == ' ') p++;
  
  // Aggiorna il puntatore
  _notePtr = p;
  
  return *p != '\0'; // Ritorna true se ci sono altre note
}

void RTTTLPlayer::stop() {
  _isPlaying = false;
  noTone(_pin);
}

const char* RTTTLPlayer::getTitle() {
  return _title;
}

int RTTTLPlayer::getBPM() {
  return _bpm;
}

int RTTTLPlayer::getFrequency(char note, int octave, bool sharp) {
  // Gestisci la pausa
  if (note == 'p') return 0;
  
  // Calcola l'indice della nota (0 = C, 1 = C#, etc.)
  int noteIndex = 0;
  switch(note) {
    case 'c': noteIndex = 0; break;
    case 'd': noteIndex = 2; break;
    case 'e': noteIndex = 4; break;
    case 'f': noteIndex = 5; break;
    case 'g': noteIndex = 7; break;
    case 'a': noteIndex = 9; break;
    case 'b': noteIndex = 11; break;
  }
  
  // Applica il diesis se necessario
  if (sharp) noteIndex++;
  
  // Ottieni la frequenza di base (ottava 4)
  int baseFreq = FREQUENCIES[noteIndex % 12];
  
  // Calcola la frequenza in base all'ottava
  if (octave == 4) return baseFreq;
  if (octave == 5) return baseFreq * 2;
  if (octave == 6) return baseFreq * 4;
  if (octave == 7) return baseFreq * 8;
  
  return baseFreq;
}

```

## Esempio di utilizzo della libreria

```cpp
#include "RTTTLPlayer.h"

#define BUZZER_PIN 8

// Melodie di esempio
const char* starWars = "StarWars:d=4,o=5,b=120:8f,8f,8f,2a#.,2f.6,8d#6,8d6,8c6,2a#.6,f.6,8d#6,8d6,8c6,2a#.6,f.6,8d#6,8d6,8d#6,2c6";
const char* tetris = "Tetris:d=4,o=5,b=160:e6,8b,8c6,8d6,16e6,16d6,8c6,8b,a,8a,8c6,e6,8d6,8c6,b,8b,8c6,d6,e6,c6,a,2a,8p,d6,8f6,a6,8g6,8f6,e6,8e6,8c6,e6,8d6,8c6,b,8b,8c6,d6,e6,c6,a,a";
const char* mario = "Super Mario:d=4,o=5,b=100:16e6,16e6,32p,8e6,16c6,8e6,8g6,8p,8g,8p,8c6,16p,8g,16p,8e,16p,8a,8b,16a#,8a,16g.,16e6,16g6,8a6,16f6,8g6,8e6,16c6,16d6,8b,16p,8c6,16p,8g,16p,8e,16p,8a,8b,16a#,8a,16g.,16e6,16g6,8a6,16f6,8g6,8e6,16c6,16d6,8b";

RTTTLPlayer player(BUZZER_PIN);

void setup() {
  Serial.begin(9600);
  Serial.println("RTTTL Player Demo");
  
  // Imposta una melodia
  player.setMelody(starWars);
  
  Serial.print("Titolo: ");
  Serial.println(player.getTitle());
  Serial.print("BPM: ");
  Serial.println(player.getBPM());
  
  // Riproduci la melodia
  Serial.println("Riproduzione in corso...");
  player.play();
  Serial.println("Riproduzione completata");
  
  delay(1000);
  
  // Cambia melodia
  Serial.println("Cambio melodia...");
  player.setMelody(tetris);
  
  // Riproduzione nota per nota
  Serial.println("Riproduzione nota per nota:");
  while(player.playNextNote()) {
    // È possibile aggiungere qui del codice che viene eseguito mentre
    // ogni nota viene riprodotta
  }
}

void loop() {
  // Nulla da fare qui
}

```

## Melodie RTTTL comuni

Ecco alcune melodie RTTTL popolari che puoi utilizzare nei tuoi progetti:

```cpp
// Collezione di melodie in formato RTTTL
// Le melodie possono essere utilizzate con la libreria RTTTLPlayer

const char* rtttl_mario = "Super Mario:d=4,o=5,b=100:16e6,16e6,32p,8e6,16c6,8e6,8g6,8p,8g,8p,8c6,16p,8g,16p,8e,16p,8a,8b,16a#,8a,16g.,16e6,16g6,8a6,16f6,8g6,8e6,16c6,16d6,8b,16p,8c6,16p,8g,16p,8e,16p,8a,8b,16a#,8a,16g.,16e6,16g6,8a6,16f6,8g6,8e6,16c6,16d6,8b";

const char* rtttl_zelda = "Zelda:d=4,o=5,b=125:a#,f.,8a#,16a#,16c6,16d6,16d#6,2f6,8p,8f6,16f.6,16f#6,16g#.6,2a#.6,16a#.6,16g#6,16f#.6,8g#.6,16f#.6,2f6,f6,8d#6,16d#6,16f6,2f#6,8f6,8d#6,8c#6,16c#6,16d#6,2f6,8d#6,8c#6,8c6,16c6,16d6,2e6,g6,8f6,16f,16f,8f,16f,16f,8f,16f,16f,8f,8f,a#,f.,8a#,16a#,16c6,16d6,16d#6,2f6,8p,8f6,16f.6,16f#6,16g#.6,2a#.6,c#7,c7,2a6,f6,2f#.6,a#6,a6,2f6,f6,2f#.6,a#6,a6,2f6,d6,2d#.6,f#6,f6,2c#6,a#,c6,16d6,2e6,g6,8f6,16f,16f,8f,16f,16f,8f,16f,16f,8f,8f";

const char* rtttl_starwars = "StarWars:d=4,o=5,b=120:8f,8f,8f,2a#.,2f.6,8d#6,8d6,8c6,2a#.6,f.6,8d#6,8d6,8c6,2a#.6,f.6,8d#6,8d6,8d#6,2c6";

const char* rtttl_cantina = "Cantina:d=4,o=5,b=250:8a,8p,8d6,8p,8a,8p,8d6,8p,8a,8d6,8p,8a,8p,8g#,a,8a,8g#,8a,g,8f#,8g,8f#,f.,8d.,16p,p.,8a,8p,8d6,8p,8a,8p,8d6,8p,8a,8d6,8p,8a,8p,8g#,8a,8p,8g,8p,g.,8f#,8g,8p,8c6,a#,a,g";

const char* rtttl_jingle = "JingleBell:d=8,o=5,b=112:32p,a,a,a,a,a,a,a,c6,f.,g.,a,p,a#,a#,a#,a#,a#,a#,a#,d6,a#.,a.,2g";

const char* rtttl_adams = "AdamsFam:d=8,o=5,b=160:c,4f,a,4f,c,4b4,2g,f,4e,g,4e,g4,4c,2f,c,4f,a,4f,c,4b4,2g,f,4e,c,4d,e,1f,c,d,e,f,1p,d,e,f#,g,1p,d,e,f#,g,4p,d,e,f#,g,4p,c,d,e,f";

const char* rtttl_simpsons = "Simpsons:d=4,o=5,b=160:c.6,e6,f#6,8a6,g.6,e6,c6,8a,8f#,8f#,8f#,2g,8p,8p,8f#,8f#,8f#,8g,a#.,8c6,8c6,8c6,c6";

const char* rtttl_indiana = "Indiana:d=4,o=5,b=250:e,8p,8f,8g,8p,1c6,8p.,d,8p,8e,1f,p.,g,8p,8a,8b,8p,1f6,p,a,8p,8b,2c6,2d6,2e6,e,8p,8f,8g,8p,1c6,p,d6,8p,8e6,1f.6,g,8p,8g,e.6,8p,d6,8p,8g,e.6,8p,d6,8p,8g,f.6,8p,e6,8p,8d6,2c6";

const char* rtttl_godfather = "Godfather:d=8,o=5,b=80:g,c6,b,a,2c,a,c6,a,c6,2g6,g,c6,b,a,2c,a,4c6,2a,4e.6,2e6,e6,d6,c6,2b,a,c6,a,c6,2g6,g,c6,b,a,2c,a,4c6,2a";

const char* rtttl_entertainer = "Entertainer:d=4,o=5,b=140:8d,8d#,8e,c6,8e,c6,8e,2c.6,8c6,8d6,8d#6,8e6,8c6,8d6,e6,8b,d6,2c6,p,8d,8d#,8e,c6,8e,c6,8e,2c.6,8p,8a,8g,8f#,8a,8c6,e6,8d6,8c6,8a,2d6";

const char* rtttl_countdown = "Countdown:d=4,o=5,b=125:p,8p,16b,16a,b,e,p,8p,16c6,16b,8c6,8b,a,p,8p,16c6,16b,c6,e,p,8p,16a,16g,8a,8g,8f#,8a,g.,16f#,16g,a.,16g,16a,8b,8a,8g,8f#,e,c6,2b.,16b,16c6,16b,16a,1b";

const char* rtttl_tetris = "Tetris:d=4,o=5,b=160:e6,8b,8c6,8d6,16e6,16d6,8c6,8b,a,8a,8c6,e6,8d6,8c6,b,8b,8c6,d6,e6,c6,a,2a,8p,d6,8f6,a6,8g6,8f6,e6,8e6,8c6,e6,8d6,8c6,b,8b,8c6,d6,e6,c6,a,a";

const char* rtttl_hawaii = "Hawaii50:d=4,o=6,b=80:16c.,16d.,16d#.,16f.,16g.,16a.,16a#.,16b.,c.7,16c.7,16a#.,16a.,16g.,16a.,16a#.,16a.,16g.,16f.,16g.,16f.,16e.,16f.,16g.,16f.,16e.,16d.,16e.,16d.,16c.,16d.,16e.,16d.,16c.,16b5.,16c.,16b5.,16a#.5,16b.5,16c.,a5,1p";

const char* rtttl_bond = "Bond:d=4,o=5,b=80:32p,16c#6,32d#6,32d#6,16d#6,8d#6,16c#6,16c#6,16c#6,16c#6,32e6,32e6,16e6,8e6,16d#6,16d#6,16d#6,16c#6,32d#6,32d#6,16d#6,8d#6,16c#6,16c#6,16c#6,16c#6,32e6,32e6,16e6,8e6,16d#6,16d6,16c#6,16c#7,c.7,16g#6,16f#6,g#.6";

const char* rtttl_mission = "MissionImp:d=16,o=6,b=95:32d,32d#,32d,32d#,32d,32d#,32d,32d#,32d,32d,32d#,32e,32f,32f#,32g,g,8p,g,8p,a#,p,c7,p,g,8p,g,8p,f,p,f#,p,g,8p,g,8p,a#,p,c7,p,g,8p,g,8p,f,p,f#,p,a#,g,2d,32p,a#,g,2c#,32p,a#,g,2c,a#5,8c,2p,32p,a#5,g5,2f#,32p,a#5,g5,2f,32";
```