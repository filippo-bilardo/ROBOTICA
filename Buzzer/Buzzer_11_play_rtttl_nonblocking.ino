/**
 * \Buzzer_11_play_rtttl_nonblocking
 *
 * Versione non bloccante per suonare melodie in formato RTTTL 
 * e contemporaneamente far lampeggiare un LED.
 * 
 * Utilizza una macchina a stati per eseguire operazioni senza bloccare il loop principale.
 * Ciò consente di eseguire altre operazioni (come lampeggiare un LED) mentre suona la melodia.
 * 
 * https://wokwi.com/projects/426124385658658817
 * https://github.com/filippo-bilardo/ROBOTICA/blob/main/Buzzer/README.md
 *
 * @author Versione originale: Filippo Bilardo
 * @version 1.0  22/03/25 - Versione non bloccante
 */

// Definizione dei pin
const int buzzerPin = 8;
const int ledPin = 13;

// Definizione della classe Buzzer non bloccante
class NonBlockingBuzzer
{
private:
    int buzzerPin;              // Pin del buzzer
    unsigned long previousMillis;  // Tempo dell'ultima azione
    unsigned long noteDuration;    // Durata della nota corrente in ms
    unsigned long noteStartTime;   // Tempo di inizio della nota corrente
    bool isPlaying;               // Indica se la melodia è in riproduzione
    bool isNoteOn;                // Indica se una nota è in riproduzione
    const char* currentMelody;    // Puntatore alla melodia corrente
    const char* currentPosition;  // Posizione corrente nella melodia
    
    // Parametri della melodia RTTTL
    int defaultDuration;
    int defaultOctave;
    int bpm;
    int wholenote;

    /**
     * @brief Funzione per calcolare la frequenza di una nota
     * comprese i diesis e i bemolli
     * 
     * @param note la nota (C, D, E, F, G, A, B) //case insensitive
     * @param octave l'ottava (0-8)
     * @param sharp_flat 1 per diesis, -1 per bemolle, 0 per naturale
     * @return int la frequenza della nota
     */
    int getNoteFrequency(char note, int octave, int sharp_flat)
    {
        // Frequenze base delle note nell'ottava 4 (A4 = 440Hz)
        const int notes[] = {
            0,   // Non usato
            262, // C 
            277, // C#, Db
            294, // D
            311, // D#, Eb
            330, // E
            349, // F 
            370, // F#, Gb
            392, // G
            415, // G#, Ab
            440, // A
            466, // A#, Bb  
            494  // B
        };
        int index = 0;

        // Trasforma la nota in minuscolo per uniformità
        note = tolower(note);

        // Mappatura diretta note-indici
        switch(tolower(note)) {
            case 'c': index = 1; break;
            case 'd': index = 3; break;
            case 'e': index = 5; break;
            case 'f': index = 6; break;
            case 'g': index = 8; break;
            case 'a': index = 10; break;
            case 'b': case 'h': index = 12; break; // h è usato in alcuni paesi europei
            default: return 0; // Nota non valida
        }

        // Aggiungi diesis o bemolle
        index += sharp_flat;
        if(index < 1) index = 1;
        if(index > 12) index = 12;

        // Calcolo della frequenza in base all'ottava
        int frequency = notes[index] * (1 << (octave - 4));
        return frequency;
    }

    // Inizializza i parametri per una nuova melodia
    void initMelody() {
        defaultDuration = 4;
        defaultOctave = 5;
        bpm = 120;
        isNoteOn = false;
        
        // Estrazione del titolo e stampa
        const char *p = strchr(currentMelody, ':');
        if (p == nullptr) {
            isPlaying = false;
            return;
        }
        
        Serial.print("In riproduzione: ");
        for (int j = 0; j < p - currentMelody; j++) {
            Serial.print(currentMelody[j]);
        }
        Serial.println();

        // Estrazione dei parametri dalla stringa RTTTL
        p++; // Salta il carattere ':'
        while (*p != '\0' && *p != ':') {
            if (strncmp(p, "d=", 2) == 0) {
                p += 2; // Salta il prefisso "d="
                defaultDuration = atoi(p);
                while (isdigit(*p)) p++;
            }
            else if (strncmp(p, "o=", 2) == 0) {
                p += 2; // Salta il prefisso "o="
                defaultOctave = atoi(p);
                while (isdigit(*p)) p++;
            }
            else if (strncmp(p, "b=", 2) == 0) {
                p += 2; // Salta il prefisso "b="
                bpm = atoi(p);
                while (isdigit(*p)) p++;
            }

            // Salta eventuali separatori
            if (*p == ',' || *p == ' ')
                p++;
        }

        if (*p == '\0') {
            isPlaying = false;
            return;
        }
        
        p++; // Salta il carattere ':'
        currentPosition = p;
        
        // Calcolo del tempo di una nota intera in millisecondi
        wholenote = (60 * 1000L / bpm) * 4;
        
        isPlaying = true;
    }

