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
 * https://github.com/filippo-bilardo/ROBOTICA/tree/main/Buzzer
 * 
 * @author Fippo Bilardo
 * @version 1.0  20/03/25 - Versione iniziale
 */
// Definizione della classe Buzzer
class Buzzer
{
private:
    int buzzerPin; // Pin del buzzer

    // Funzione per calcolare la frequenza di una nota MIDI
    // Esempi di note MIDI: 60 (C4), 69 (A4), 81 (A5), 108 (C8)
    int getNoteFrequencyMIDI(int note)
    {
        // Frequenza di una nota MIDI
        return 440 * pow(2, (note - 69) / 12);
    }

    /**
     * @brief Funzione per calcolare la frequenza di una nota 
     * comprese i diesis e i bemolli
     * 
     * @param note la nota (C, D, E, F, G, A, B) //case insensitive
     * @param octave l'ottava (da 0 a 8)
     * @param sharp_flat 1 per diesis, -1 per bemolle, 0 per naturale
     * @return int la frequenza della nota
     */
    int getNoteFrequency(char note, int octave, int sharp_flat)
    {
        // Frequenze base delle note nell'ottava 4 (A4 = 440Hz)
        const int notes[] = {0, 262, 277, 294, 311, 330, 349, 370, 392, 415, 440, 466, 494};
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
        int frequency = notes[index] * (1 << (octave - 4));
        return frequency;
    }
public:
    // Costruttore
    Buzzer(int pin) : buzzerPin(pin) {}

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
            if (isdigit(*p))
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
            
            if (isalpha(*p))
            {
                note = tolower(*p);
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
const char *mTetris = "tetris:d=4,o=5,b=160:e6,8b,8c6,8d6,16e6,16d6,8c6,8b,a,8a,8c6,e6,8d6,8c6,b,8b,8c6,d6,e6,c6,a,2a,8p,d6,8f6,a6,8g6,8f6,e6,8e6,8c6,e6,8d6,8c6,b,8b,8c6,d6,e6,c6,a,a";
//const char *mArkanoid = "Arkanoid:d=4,o=5,b=140:8g6,16p,16g.6,2a#6,32p,8a6,8g6,8f6,8a6,2g6";
//const char *mMario = "Mario:d=4,o=6,b=180:e6,8e6,8e6,8c6,8e6,g6,8g5,c6,8g5,e5,a5,b5,a5,8g5,e6,g6,a6,f6,g6,e6,c6,d6,b5";
//const char *mUnderworld = "Underworld:d=4,o=5,b=140:8c,16c,16g#,16g,16f,16e,16d#,16d,16c,16g#,16g,16f,16e,16d#,16d,16c,16g#,16g,16g#,16g,16a#,16a,16g#,16f,16d#,16d,16d#,16d,16e,16d#,16g#,16g,16g#,16g,16a#,16a,16g#,16f,16d#,16d,16d#,16d,16c";
//const char *nH="HauntHouse:d=4,o=5,b=108:2a4,2e,2d#,2b4,2a4,2c,2d,2a#4,2e.,e,1f4,1a4,1d#,2e.,d,2c.,b4,1a4,1p,2a4,2e,2d#,2b4,2a4,2c,2d,2a#4,2e.,e,1f4,1a4,1d#,2e.,d,2c.,b4,1a4";
const char* starWars = "StarWars:d=4,o=5,b=120:8f,8f,8f,2a#.,2f.6,8d#6,8d6,8c6,2a#.6,f.6,8d#6,8d6,8c6,2a#.6,f.6,8d#6,8d6,8d#6,2c6";
const char* rtttl_jingle = "JingleBell:d=8,o=5,b=112:32p,a,a,a,a,a,a,a,c6,f.,g.,a,p,a#,a#,a#,a#,a#,a#,a#,d6,a#.,a.,2g";
const char* rtttl_bond = "Bond:d=4,o=5,b=80:32p,16c#6,32d#6,32d#6,16d#6,8d#6,16c#6,16c#6,16c#6,16c#6,32e6,32e6,16e6,8e6,16d#6,16d#6,16d#6,16c#6,32d#6,32d#6,16d#6,8d#6,16c#6,16c#6,16c#6,16c#6,32e6,32e6,16e6,8e6,16d#6,16d6,16c#6,16c#7,c.7,16g#6,16f#6,g#.6";
const char* rtttl_mission = "MissionImp:d=16,o=6,b=95:32d,32d#,32d,32d#,32d,32d#,32d,32d#,32d,32d,32d#,32e,32f,32f#,32g,g,8p,g,8p,a#,p,c7,p,g,8p,g,8p,f,p,f#,p,g,8p,g,8p,a#,p,c7,p,g,8p,g,8p,f,p,f#,p,a#,g,2d,32p,a#,g,2c#,32p,a#,g,2c,a#5,8c,2p,32p,a#5,g5,2f#,32p,a#5,g5,2f,32";
const char* rtttl_godfather = "Godfather:d=8,o=5,b=80:g,c6,b,a,2c,a,c6,a,c6,2g6,g,c6,b,a,2c,a,4c6,2a,4e.6,2e6,e6,d6,c6,2b,a,c6,a,c6,2g6,g,c6,b,a,2c,a,4c6,2a";

// Definizione del pin del buzzer
const int buzzerPin = 8;

// Creazione dell'oggetto Buzzer
Buzzer buzzer(buzzerPin);

void setup()
{
    // Inizializzazione del pin del buzzer come output
    pinMode(buzzerPin, OUTPUT);
    // Inizializzazione della comunicazione seriale per debug
    Serial.begin(9600);
    Serial.println("Buzzer inizializzato");

    buzzer.play(mUnderworld); delay(1000);
    buzzer.play(mArkanoid); delay(1000);
}

void loop() {}