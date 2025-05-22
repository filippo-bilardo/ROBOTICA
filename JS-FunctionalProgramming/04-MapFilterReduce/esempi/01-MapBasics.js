/**
 * Utilizzo Base di Map
 * 
 * La funzione map() crea un nuovo array con i risultati della chiamata 
 * di una funzione fornita su ogni elemento dell'array.
 */

// Esempio 1: Trasformazione di numeri
const numeri = [1, 2, 3, 4, 5];

// Raddoppia ogni numero nell'array
const doppi = numeri.map(numero => numero * 2);
console.log('Numeri originali:', numeri);
console.log('Numeri raddoppiati:', doppi);

// Calcola il quadrato di ogni numero
const quadrati = numeri.map(numero => numero * numero);
console.log('Quadrati dei numeri:', quadrati);

// Esempio 2: Trasformazione di stringhe
const parole = ['javascript', 'programmazione', 'funzionale'];
const maiuscole = parole.map(parola => parola.toUpperCase());
console.log('Parole in maiuscolo:', maiuscole);

const lunghezze = parole.map(parola => parola.length);
console.log('Lunghezza delle parole:', lunghezze);

// Esempio 3: Utilizzo dell'indice nell'array
const conIndice = numeri.map((numero, indice) => {
  return `Elemento all'indice ${indice} ha valore ${numero}`;
});
console.log('Con indice:', conIndice);

// Esempio 4: Trasformazione di array di oggetti
const studenti = [
  { nome: 'Alice', voto: 85 },
  { nome: 'Bob', voto: 72 },
  { nome: 'Carol', voto: 90 },
  { nome: 'Dave', voto: 65 }
];

// Estrai solo i nomi degli studenti
const nomiStudenti = studenti.map(studente => studente.nome);
console.log('Nomi degli studenti:', nomiStudenti);

// Calcola se lo studente è promosso (voto >= 70)
const risultati = studenti.map(studente => {
  return {
    nome: studente.nome,
    voto: studente.voto,
    promosso: studente.voto >= 70
  };
});
console.log('Risultati degli studenti:', risultati);

// Esempio 5: Trasformazione di JSON
const jsonString = '{"utenti":[{"id":1,"nome":"Alice"},{"id":2,"nome":"Bob"}]}';
const dati = JSON.parse(jsonString);

const utentiFormattati = dati.utenti.map(utente => {
  return `Utente #${utente.id}: ${utente.nome}`;
});
console.log('Utenti formattati:', utentiFormattati);

// Esempio 6: Manipolazione di elementi DOM (in ambiente browser)
// Questo esempio funzionerebbe in un browser, qui solo per scopo dimostrativo
/*
const elementi = document.querySelectorAll('p');
const testiParagrafi = Array.from(elementi).map(elemento => elemento.textContent);
console.log('Testi dai paragrafi:', testiParagrafi);
*/

// Esempio 7: Implementazione manuale di map
Array.prototype.mapPersonalizzato = function(callback) {
  const risultato = [];
  for (let i = 0; i < this.length; i++) {
    risultato.push(callback(this[i], i, this));
  }
  return risultato;
};

const cubiConMap = numeri.mapPersonalizzato(n => n * n * n);
console.log('Cubi con implementazione personalizzata:', cubiConMap);
