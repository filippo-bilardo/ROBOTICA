# Introduzione alla Ricorsione

La ricorsione è un concetto fondamentale nella programmazione funzionale che consiste in una funzione che richiama se stessa per risolvere un problema. Questo approccio permette di affrontare problemi complessi scomponendoli in casi più semplici e ripetendo lo stesso processo fino a raggiungere un caso base.

## Cos'è la Ricorsione

In termini semplici, la ricorsione avviene quando una funzione si chiama direttamente (ricorsione diretta) o indirettamente attraverso altre funzioni (ricorsione indiretta). Ogni chiamata ricorsiva dovrebbe lavorare su un problema più piccolo, avvicinandosi a un caso base che interromperà la ricorsione.

## Componenti di una Soluzione Ricorsiva

Una funzione ricorsiva ben progettata include sempre:

1. **Caso base**: la condizione che termina la ricorsione
2. **Chiamata ricorsiva**: dove la funzione richiama se stessa
3. **Progresso verso il caso base**: ogni chiamata ricorsiva deve avvicinarsi al caso base

## Esempio Base: Fattoriale

Il calcolo del fattoriale è un esempio classico di ricorsione:

```javascript
function factorial(n) {
  // Caso base
  if (n <= 1) {
    return 1;
  }
  
  // Chiamata ricorsiva
  return n * factorial(n - 1);
}

console.log(factorial(5)); // 120
```

In questo esempio:
- Il caso base è `n <= 1`
- La chiamata ricorsiva è `factorial(n - 1)`
- Il progresso verso il caso base è la riduzione di `n` a ogni chiamata

## Il Flusso di Esecuzione Ricorsiva

Per comprendere meglio come funziona la ricorsione, seguiamo il flusso di esecuzione per `factorial(3)`:

1. `factorial(3)` verifica se `n <= 1`. Poiché 3 > 1, continua.
2. Calcola `3 * factorial(2)` ma deve prima valutare `factorial(2)`.
3. `factorial(2)` verifica se `n <= 1`. Poiché 2 > 1, continua.
4. Calcola `2 * factorial(1)` ma deve prima valutare `factorial(1)`.
5. `factorial(1)` verifica se `n <= 1`. Poiché 1 = 1 (caso base), restituisce 1.
6. Ora `factorial(2)` può completare il calcolo: `2 * 1 = 2` e restituisce 2.
7. Infine, `factorial(3)` completa: `3 * 2 = 6` e restituisce 6.

## Ricorsione e Stack di Chiamate

Ogni chiamata a una funzione in JavaScript viene inserita nello stack di chiamate (call stack). Con la ricorsione, ogni chiamata ricorsiva aggiunge un nuovo frame allo stack. Se le chiamate ricorsive sono troppe, si può verificare un "stack overflow" - l'errore che si ottiene quando lo stack di chiamate supera la sua dimensione massima.

```javascript
function recursionDepthTest(n) {
  if (n <= 0) {
    return "Completato";
  }
  console.log(`Profondità della ricorsione: ${n}`);
  return recursionDepthTest(n - 1);
}

// Questo funzionerà
console.log(recursionDepthTest(10));

// Questo probabilmente causerà un errore di stack overflow
// console.log(recursionDepthTest(100000));
```

## Vantaggi della Ricorsione

La ricorsione offre diversi vantaggi:

1. **Eleganza e chiarezza**: Le soluzioni ricorsive spesso riflettono la struttura ricorsiva del problema
2. **Naturalezza**: Alcuni problemi sono intrinsecamente ricorsivi (come attraversare strutture dati annidate)
3. **Purezza funzionale**: Favorisce l'uso di funzioni pure senza stato mutabile
4. **Espressività**: Può esprimere algoritmi complessi in modo conciso

## Sfide della Ricorsione

La ricorsione presenta anche alcune sfide:

1. **Inefficienza potenziale**: Può comportare calcoli ripetuti se non ottimizzata
2. **Limiti dello stack**: Rischio di stack overflow per ricorsioni profonde
3. **Difficoltà di debug**: Il debugging di funzioni ricorsive può essere complesso
4. **Comprensione**: Può risultare controintuitiva per chi è abituato a pensare iterativamente

## Navigazione del Corso
- [📑 Indice](/home/git-projects/ROBOTICA/JS-FunctionalProgramming/README.md)
- [⬅️ Modulo 5: Currying e Composizione](/home/git-projects/ROBOTICA/JS-FunctionalProgramming/05-CurryingComposizione/README.md)
- [➡️ Pattern Ricorsivi Comuni](/home/git-projects/ROBOTICA/JS-FunctionalProgramming/06-Ricorsione/teoria/02-PatternRicorsiviComuni.md)
