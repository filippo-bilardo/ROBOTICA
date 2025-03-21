//! Template project for Rust on ESP32-S3 (`no_std`) based on [`esp-hal`](https://github.com/esp-rs/esp-hal)
//!
//! Useful resources:
//! - [The Rust on ESP Book](https://docs.esp-rs.org/book/)
//! - [Embedded Rust (no_std) on Espressif](https://docs.esp-rs.org/no_std-training/)
//! - [Matrix channel](https://matrix.to/#/#esp-rs:matrix.org)
use std::collections::HashMap;
use std::error::Error;
use std::f32::consts::FRAC_1_12;
use std::thread;
use std::time::Duration;

use esp_idf_hal::delay::FreeRtos;
use esp_idf_hal::gpio::*;
use esp_idf_hal::ledc::*;
use esp_idf_hal::peripherals::Peripherals;
use esp_idf_hal::prelude::*;
use esp_idf_sys as _;

// Struttura per rappresentare una nota musicale
struct Note {
    note: String,
    octave: u8,
    duration_ms: u32,
}

fn main() -> Result<(), Box<dyn Error>> {
    // Necessario per ESP-IDF
    esp_idf_sys::link_patches();
    
    println!("RTTTL Player per ESP32-S3 (Wokwi)");
    println!("Collegare il buzzer al pin 4");
    println!("Avvio riproduzione...");
    
    // Ottenimento dei periferici ESP32-S3
    let peripherals = Peripherals::take().unwrap();
    let mut buzzer_pin = peripherals.pins.gpio4.into_output().unwrap();
    
    // Configurazione del timer LEDC per il PWM
    let config = config::TimerConfig::default()
        .frequency(50.Hz())
        .resolution(config::Resolution::Bits10);
    
    let timer = LedcTimerDriver::new(
        peripherals.ledc.timer0,
        &config,
    ).unwrap();
    
    let mut buzzer = LedcDriver::new(
        peripherals.ledc.channel0,
        &timer,
        buzzer_pin,
    ).unwrap();
    
    // Definizione delle melodie RTTTL
    let mario = "Super Mario:d=4,o=5,b=100:16e6,16e6,32p,8e6,16c6,8e6,8g6,8p,8g,8p,8c6,16p,8g,16p,8e,16p,8a,8b,16a#,8a,16g.,16e6,16g6,8a6,16f6,8g6,8e6,16c6,16d6,8b,16p,8c6,16p,8g,16p,8e,16p,8a,8b,16a#,8a,16g.,16e6,16g6,8a6,16f6,8g6,8e6,16c6,16d6,8b";
    let star_wars = "StarWars:d=4,o=5,b=120:8f,8f,8f,2a#.,2f.6,8d#6,8d6,8c6,2a#.6,f.6,8d#6,8d6,8c6,2a#.6,f.6,8d#6,8d6,8d#6,2c6";
    let tetris = "Tetris:d=4,o=5,b=160:e6,8b,8c6,8d6,16e6,16d6,8c6,8b,a,8a,8c6,e6,8d6,8c6,b,8b,8c6,d6,e6,c6,a,2a,8p,d6,8f6,a6,8g6,8f6,e6,8e6,8c6,e6,8d6,8c6,b,8b,8c6,d6,e6,c6,a,a";
    
    // Riproduci le melodie
    play_rtttl(mario, &mut buzzer)?;
    FreeRtos::delay_ms(1000);
    play_rtttl(star_wars, &mut buzzer)?;
    FreeRtos::delay_ms(1000);
    play_rtttl(tetris, &mut buzzer)?;
    
    Ok(())
}

// Riproduce una melodia RTTTL
fn play_rtttl(rtttl_string: &str, buzzer: &mut LedcDriver<'_>) -> Result<(), Box<dyn Error>> {
    let (name, notes) = parse_rtttl(rtttl_string)?;
    println!("Riproduzione di '{}'...", name);
    
    for note in notes {
        let frequency = get_frequency(&note.note, note.octave);
        play_tone(buzzer, frequency, note.duration_ms)?;
    }
    
    // Spegni il buzzer alla fine
    buzzer.set_duty(0)?;
    println!("Riproduzione completata");
    
    Ok(())
}

