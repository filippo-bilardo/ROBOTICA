# Pipeline di Dati

Le pipeline di dati sono un'applicazione pratica della composizione di funzioni che consente di elaborare dati attraverso una serie di trasformazioni consecutive. Le pipeline rendono il flusso di dati esplicito, facilitando la comprensione di come i dati vengono trasformati passo dopo passo all'interno di un'applicazione.

## Cos'è una Pipeline di Dati

Una pipeline di dati è un insieme di funzioni organizzate in modo che l'output di una funzione diventi l'input della successiva. Visivamente, possiamo rappresentarla così:

```
datiIniziali → funzione1 → risultatoIntermedio1 → funzione2 → risultatoIntermedio2 → ... → risultatoFinale
```

In JavaScript, possiamo implementare questo concetto utilizzando la composizione di funzioni, in particolare con la funzione `pipe` che abbiamo visto nel capitolo precedente.

## Creazione di Pipeline di Base

Ricordiamo la nostra funzione `pipe`:

```javascript
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);
```

Possiamo utilizzarla per creare pipeline di trasformazione dei dati:

```javascript
const numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Funzioni di trasformazione
const filtraPari = numeri => numeri.filter(n => n % 2 === 0);
const moltiplicaPerTre = numeri => numeri.map(n => n * 3);
const somma = numeri => numeri.reduce((acc, n) => acc + n, 0);

// Creazione della pipeline
const pipelineDiElaborazione = pipe(
  filtraPari,
  moltiplicaPerTre,
  somma
);

// Esecuzione della pipeline
const risultato = pipelineDiElaborazione(numeri);
console.log(risultato); // Output: 90 (2+4+6+8+10 -> 6+12+18+24+30 -> 90)
```

## Pipeline con Context o Stato

A volte abbiamo bisogno di trasportare un contesto o uno stato attraverso la pipeline. Possiamo farlo utilizzando oggetti che contengono sia i dati che il contesto:

```javascript
// Pipeline con contesto
const aggiungiContesto = dati => ({ dati, contesto: { conteggio: dati.length } });
const elaboraPari = stato => ({
  ...stato,
  dati: stato.dati.filter(n => n % 2 === 0),
  contesto: { 
    ...stato.contesto, 
    pariTrovati: stato.dati.filter(n => n % 2 === 0).length 
  }
});
const applicaSconto = stato => ({
  ...stato,
  dati: stato.dati.map(n => n * 0.9), // Sconto del 10%
  contesto: { 
    ...stato.contesto, 
    scontoApplicato: true 
  }
});

const pipelineConContesto = pipe(
  aggiungiContesto,
  elaboraPari,
  applicaSconto
);

const prezzi = [100, 155, 200, 250, 300];
console.log(pipelineConContesto(prezzi));
/* Output: 
{
  dati: [90, 180, 270],
  contesto: {
    conteggio: 5,
    pariTrovati: 3,
    scontoApplicato: true
  }
}
*/
```

## Pipeline Condizionali

Possiamo creare pipeline che eseguono diversi percorsi in base a condizioni:

```javascript
// Funzione di supporto per pipeline condizionali
const ifThen = (predicato, fnThen, fnElse = x => x) => dati =>
  predicato(dati) ? fnThen(dati) : fnElse(dati);

// Utilizzo della pipeline condizionale
const sonoTuttiPari = numeri => numeri.every(n => n % 2 === 0);
const raddoppia = numeri => numeri.map(n => n * 2);
const incrementa = numeri => numeri.map(n => n + 1);

const pipelineCondizionale = pipe(
  ifThen(
    sonoTuttiPari, 
    raddoppia, 
    incrementa
  ),
  somma
);

console.log(pipelineCondizionale([2, 4, 6, 8])); // Output: 40 (tutti pari, quindi raddoppia: [4,8,12,16] -> somma: 40)
console.log(pipelineCondizionale([1, 2, 3, 4])); // Output: 14 (non tutti pari, quindi incrementa: [2,3,4,5] -> somma: 14)
```

## Pipeline Asincrone

Le pipeline possono essere estese per gestire operazioni asincrone utilizzando Promise:

```javascript
// Pipeline asincrona
const pipeAsync = (...fns) => x => 
  fns.reduce(
    (promise, fn) => promise.then(fn), 
    Promise.resolve(x)
  );

// Esempio di operazioni asincrone
const fetchDati = async () => {
  // Simulazione di una richiesta API
  return new Promise(resolve => 
    setTimeout(() => resolve([1, 2, 3, 4, 5]), 1000)
  );
};

const filtraMaggioriDiDueAsync = async numeri => {
  // Simulazione di un'operazione asincrona
  return new Promise(resolve => 
    setTimeout(() => resolve(numeri.filter(n => n > 2)), 500)
  );
};

const quadratoAsync = async numeri => {
  // Simulazione di un'operazione asincrona
  return new Promise(resolve => 
    setTimeout(() => resolve(numeri.map(n => n * n)), 500)
  );
};

// Creazione della pipeline asincrona
const pipelineAsincrona = pipeAsync(
  fetchDati,
  filtraMaggioriDiDueAsync,
  quadratoAsync,
  risultato => ({ risultato, timestamp: Date.now() })
);

// Esecuzione della pipeline asincrona
pipelineAsincrona().then(console.log);
// Output dopo circa 2 secondi: { risultato: [9, 16, 25], timestamp: ... }
```

