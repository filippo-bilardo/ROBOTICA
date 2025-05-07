// 01_HelloWorld.js
// Un semplice programma "Hello World" per EV3
// Questo esempio mostra come visualizzare testo sul display e riprodurre suoni

// Visualizza il testo sul display del brick EV3
brick.showString("Hello World!", 1);
brick.showString("Il mio primo", 2);
brick.showString("programma JavaScript", 3);

// Riproduce un suono di saluto
music.playSoundEffect(SoundEffect.Hello);

// Attende 3 secondi
pause(3000);

// Pulisce lo schermo
brick.clearScreen();

// Visualizza un altro messaggio
brick.showString("JavaScript con", 1);
brick.showString("LEGO EV3", 2);
brick.showString("è divertente!", 3);

// Riproduce un altro suono
music.playSoundEffect(SoundEffect.EnergyUp);