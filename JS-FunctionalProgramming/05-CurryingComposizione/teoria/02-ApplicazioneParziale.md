# Applicazione Parziale delle Funzioni

L'applicazione parziale è una tecnica che consiste nel fissare un certo numero di argomenti di una funzione, producendo un'altra funzione di arietà inferiore. A differenza del currying che trasforma una funzione in una sequenza di funzioni a singolo argomento, l'applicazione parziale "pre-compila" alcuni argomenti e restituisce una funzione che accetta i rimanenti.

## Cos'è l'Applicazione Parziale

L'applicazione parziale permette di trasformare:

```javascript
f(a, b, c)
```

in:

```javascript
g(b, c) // dove 'a' è stato prefissato
```

o

```javascript
h(a, c) // dove 'b' è stato prefissato
```

o qualsiasi altra combinazione di parametri prefissati.

## Esempi Base di Applicazione Parziale

Ecco un esempio semplice che illustra l'applicazione parziale:

```javascript
function moltiplica(a, b, c) {
  return a * b * c;
}

// Creiamo una funzione con il primo parametro fissato a 2
function moltiplicaPerDue(b, c) {
  return moltiplica(2, b, c);
}

console.log(moltiplicaPerDue(3, 4)); // Output: 24 (2 * 3 * 4)
```

Possiamo generalizzare questo approccio creando una funzione di utility per l'applicazione parziale:

```javascript
function applicaParzialmente(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

// Utilizzo
const moltiplicaPerDue = applicaParzialmente(moltiplica, 2);
console.log(moltiplicaPerDue(3, 4)); // Output: 24

// Possiamo anche prefissare più parametri
const moltiplicaPer6 = applicaParzialmente(moltiplica, 2, 3);
console.log(moltiplicaPer6(4)); // Output: 24
```

## Applicazione Parziale vs Binding

JavaScript offre il metodo `bind()` che può essere utilizzato per l'applicazione parziale:

```javascript
function saluta(saluto, nome) {
  return `${saluto}, ${nome}!`;
}

const salutaCiao = saluta.bind(null, 'Ciao');
console.log(salutaCiao('Marco')); // Output: "Ciao, Marco!"
```

La differenza principale è che `bind()` lega anche il valore di `this`, il che può essere importante quando si lavora con metodi di oggetti.

## Pattern Comuni di Applicazione Parziale

### 1. Data-last Style

Un pattern comune nella programmazione funzionale è mettere i dati su cui opera la funzione come ultimo parametro. Questo facilita l'applicazione parziale per creare funzioni specializzate:

```javascript
// Data-last style
function filtra(predicato, array) {
  return array.filter(predicato);
}

const filtraPari = applicaParzialmente(filtra, (n) => n % 2 === 0);

console.log(filtraPari([1, 2, 3, 4, 5, 6])); // Output: [2, 4, 6]
```

### 2. Configurazione di Funzioni

L'applicazione parziale è utile per creare funzioni con configurazioni specifiche:

```javascript
function formattaValuta(simbolo, decimali, valore) {
  return simbolo + valore.toFixed(decimali);
}

const formattaEuro = applicaParzialmente(formattaValuta, '€', 2);
const formattaDollaro = applicaParzialmente(formattaValuta, '$', 2);

console.log(formattaEuro(123.456)); // Output: "€123.46"
console.log(formattaDollaro(123.456)); // Output: "$123.46"
```

### 3. Event Handlers

L'applicazione parziale è particolarmente utile per creare gestori di eventi:

```javascript
function gestisciClick(id, evento) {
  console.log(`Click sull'elemento ${id}`);
  // Logica per gestire l'evento
}

// In un'applicazione web:
const bottone1 = document.getElementById('bottone1');
bottone1.addEventListener('click', gestisciClick.bind(null, 'bottone1'));
```

## Applicazione Parziale con più Argomenti in Posizioni Diverse

A volte abbiamo bisogno di applicare parzialmente argomenti in posizioni specifiche. Ecco un'implementazione più flessibile:

```javascript
function applicaParzialmenteAvanzato(fn, posizioni) {
  return function(...args) {
    const finalArgs = [];
    let contatorePosizioni = 0;
    let contatoreArgs = 0;
    
    // Riempie gli argomenti finali basandosi sulle posizioni specificate
    for (let i = 0; i < fn.length; i++) {
      if (posizioni.hasOwnProperty(i)) {
        finalArgs[i] = posizioni[i];
      } else {
        if (contatoreArgs < args.length) {
          finalArgs[i] = args[contatoreArgs++];
        }
      }
    }
    
    return fn.apply(this, finalArgs);
  };
}

// Utilizzo:
function dividi(a, b, c, d) {
  return (a + b) / (c + d);
}

// Fissiamo il primo e il terzo parametro (posizioni 0 e 2)
const divisioneSpecializzata = applicaParzialmenteAvanzato(dividi, {0: 10, 2: 5});
console.log(divisioneSpecializzata(5, 5)); // Output: 1.5 ((10 + 5) / (5 + 5))
```

## Vantaggi dell'Applicazione Parziale

1. **Specializzazione**: Crea facilmente varianti specializzate di funzioni generiche.
2. **Riutilizzabilità**: Riutilizza la logica esistente senza duplicare il codice.
3. **Leggibilità**: Rende il codice più descrittivo e auto-esplicativo.
4. **Modularità**: Facilita la creazione di componenti funzionali più piccoli e componibili.

## Applicazione Parziale vs Currying

Il currying e l'applicazione parziale sono complementari:

- **Currying**: Trasforma `f(a, b, c)` in `f(a)(b)(c)`.
- **Applicazione parziale**: Trasforma `f(a, b, c)` in `g(b, c)` prefissando `a`.

Il currying facilita l'applicazione parziale, ma offre maggiore flessibilità nell'ordine in cui vengono forniti gli argomenti.

## Conclusione

L'applicazione parziale è una tecnica potente nella programmazione funzionale che consente di creare funzioni specializzate a partire da funzioni più generiche. Usata correttamente, può portare a codice più modulare, riutilizzabile e manutenibile.

Nel prossimo capitolo, esploreremo la composizione di funzioni e come combinare funzioni semplici per crearne di più complesse.
