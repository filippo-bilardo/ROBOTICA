# Ricorsione e Strutture Dati

La ricorsione è particolarmente potente quando si lavora con strutture dati complesse o annidate. In questo documento, esploreremo come la ricorsione possa essere applicata efficacemente a diverse strutture dati in JavaScript e quali vantaggi offra rispetto agli approcci iterativi.

## Strutture Dati Ricorsive

Molte strutture dati sono intrinsecamente ricorsive nella loro definizione, nel senso che contengono istanze di se stesse. Alcune delle strutture dati più comuni che hanno natura ricorsiva sono:

- Alberi (binari, n-ari, ecc.)
- Grafi
- Liste concatenate
- Strutture JSON annidate
- DOM (Document Object Model)

## Alberi e Ricorsione

Gli alberi sono una delle strutture dati più naturalmente ricorsive, poiché ogni nodo può essere considerato la radice di un sottoalbero.

### Rappresentazione di un Albero in JavaScript

```javascript
class TreeNode {
  constructor(value) {
    this.value = value;
    this.children = [];  // Per un albero generico
    // Oppure per un albero binario:
    // this.left = null;
    // this.right = null;
  }
}
```

### Attraversamento di un Albero

#### Depth-First Search (DFS)

L'attraversamento in profondità (DFS) esplora un ramo fino in fondo prima di passare al successivo.

```javascript
function dfs(node, visit) {
  if (!node) return;
  
  // Visita il nodo corrente
  visit(node.value);
  
  // Visita ricorsivamente tutti i figli
  for (const child of node.children) {
    dfs(child, visit);
  }
}
```

Per un albero binario:

```javascript
function dfsPreOrder(node, visit) {
  if (!node) return;
  
  visit(node.value);       // Pre-order: Radice -> Sinistra -> Destra
  dfsPreOrder(node.left, visit);
  dfsPreOrder(node.right, visit);
}

function dfsInOrder(node, visit) {
  if (!node) return;
  
  dfsInOrder(node.left, visit);
  visit(node.value);       // In-order: Sinistra -> Radice -> Destra
  dfsInOrder(node.right, visit);
}

function dfsPostOrder(node, visit) {
  if (!node) return;
  
  dfsPostOrder(node.left, visit);
  dfsPostOrder(node.right, visit);
  visit(node.value);       // Post-order: Sinistra -> Destra -> Radice
}
```

#### Breadth-First Search (BFS)

L'attraversamento in ampiezza (BFS) esplora tutti i nodi a un certo livello prima di passare al livello successivo. Poiché richiede una coda, è spesso implementato in modo iterativo, ma è possibile farlo anche in modo ricorsivo:

```javascript
function bfs(root, visit) {
  const queue = [root];
  
  while (queue.length > 0) {
    const node = queue.shift();
    if (!node) continue;
    
    visit(node.value);
    
    for (const child of node.children) {
      queue.push(child);
    }
  }
}
```

Versione ricorsiva (meno comune):

```javascript
function bfsRecursive(nodes, visit) {
  if (nodes.length === 0) return;
  
  const nextLevel = [];
  
  for (const node of nodes) {
    visit(node.value);
    nextLevel.push(...node.children);
  }
  
  bfsRecursive(nextLevel, visit);
}

// Utilizzo: bfsRecursive([root], console.log);
```

## Liste Concatenate e Ricorsione

Le liste concatenate sono un'altra struttura dati che si presta naturalmente alla ricorsione.

### Rappresentazione di una Lista Concatenata

```javascript
class ListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}
```

### Operazioni Ricorsive su Liste Concatenate

#### Attraversamento

```javascript
function traverseList(node, visit) {
  if (!node) return;
  
  visit(node.value);
  traverseList(node.next, visit);
}
```

#### Inversione

```javascript
function reverseList(head, prev = null) {
  if (!head) return prev;
  
  const next = head.next;
  head.next = prev;
  
  return reverseList(next, head);
}
```

## Strutture JSON Annidate

Le strutture JSON annidate sono comuni nelle applicazioni web moderne e si prestano bene alla manipolazione ricorsiva.

### Esempio: Ricerca Profonda in un Oggetto

```javascript
function findValueDeep(obj, key) {
  // Caso base: null o tipi primitivi
  if (obj === null || typeof obj !== 'object') {
    return undefined;
  }
  
  // Controllo se la chiave esiste nell'oggetto corrente
  if (key in obj) {
    return obj[key];
  }
  
  // Ricorsione su ogni proprietà dell'oggetto
  for (const prop in obj) {
    const result = findValueDeep(obj[prop], key);
    if (result !== undefined) {
      return result;
    }
  }
  
  return undefined;
}

// Esempio di utilizzo
const data = {
  name: "Product",
  details: {
    specs: {
      weight: "2kg",
      dimensions: {
        height: "10cm"
      }
    }
  }
};

console.log(findValueDeep(data, "height")); // "10cm"
```

### Appiattimento di Strutture Annidate

