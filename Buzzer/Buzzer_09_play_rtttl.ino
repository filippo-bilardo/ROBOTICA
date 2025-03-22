/**
 * \Buzzer_09_play_rtttl
 *
 * Questo sketch suona melodie in formato RTTTL (Ring Tone Text Transfer Language)
 * utilizzando un buzzer passivo. Le melodie sono memorizzate come stringhe
 * e vengono riprodotte utilizzando la funzione tone().
 * 
 * La funzione play() analizza la stringa RTTTL e suona le note corrispondenti.
 * 
 * La stringa RTTTL ha il seguente formato:
 * <title>:<defaults>:<note>,<note>,<note>,...
 * Dove:
 * - <title> è il titolo della melodia
 * - <defaults> sono i parametri predefiniti (durata, ottava, bpm)
 * - <note> sono le note da suonare: <note>[#|b][<octave>][.<duration>] 
 *
 * https://wokwi.com/projects/425889424760583169
 * https://github.com/filippo-bilardo/ROBOTICA/blob/main/Buzzer/README.md
 * 
 * @author Fippo Bilardo
 * @version 1.0  20/03/25 - Versione iniziale
 */
// Definizione della classe Buzzer
class Buzzer
{
private:
    int buzzerPin; // Pin del buzzer

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
        // Utilizziamo l'operatore bit shift per calcolare potenze di 2 (più efficiente)
        // se octave = 0 la frequenza è 0
        // se octave = 1 la frequenza è notes[index] * 2^(-3) = notes[index] / 8
        // se octave = 2 la frequenza è notes[index] * 2^(-2) = notes[index] / 4
        // se octave = 3 la frequenza è notes[index] * 2^(-1) = notes[index] / 2
        // se octave = 4 la frequenza è notes[index] * 2^(0) = notes[index]
        // se octave = 5 la frequenza è notes[index] * 2^(1) = notes[index] * 2
        // se octave = 6 la frequenza è notes[index] * 2^(2) = notes[index] * 4
        // se octave = 7 la frequenza è notes[index] * 2^(3) = notes[index] * 8
        // se octave = 8 la frequenza è notes[index] * 2^(4) = notes[index] * 16
        int frequency = notes[index] * (1 << (octave - 4));
        return frequency;
    }