    // Avanza alla prossima nota
    void playNextNote() {
        if (!isPlaying || currentPosition == nullptr || *currentPosition == '\0') {
            isPlaying = false;
            noTone(buzzerPin);
            return;
        }

        // Estrazione della durata
        int duration = defaultDuration;
        if (isdigit(*currentPosition)) {
            duration = 0;
            while (isdigit(*currentPosition)) {
                duration = duration * 10 + (*currentPosition - '0');
                currentPosition++;
            }
        }

        // Gestione della nota puntata (aumenta durata del 50%)
        bool dotted = false;
        if (*currentPosition == '.') {
            dotted = true;
            currentPosition++;
        }

        // Estrazione della nota e dell'ottava
        char note = '\0';
        int octave = defaultOctave;
        int sharp_flat = 0;
        
        if (isalpha(*currentPosition)) {
            note = tolower(*currentPosition);
            currentPosition++;

            // Estrazione dell'eventuale diesis o bemolle
            if (*currentPosition == '#' || *currentPosition == 'b') {
                sharp_flat = (*currentPosition == '#') ? 1 : -1;
                currentPosition++;
            }

            // Estrazione dell'ottava
            if (isdigit(*currentPosition)) {
                octave = *currentPosition - '0';
                currentPosition++;
            }
        }

        // Calcolo della durata della nota
        noteDuration = wholenote / duration;

        // Gestione della nota puntata
        if (dotted) {
            noteDuration = noteDuration * 3 / 2;
        }

        // Suono della nota
        if (note == 'p') {
            // Pausa
            noTone(buzzerPin);
        } else {
            // Calcolo della frequenza
            int frequency = getNoteFrequency(note, octave, sharp_flat);
            if (frequency > 0) {
                tone(buzzerPin, frequency);
            }
        }
        
        isNoteOn = true;
        noteStartTime = millis();
        
        // Salta eventuali separatori
        while (*currentPosition == ',' || *currentPosition == ' ' || *currentPosition == '\t')
            currentPosition++;
    }

public:
    // Costruttore
    NonBlockingBuzzer(int pin) : buzzerPin(pin), isPlaying(false), previousMillis(0) {
        pinMode(buzzerPin, OUTPUT);
    }
    
    // Avvia la riproduzione di una melodia
    void startPlay(const char* melody) {
        if (melody == nullptr || strlen(melody) == 0) return;
        
        currentMelody = melody;
        isPlaying = true;
        isNoteOn = false;
        previousMillis = millis();
        
        // Inizializza i parametri della melodia
        initMelody();
        
        // Inizia a suonare la prima nota
        playNextNote();
    }
    
    // Ferma la riproduzione
    void stop() {
        isPlaying = false;
        isNoteOn = false;
        noTone(buzzerPin);
    }
    
    // Verifica se una melodia è in riproduzione
    bool isPlayingMelody() {
        return isPlaying;
    }
    
    // Aggiorna lo stato del buzzer (da chiamare in loop)
    void update() {
        unsigned long currentMillis = millis();
        
        if (isPlaying && isNoteOn) {
            // Controlla se è il momento di terminare la nota attuale (90% della durata)
            if (currentMillis - noteStartTime >= noteDuration * 0.9) {
                noTone(buzzerPin);
                isNoteOn = false;
            }
        }
        
        // Controlla se è il momento di passare alla nota successiva
        if (isPlaying && !isNoteOn && currentMillis - noteStartTime >= noteDuration) {
            playNextNote();
        }
    }
};