## Pipeline di Trasformazione Dati

Un caso d'uso comune è la trasformazione di dati da un formato all'altro, come in ETL (Extract, Transform, Load) o nell'elaborazione di dati in frontend:

```javascript
// Pipeline di trasformazione dati
const datiGrezzi = [
  { id: 1, nome: 'Mario Rossi', eta: '32', attivo: 'true' },
  { id: 2, nome: 'Luigi Verdi', eta: '28', attivo: 'false' },
  { id: 3, nome: 'Anna Bianchi', eta: '45', attivo: 'true' }
];

const pulisciTipi = utenti => 
  utenti.map(utente => ({
    ...utente,
    eta: parseInt(utente.eta, 10),
    attivo: utente.attivo === 'true'
  }));

const filtraUtentiAttivi = utenti => 
  utenti.filter(utente => utente.attivo);

const formattaNomiUtenti = utenti => 
  utenti.map(utente => {
    const [nome, cognome] = utente.nome.split(' ');
    return {
      ...utente,
      nome,
      cognome,
      nomeCompleto: utente.nome
    };
  });

const aggiungiDataElaborazione = utenti => ({
  utenti,
  metadata: {
    elaboratoIl: new Date().toISOString(),
    conteggio: utenti.length
  }
});

// Creazione e esecuzione della pipeline
const pipelineElaborazioneUtenti = pipe(
  pulisciTipi,
  filtraUtentiAttivi,
  formattaNomiUtenti,
  aggiungiDataElaborazione
);

console.log(pipelineElaborazioneUtenti(datiGrezzi));
/* Output simile a:
{
  utenti: [
    { 
      id: 1, 
      nome: 'Mario', 
      cognome: 'Rossi', 
      nomeCompleto: 'Mario Rossi', 
      eta: 32, 
      attivo: true 
    },
    { 
      id: 3, 
      nome: 'Anna', 
      cognome: 'Bianchi', 
      nomeCompleto: 'Anna Bianchi', 
      eta: 45, 
      attivo: true 
    }
  ],
  metadata: {
    elaboratoIl: '2023-08-31T12:34:56.789Z',
    conteggio: 2
  }
}
*/
```

## Pipeline con Ramificazioni (Fork-Join)

A volte abbiamo bisogno di eseguire più trasformazioni parallele e poi combinare i risultati:

```javascript
// Funzione di supporto per ramificazioni
const fork = (joinFn, ...fns) => x => 
  joinFn(...fns.map(fn => fn(x)));

// Esempio di utilizzo
const sommaPari = numeri => 
  numeri.filter(n => n % 2 === 0).reduce((acc, n) => acc + n, 0);

const sommaDispari = numeri => 
  numeri.filter(n => n % 2 !== 0).reduce((acc, n) => acc + n, 0);

const calcolaDifferenza = (sommaPari, sommaDispari) => 
  Math.abs(sommaPari - sommaDispari);

const pipelineRamificata = fork(calcolaDifferenza, sommaPari, sommaDispari);

console.log(pipelineRamificata([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])); // Output: 5 (2+4+6+8+10=30, 1+3+5+7+9=25, |30-25|=5)
```

## Vantaggi delle Pipeline di Dati

1. **Leggibilità**: Il flusso di dati è esplicito e facile da seguire.
2. **Manutenibilità**: È facile aggiungere, rimuovere o modificare passaggi nella pipeline.
3. **Testabilità**: Ogni passo della pipeline può essere testato in isolamento.
4. **Riusabilità**: I singoli passaggi possono essere riutilizzati in diverse pipeline.
5. **Componibilità**: Le pipeline possono essere composte per creare flussi di dati più complessi.

## Considerazioni sulle Performance

Anche se le pipeline di dati sono eleganti e manutenibili, possono introdurre overhead se non progettate correttamente. In particolare:

1. **Creazione di array intermedi**: Ogni chiamata a `map` o `filter` crea un nuovo array.
2. **Multiple iterazioni**: Ogni funzione nella pipeline esegue una nuova iterazione sui dati.

Per set di dati grandi, potrebbe essere più efficiente utilizzare approcci come la lazy evaluation (che esploreremo in un modulo futuro) o tecniche come `transduce` che combinano più operazioni in una singola passata.

## Conclusione

Le pipeline di dati sono un potente strumento nella programmazione funzionale che permettono di creare flussi di trasformazione dati chiari e manutenibili. Combinando pipeline con currying, applicazione parziale e composizione di funzioni, possiamo creare sistemi altamente modulari e riutilizzabili.

Nel prossimo capitolo, esploreremo pattern funzionali avanzati che possono essere utilizzati insieme alle pipeline per risolvere problemi più complessi.