public:
    // Costruttore
    Buzzer(int pin) : buzzerPin(pin) {
        pinMode(buzzerPin, OUTPUT);
    }

    // Funzione per suonare una melodia
    void play(const char *melody)
    {
        // Verifica che la stringa non sia vuota
        if (melody == nullptr || strlen(melody) == 0) return;

        // Parsing della stringa RTTTL
        int defaultDuration = 4; // Durata predefinita (4 = quarto)
        int defaultOctave = 5;   // Ottava predefinita
        int bpm = 120;           // Battiti al minuto

        // Estrazione del titolo e stampa
        const char *p = strchr(melody, ':'); 
        if (p == nullptr) return; // Formato non valido
        //*p = '\0'; Serial.print("Playing: "); Serial.println(melody); *p = ':';
        Serial.print("In riproduzione: ");
        for (int j = 0; j < p - melody; j++) {Serial.print(melody[j]);}
        Serial.println();

        // Estrazione dei parametri dalla stringa RTTTL
        p++; // Salta il carattere ':'
        while (*p != '\0' && *p != ':') 
        {
            if (strncmp(p, "d=", 2) == 0)
            {
                p += 2; // Salta il prefisso "d="
                defaultDuration = atoi(p); 
                while (isdigit(*p)) p++;
            }
            else if (strncmp(p, "o=", 2) == 0)
            {
                p += 2; // Salta il prefisso "o="
                defaultOctave = atoi(p);
                while (isdigit(*p)) p++;
            }
            else if (strncmp(p, "b=", 2) == 0)
            {
                p += 2; // Salta il prefisso "b="
                bpm = atoi(p); //atoi converte una stringa in un intero, p punta alla stringa
                while (isdigit(*p)) p++;
            }

            // Salta eventuali separatori
            if (*p == ',' || *p == ' ')
                p++;
        }

        if (*p == '\0')
            return; // Formato non valido

        p++;        // Salta il carattere ':'

        // Calcolo del tempo di una nota
        int wholenote = (60 * 1000L / bpm) * 4; // Tempo di una nota intera in millisecondi

        // Ciclo per suonare ogni nota
        while (*p)
        {
            // Estrazione della durata
            int duration = defaultDuration;
            if (isdigit(*p)) // Se è un numero //(*p >= '0' && *p <= '9')
            {
                duration = 0;
                while (isdigit(*p))
                {
                    duration = duration * 10 + (*p - '0');
                    p++;
                }
            }

            // Gestione della nota puntata (aumenta durata del 50%)
            bool dotted = false;
            if (*p == '.')
            {
                dotted = true;
                p++;
            }

            // Estrazione della nota e dell'ottava
            char note = '\0';
            int octave = defaultOctave;
            int sharp_flat = 0;
            
            if (isalpha(*p)) // Se è una lettera //(*p >= 'a' && *p <= 'z') || (*p >= 'A' && *p <= 'Z')
            {
                note = tolower(*p); // if (*p >= 'A' && *p <= 'Z') *p = *p + 32;
                p++;

                // Estrazione dell'eventuale diesis o bemolle
                if(*p == '#' || *p == 'b') {
                    sharp_flat = (*p == '#') ? 1 : -1;
                    p++;
                }

                // Estrazione dell'ottava
                if (isdigit(*p))
                {
                    octave = *p - '0';
                    p++;
                }
            }

            // Calcolo della durata della nota
            int noteDuration = wholenote / duration;

            // Gestione della nota puntata
            if (dotted)
            {
                noteDuration = noteDuration * 3 / 2;
            }

            // Gestione della pausa
            if (note == 'p')
            {
                delay(noteDuration);
            }
            else
            {
                // Calcolo della frequenza
                int frequency = getNoteFrequency(note, octave, sharp_flat);
                if (frequency > 0)
                {
                    // Suono della nota
                    tone(buzzerPin, frequency, noteDuration * 0.9);
                    // Attesa tra le note (90% della durata per separare le note)
                    delay(noteDuration);
                    noTone(buzzerPin);
                }
            }

            // Salta eventuali separatori
            while (*p == ',' || *p == ' ' || *p == '\t')
                p++;
        }
    }
};

// Definizione delle melodie
const char *mTetris = "Tetris:d=4,o=5,b=160:e6,8b,8c6,8d6,16e6,16d6,8c6,8b,a,8a,8c6,e6,8d6,8c6,b,8b,8c6,d6,e6,c6,a,2a,8p,d6,8f6,a6,8g6,8f6,e6,8e6,8c6,e6,8d6,8c6,b,8b,8c6,d6,e6,c6,a,a";
const char* mMission = "Mission Impossible:d=16,o=6,b=95:32d,32d#,32d,32d#,32d,32d#,32d,32d#,32d,32d,32d#,32e,32f,32f#,32g,g,8p,g,8p,a#,p,c7,p,g,8p,g,8p,f,p,f#,p,g,8p,g,8p,a#,p,c7,p,g,8p,g,8p,f,p,f#,p,a#,g,2d,32p,a#,g,2c#,32p,a#,g,2c,a#5,8c,2p,32p,a#5,g5,2f#,32p,a#5,g5,2f,32";
const char* mSuperMario = "Super Mario:d=4,o=5,b=100:16e6,16e6,32p,8e6,16c6,8e6,8g6,8p,8g,8p,8c6,16p,8g,16p,8e,16p,8a,8b,16a#,8a,16g.,16e6,16g6,8a6,16f6,8g6,8e6,16c6,16d6,8b,16p,8c6,16p,8g,16p,8e,16p,8a,8b,16a#,8a,16g.,16e6,16g6,8a6,16f6,8g6,8e6,16c6,16d6,8b";

// Definizione del pin del buzzer
const int buzzerPin = 8;

// Creazione dell'oggetto Buzzer
Buzzer buzzer(buzzerPin);

void setup()
{
    // Inizializzazione della comunicazione seriale per debug
    Serial.begin(9600);
    Serial.println("RTTTL music player...");

    buzzer.play(mTetris); delay(1000);
    buzzer.play(mMission); delay(1000);
    buzzer.play(mSuperMario); delay(1000);
}

void loop() {}