// Classe per gestire il LED lampeggiante
class BlinkingLed {
private:
    int ledPin;
    unsigned long previousMillis;
    unsigned long interval;
    bool ledState;

public:
    BlinkingLed(int pin, unsigned long blinkInterval = 500) : 
        ledPin(pin), interval(blinkInterval), ledState(LOW), previousMillis(0) {
        pinMode(ledPin, OUTPUT);
    }
    
    void setInterval(unsigned long blinkInterval) {
        interval = blinkInterval;
    }
    
    void update() {
        unsigned long currentMillis = millis();
        
        if (currentMillis - previousMillis >= interval) {
            previousMillis = currentMillis;
            
            // Cambia lo stato del LED
            ledState = !ledState;
            digitalWrite(ledPin, ledState);
        }
    }
};

// Definizione delle melodie
const char *mTetris = "Tetris:d=4,o=5,b=160:e6,8b,8c6,8d6,16e6,16d6,8c6,8b,a,8a,8c6,e6,8d6,8c6,b,8b,8c6,d6,e6,c6,a,2a,8p,d6,8f6,a6,8g6,8f6,e6,8e6,8c6,e6,8d6,8c6,b,8b,8c6,d6,e6,c6,a,a";
const char* mMission = "Mission Impossible:d=16,o=6,b=95:32d,32d#,32d,32d#,32d,32d#,32d,32d#,32d,32d,32d#,32e,32f,32f#,32g,g,8p,g,8p,a#,p,c7,p,g,8p,g,8p,f,p,f#,p,g,8p,g,8p,a#,p,c7,p,g,8p,g,8p,f,p,f#,p,a#,g,2d,32p,a#,g,2c#,32p,a#,g,2c,a#5,8c,2p,32p,a#5,g5,2f#,32p,a#5,g5,2f,32";
const char* mSuperMario = "Super Mario:d=4,o=5,b=100:16e6,16e6,32p,8e6,16c6,8e6,8g6,8p,8g,8p,8c6,16p,8g,16p,8e,16p,8a,8b,16a#,8a,16g.,16e6,16g6,8a6,16f6,8g6,8e6,16c6,16d6,8b,16p,8c6,16p,8g,16p,8e,16p,8a,8b,16a#,8a,16g.,16e6,16g6,8a6,16f6,8g6,8e6,16c6,16d6,8b";

// Creazione degli oggetti
NonBlockingBuzzer buzzer(buzzerPin);
BlinkingLed led(ledPin, 250); // LED lampeggia ogni 250ms

// Stato del programma
enum State {
  PLAY_TETRIS,
  PAUSE1,
  PLAY_MISSION,
  PAUSE2,
  PLAY_MARIO,
  FINISHED
};

State currentState = PLAY_TETRIS;
unsigned long stateStartTime;

void setup()
{
    // Inizializzazione della comunicazione seriale per debug
    Serial.begin(9600);
    Serial.println("RTTTL non-blocking music player with blinking LED");
    
    stateStartTime = millis();
    buzzer.startPlay(mTetris);
}

void loop() {
    // Aggiorna lo stato del buzzer (controllo non bloccante)
    buzzer.update();
    
    // Aggiorna lo stato del LED (lampeggiamento)
    led.update();
    
    // Gestione della sequenza di riproduzione
    unsigned long currentMillis = millis();
    
    // Macchina a stati per riprodurre le melodie in sequenza
    switch (currentState) {
        case PLAY_TETRIS:
            if (!buzzer.isPlayingMelody()) {
                currentState = PAUSE1;
                stateStartTime = currentMillis;
            }
            break;
            
        case PAUSE1:
            if (currentMillis - stateStartTime >= 1000) {
                currentState = PLAY_MISSION;
                buzzer.startPlay(mMission);
            }
            break;
            
        case PLAY_MISSION:
            if (!buzzer.isPlayingMelody()) {
                currentState = PAUSE2;
                stateStartTime = currentMillis;
            }
            break;
            
        case PAUSE2:
            if (currentMillis - stateStartTime >= 1000) {
                currentState = PLAY_MARIO;
                buzzer.startPlay(mSuperMario);
            }
            break;
            
        case PLAY_MARIO:
            if (!buzzer.isPlayingMelody()) {
                currentState = FINISHED;
                Serial.println("Tutte le melodie sono state riprodotte");
            }
            break;
            
        default:
            break;
    }
}