```javascript
function flattenObject(obj, prefix = '', result = {}) {
  for (const key in obj) {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      flattenObject(obj[key], prefixedKey, result);
    } else {
      result[prefixedKey] = obj[key];
    }
  }
  
  return result;
}

// Esempio
const nested = {
  a: 1,
  b: {
    c: 2,
    d: {
      e: 3
    }
  }
};

console.log(flattenObject(nested));
// { "a": 1, "b.c": 2, "b.d.e": 3 }
```

## Grafi e Ricorsione

I grafi sono strutture più complesse che richiedono attenzione per evitare cicli infiniti nella ricorsione.

### Rappresentazione di un Grafo

```javascript
class Graph {
  constructor() {
    this.adjacencyList = {};
  }
  
  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
    }
  }
  
  addEdge(vertex1, vertex2) {
    this.adjacencyList[vertex1].push(vertex2);
    this.adjacencyList[vertex2].push(vertex1); // Per grafi non orientati
  }
}
```

### Depth-First Search su Grafi

```javascript
function dfsGraph(graph, startVertex, visit, visited = {}) {
  // Marca il vertice come visitato
  visited[startVertex] = true;
  
  // Visita il vertice
  visit(startVertex);
  
  // Visita tutti i vertici adiacenti non ancora visitati
  for (const neighbor of graph.adjacencyList[startVertex]) {
    if (!visited[neighbor]) {
      dfsGraph(graph, neighbor, visit, visited);
    }
  }
}
```

## DOM e Ricorsione

Il Document Object Model (DOM) è un'altra struttura gerarchica che si presta bene alla ricorsione.

### Attraversamento del DOM

```javascript
function traverseDOM(element, visit) {
  // Visita l'elemento corrente
  visit(element);
  
  // Attraversa i figli ricorsivamente
  for (const child of element.children) {
    traverseDOM(child, visit);
  }
}

// Esempio di utilizzo
traverseDOM(document.body, element => {
  console.log(element.tagName);
});
```

### Ricerca nel DOM

```javascript
function findElementByAttribute(element, attr, value) {
  // Controlla l'elemento corrente
  if (element.getAttribute(attr) === value) {
    return element;
  }
  
  // Cerca nei figli
  for (const child of element.children) {
    const found = findElementByAttribute(child, attr, value);
    if (found) {
      return found;
    }
  }
  
  return null;
}
```

## Strutture Dati Funzionali Immutabili

Nella programmazione funzionale, spesso si lavora con strutture dati immutabili. La ricorsione è fondamentale per operare su queste strutture senza mutare lo stato.

### Esempio: Albero Immutabile

```javascript
// Aggiungi un valore a un albero binario di ricerca immutabile
function insert(tree, value) {
  if (!tree) {
    return { value, left: null, right: null };
  }
  
  if (value < tree.value) {
    // Crea un nuovo nodo con il sottoalbero sinistro aggiornato
    return {
      value: tree.value,
      left: insert(tree.left, value),
      right: tree.right
    };
  } else {
    // Crea un nuovo nodo con il sottoalbero destro aggiornato
    return {
      value: tree.value,
      left: tree.left,
      right: insert(tree.right, value)
    };
  }
}
```

## Best Practices con Strutture Dati Ricorsive

1. **Gestione dei casi limite**: Considera sempre i casi di base (null, vuoto, ecc.)
2. **Prevenzione dei cicli**: Con grafi, usa un set o un oggetto per tenere traccia dei nodi visitati
3. **Ottimizzazione della memoria**: Valuta l'uso della tail recursion o approcci iterativi per strutture molto grandi
4. **Bilanciamento**: Per alcune strutture come gli alberi, il bilanciamento è cruciale per performance di ricorsione ottimali
5. **Immutabilità**: Con strutture dati funzionali, crea sempre nuovi oggetti anziché modificare quelli esistenti

## Conclusione

La ricorsione e le strutture dati complesse sono complementari: molte strutture dati sono naturalmente ricorsive nella loro definizione, e la ricorsione offre un modo elegante e intuitivo per lavorare con esse.

Sebbene in alcuni casi gli approcci iterativi possano essere più efficienti, la ricorsione spesso porta a soluzioni più chiare e concise, specialmente quando si lavora con strutture dati annidate o gerarchiche come alberi, grafi e JSON complessi.

Nella programmazione funzionale, dove l'immutabilità è un principio fondamentale, la ricorsione diventa uno strumento ancora più potente per operare su strutture dati senza mutazioni.

## Navigazione del Corso
- [📑 Indice](/home/git-projects/ROBOTICA/JS-FunctionalProgramming/README.md)
- [⬅️ Ricorsione vs Iterazione](/home/git-projects/ROBOTICA/JS-FunctionalProgramming/06-Ricorsione/teoria/04-RicorsioneVsIterazione.md)
- [➡️ Modulo 7: Lazy Evaluation](/home/git-projects/ROBOTICA/JS-FunctionalProgramming/07-LazyEvaluation/README.md)
