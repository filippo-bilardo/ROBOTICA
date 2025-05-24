/**
 * ESERCIZIO 2: PARADIGMI A CONFRONTO
 * Implementazione dello stesso problema con diversi paradigmi
 * 
 * OBIETTIVI:
 * - Comprendere le differenze tra paradigmi
 * - Analizzare vantaggi e svantaggi di ogni approccio
 * - Sviluppare capacità di scelta del paradigma appropriato
 */

console.log("=== ESERCIZIO 2: PARADIGMI A CONFRONTO ===\n");

// ========================================
// PROBLEMA: Sistema di gestione biblioteca
// ========================================

// Dati di esempio
const books = [
    { id: 1, title: "1984", author: "George Orwell", year: 1949, available: true, genre: "Dystopian", rating: 4.8 },
    { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", year: 1960, available: false, genre: "Fiction", rating: 4.5 },
    { id: 3, title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: 1925, available: true, genre: "Classic", rating: 4.2 },
    { id: 4, title: "Pride and Prejudice", author: "Jane Austen", year: 1813, available: true, genre: "Romance", rating: 4.6 },
    { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger", year: 1951, available: false, genre: "Fiction", rating: 4.0 }
];

// ========================================
// IMPLEMENTAZIONE IMPERATIVA
// ========================================

class LibraryImperative {
    constructor(books) {
        this.books = [...books]; // Copia per evitare mutazioni esterne
    }

    // Trova libri disponibili di un certo genere
    findAvailableBooksByGenre(genre) {
        let result = [];
        for (let i = 0; i < this.books.length; i++) {
            if (this.books[i].available && this.books[i].genre === genre) {
                result.push(this.books[i]);
            }
        }
        return result;
    }

    // Presta un libro
    borrowBook(bookId) {
        for (let i = 0; i < this.books.length; i++) {
            if (this.books[i].id === bookId) {
                if (this.books[i].available) {
                    this.books[i].available = false;
                    return { success: true, message: `Libro "${this.books[i].title}" prestato con successo` };
                } else {
                    return { success: false, message: "Libro non disponibile" };
                }
            }
        }
        return { success: false, message: "Libro non trovato" };
    }

    // Restituisce un libro
    returnBook(bookId) {
        for (let i = 0; i < this.books.length; i++) {
            if (this.books[i].id === bookId) {
                this.books[i].available = true;
                return { success: true, message: `Libro "${this.books[i].title}" restituito con successo` };
            }
        }
        return { success: false, message: "Libro non trovato" };
    }

    // Ottieni statistiche
    getStatistics() {
        let totalBooks = this.books.length;
        let availableBooks = 0;
        let averageRating = 0;
        let ratingSum = 0;

        for (let i = 0; i < this.books.length; i++) {
            if (this.books[i].available) {
                availableBooks++;
            }
            ratingSum += this.books[i].rating;
        }

        averageRating = ratingSum / totalBooks;

        return {
            total: totalBooks,
            available: availableBooks,
            borrowed: totalBooks - availableBooks,
            averageRating: Math.round(averageRating * 100) / 100
        };
    }
}

// ========================================
// IMPLEMENTAZIONE ORIENTATA AGLI OGGETTI
// ========================================

class Book {
    constructor(id, title, author, year, available, genre, rating) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.year = year;
        this.available = available;
        this.genre = genre;
        this.rating = rating;
    }

    borrow() {
        if (this.available) {
            this.available = false;
            return { success: true, message: `"${this.title}" prestato con successo` };
        }
        return { success: false, message: `"${this.title}" non è disponibile` };
    }

    return() {
        this.available = true;
        return { success: true, message: `"${this.title}" restituito con successo` };
    }

    isAvailableInGenre(genre) {
        return this.available && this.genre === genre;
    }

    getInfo() {
        return `${this.title} by ${this.author} (${this.year}) - ${this.genre} - Rating: ${this.rating}`;
    }
}

class LibraryOOP {
    constructor(booksData) {
        this.books = booksData.map(book => 
            new Book(book.id, book.title, book.author, book.year, book.available, book.genre, book.rating)
        );
    }

    findBookById(id) {
        return this.books.find(book => book.id === id);
    }

    findAvailableBooksByGenre(genre) {
        return this.books.filter(book => book.isAvailableInGenre(genre));
    }

    borrowBook(bookId) {
        const book = this.findBookById(bookId);
        return book ? book.borrow() : { success: false, message: "Libro non trovato" };
    }

    returnBook(bookId) {
        const book = this.findBookById(bookId);
        return book ? book.return() : { success: false, message: "Libro non trovato" };
    }

    getStatistics() {
        const total = this.books.length;
        const available = this.books.filter(book => book.available).length;
        const averageRating = this.books.reduce((sum, book) => sum + book.rating, 0) / total;

        return {
            total,
            available,
            borrowed: total - available,
            averageRating: Math.round(averageRating * 100) / 100
        };
    }
}

// ========================================
// IMPLEMENTAZIONE FUNZIONALE
// ========================================

// Funzioni pure per operazioni sui libri
const BookOperations = {
    // Predicati
    isAvailable: book => book.available,
    hasGenre: genre => book => book.genre === genre,
    hasId: id => book => book.id === id,

    // Trasformazioni
    borrowBook: book => ({ ...book, available: false }),
    returnBook: book => ({ ...book, available: true }),

    // Combinatori
    and: (predA, predB) => item => predA(item) && predB(item),
    
    // Selettori
    findById: (books, id) => books.find(BookOperations.hasId(id)),
    filterBy: (books, predicate) => books.filter(predicate),
    
    // Aggregatori
    count: books => books.length,
    countBy: (books, predicate) => books.filter(predicate).length,
    averageRating: books => books.reduce((sum, book) => sum + book.rating, 0) / books.length
};

// Operazioni di alto livello
const LibraryOperations = {
    findAvailableBooksByGenre: (books, genre) => 
        BookOperations.filterBy(
            books, 
            BookOperations.and(BookOperations.isAvailable, BookOperations.hasGenre(genre))
        ),

    borrowBook: (books, bookId) => {
        const bookIndex = books.findIndex(BookOperations.hasId(bookId));
        if (bookIndex === -1) {
            return { books, result: { success: false, message: "Libro non trovato" } };
        }
        
        const book = books[bookIndex];
        if (!book.available) {
            return { books, result: { success: false, message: "Libro non disponibile" } };
        }

        const newBooks = [
            ...books.slice(0, bookIndex),
            BookOperations.borrowBook(book),
            ...books.slice(bookIndex + 1)
        ];

        return { 
            books: newBooks, 
            result: { success: true, message: `Libro "${book.title}" prestato con successo` }
        };
    },

    returnBook: (books, bookId) => {
        const bookIndex = books.findIndex(BookOperations.hasId(bookId));
        if (bookIndex === -1) {
            return { books, result: { success: false, message: "Libro non trovato" } };
        }

        const book = books[bookIndex];
        const newBooks = [
            ...books.slice(0, bookIndex),
            BookOperations.returnBook(book),
            ...books.slice(bookIndex + 1)
        ];

        return { 
            books: newBooks, 
            result: { success: true, message: `Libro "${book.title}" restituito con successo` }
        };
    },

    getStatistics: books => ({
        total: BookOperations.count(books),
        available: BookOperations.countBy(books, BookOperations.isAvailable),
        borrowed: BookOperations.countBy(books, book => !BookOperations.isAvailable(book)),
        averageRating: Math.round(BookOperations.averageRating(books) * 100) / 100
    })
};

// ========================================
// TEST E CONFRONTO
// ========================================

console.log("=== TEST IMPLEMENTAZIONI ===\n");

// Test Imperativo
console.log("--- IMPERATIVO ---");
const libraryImperative = new LibraryImperative(books);
console.log("Libri Fiction disponibili:", libraryImperative.findAvailableBooksByGenre("Fiction"));
console.log("Prestito libro ID 1:", libraryImperative.borrowBook(1));
console.log("Statistiche:", libraryImperative.getStatistics());
console.log();

// Test OOP
console.log("--- ORIENTATO AGLI OGGETTI ---");
const libraryOOP = new LibraryOOP(books);
console.log("Libri Fiction disponibili:", libraryOOP.findAvailableBooksByGenre("Fiction"));
console.log("Prestito libro ID 2:", libraryOOP.borrowBook(2));
console.log("Statistiche:", libraryOOP.getStatistics());
console.log();

// Test Funzionale
console.log("--- FUNZIONALE ---");
let functionalBooks = [...books]; // Stato immutabile
console.log("Libri Fiction disponibili:", LibraryOperations.findAvailableBooksByGenre(functionalBooks, "Fiction"));

const borrowResult = LibraryOperations.borrowBook(functionalBooks, 3);
functionalBooks = borrowResult.books; // Nuovo stato
console.log("Prestito libro ID 3:", borrowResult.result);
console.log("Statistiche:", LibraryOperations.getStatistics(functionalBooks));
console.log();

// ========================================
// ANALISI COMPARATIVA
// ========================================

console.log("=== ANALISI COMPARATIVA ===\n");

// Misurazione performance (semplificata)
const performanceTest = (name, fn) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(4)}ms`);
};

const testData = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    title: `Book ${i}`,
    author: `Author ${i}`,
    year: 2000 + (i % 24),
    available: i % 2 === 0,
    genre: ['Fiction', 'Classic', 'Romance', 'Dystopian'][i % 4],
    rating: 3 + Math.random() * 2
}));

console.log("Performance test con 1000 libri:");

performanceTest("Imperativo", () => {
    const lib = new LibraryImperative(testData);
    lib.findAvailableBooksByGenre("Fiction");
    lib.getStatistics();
});

performanceTest("OOP", () => {
    const lib = new LibraryOOP(testData);
    lib.findAvailableBooksByGenre("Fiction");
    lib.getStatistics();
});

performanceTest("Funzionale", () => {
    LibraryOperations.findAvailableBooksByGenre(testData, "Fiction");
    LibraryOperations.getStatistics(testData);
});

console.log();

// ========================================
// VANTAGGI E SVANTAGGI
// ========================================

console.log("=== CONFRONTO PARADIGMI ===\n");

const paradigmComparison = {
    imperativo: {
        vantaggi: [
            "Controllo diretto del flusso",
            "Facile da capire per principianti",
            "Performance prevedibili",
            "Debugging step-by-step semplice"
        ],
        svantaggi: [
            "Codice spesso verboso",
            "Propenso a bug da mutazione",
            "Difficile da testare",
            "Riusabilità limitata"
        ]
    },
    oop: {
        vantaggi: [
            "Organizzazione logica del codice",
            "Incapsulamento dei dati",
            "Riusabilità tramite ereditarietà",
            "Modeling del dominio naturale"
        ],
        svantaggi: [
            "Overhead di oggetti",
            "Complessità delle gerarchie",
            "State mutabile nascosto",
            "Testing complesso con dipendenze"
        ]
    },
    funzionale: {
        vantaggi: [
            "Funzioni pure e prevedibili",
            "Testing semplificato",
            "Composizione elegante",
            "Parallelizzazione sicura",
            "Immutabilità per design"
        ],
        svantaggi: [
            "Curva di apprendimento ripida",
            "Performance overhead (copie)",
            "Gestione stato complessa",
            "Debugging meno intuitivo"
        ]
    }
};

Object.entries(paradigmComparison).forEach(([paradigm, comparison]) => {
    console.log(`${paradigm.toUpperCase()}:`);
    console.log("Vantaggi:", comparison.vantaggi.join(", "));
    console.log("Svantaggi:", comparison.svantaggi.join(", "));
    console.log();
});

// ========================================
// ESERCIZIO PRATICO
// ========================================

console.log("=== ESERCIZIO PRATICO ===");
console.log("Implementa le seguenti funzionalità in tutti e tre i paradigmi:");
console.log("1. Ricerca libri per autore");
console.log("2. Filtro libri per range di anni");
console.log("3. Ordinamento per rating");
console.log("4. Sistema di prenotazioni");
console.log("\nProva a identificare quale paradigma si adatta meglio a ciascuna funzionalità!");

// TODO: Implementa le funzionalità richieste
// Suggerimento: considera testabilità, manutenibilità e performance

// ========================================
// RIEPILOGO APPRENDIMENTO
// ========================================
console.log("\n=== COSA HAI IMPARATO ===");
console.log("✓ Differenze pratiche tra paradigmi");
console.log("✓ Vantaggi e svantaggi di ogni approccio");
console.log("✓ Quando scegliere quale paradigma");
console.log("✓ Impatto su testabilità e manutenibilità");
console.log("✓ Trade-off tra performance e leggibilità");