// Riproduce un tono alla frequenza specificata per la durata indicata
fn play_tone(buzzer: &mut LedcDriver<'_>, frequency: f32, duration_ms: u32) -> Result<(), Box<dyn Error>> {
    if frequency <= 0.0 {
        // Pausa - nessun suono
        buzzer.set_duty(0)?;
        FreeRtos::delay_ms(duration_ms);
    } else {
        // Imposta la frequenza e abilita l'output
        buzzer.set_frequency(frequency.Hz())?;
        buzzer.set_duty(512)?; // 50% duty cycle (10-bit resolution: 1024/2)
        FreeRtos::delay_ms((duration_ms as f32 * 0.9) as u32); // 90% della durata
        
        // Spegni il buzzer per il 10% rimanente
        buzzer.set_duty(0)?;
        FreeRtos::delay_ms((duration_ms as f32 * 0.1) as u32);
    }
    
    Ok(())
}

// Calcola la frequenza di una nota in base all'ottava
fn get_frequency(note: &str, octave: u8) -> f32 {
    if note == "p" {
        return 0.0; // Pausa
    }
    
    // Mappa delle note
    let mut note_map = HashMap::new();
    note_map.insert("c", 0);
    note_map.insert("c#", 1);
    note_map.insert("d", 2);
    note_map.insert("d#", 3);
    note_map.insert("e", 4);
    note_map.insert("f", 5);
    note_map.insert("f#", 6);
    note_map.insert("g", 7);
    note_map.insert("g#", 8);
    note_map.insert("a", 9);
    note_map.insert("a#", 10);
    note_map.insert("b", 11);
    note_map.insert("h", 11);
    
    // Nota di base C4 = 261.63 Hz
    let base_c4 = 261.63;
    let semitone_ratio = 2.0_f32.powf(FRAC_1_12);
    
    // Calcola la distanza in semitoni da C4
    let note_index = *note_map.get(note.to_lowercase().as_str()).unwrap_or(&0);
    let octave_diff = (octave as i8) - 4;
    let semitones_from_c4 = note_index + (octave_diff * 12);
    
    // Calcola la frequenza
    base_c4 * semitone_ratio.powi(semitones_from_c4)
}

// Analizza una stringa RTTTL e la converte in una sequenza di note
fn parse_rtttl(rtttl_string: &str) -> Result<(String, Vec<Note>), Box<dyn Error>> {
    let parts: Vec<&str> = rtttl_string.split(':').collect();
    if parts.len() != 3 {
        return Err("Formato RTTTL non valido!".into());
    }
    
    let name = parts[0].trim().to_string();
    let defaults: Vec<&str> = parts[1].trim().split(',').collect();
    let notes_str: Vec<&str> = parts[2].trim().split(',').collect();
    
    // Impostazioni predefinite
    let mut default_duration = 4;
    let mut default_octave = 6;
    let mut default_bpm = 63;
    
    // Analizza le impostazioni predefinite
    for setting in defaults {
        if !setting.contains('=') {
            continue;
        }
        
        let kv: Vec<&str> = setting.split('=').collect();
        let key = kv[0];
        let value = kv[1].parse::<u32>()?;
        
        match key {
            "d" => default_duration = value as u8,
            "o" => default_octave = value as u8,
            "b" => default_bpm = value as u16,
            _ => {}
        }
    }
    
    // Calcola il tempo di base per un quarto (in millisecondi)
    let quarter_note_duration = 60000 / default_bpm as u32;
    
    let mut parsed_notes = Vec::new();
    
    // Analizza ogni nota
    for note_str in notes_str {
        let note_str = note_str.trim();
        if note_str.is_empty() {
            continue;
        }
        
        // Analizza la durata
        let mut duration = default_duration;
        let mut i = 0;
        let mut duration_str = String::new();
        
        let note_chars: Vec<char> = note_str.chars().collect();
        
        while i < note_chars.len() && note_chars[i].is_digit(10) {
            duration_str.push(note_chars[i]);
            i += 1;
        }
        
        if !duration_str.is_empty() {
            duration = duration_str.parse::<u8>()?;
        }
        
        // Calcola la durata in millisecondi
        let mut duration_ms = quarter_note_duration * (4.0 / duration as f32) as u32;
        
        // Analizza la nota
        if i < note_chars.len() {
            let mut note = note_chars[i].to_string().to_lowercase();
            i += 1;
            
            // Diesis
            if i < note_chars.len() && note_chars[i] == '#' {
                note.push('#');
                i += 1;
            }
            
            // Ottava
            let mut octave = default_octave;
            if i < note_chars.len() && note_chars[i].is_digit(10) {
                octave = note_chars[i].to_digit(10).unwrap() as u8;
                i += 1;
            }
            
            // Nota puntata
            if i < note_chars.len() && note_chars[i] == '.' {
                duration_ms = (duration_ms as f32 * 1.5) as u32;
                i += 1;
            }
            
            // Aggiungi la nota parsata
            parsed_notes.push(Note {
                note,
                octave,
                duration_ms,
            });
        }
    }
    
    Ok((name, parsed_notes))
}