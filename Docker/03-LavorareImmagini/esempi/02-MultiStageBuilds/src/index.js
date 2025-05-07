// Semplice applicazione Express per dimostrare multi-stage build
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Rotta principale
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Demo Multi-stage Build</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        h1 {
          color: #0066cc;
          border-bottom: 2px solid #0066cc;
          padding-bottom: 10px;
        }
        .success {
          background-color: #d4edda;
          color: #155724;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        code {
          background-color: #f0f0f0;
          padding: 2px 5px;
          border-radius: 3px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Demo Multi-stage Build</h1>
        
        <div class="success">
          <strong>Congratulazioni!</strong> Se stai vedendo questa pagina, hai creato con successo un'immagine Docker utilizzando multi-stage build.
        </div>
        
        <h2>Vantaggi del Multi-stage Build</h2>
        <ul>
          <li>Immagini più piccole</li>
          <li>Maggiore sicurezza</li>
          <li>Migliori prestazioni</li>
        </ul>
        
        <h2>Confronto delle Dimensioni</h2>
        <p>L'immagine finale è significativamente più piccola rispetto a un'immagine che include l'ambiente di build completo.</p>
        <p>Prova a eseguire: <code>docker images</code> per vedere la differenza!</p>
      </div>
    </body>
    </html>
  `);
});

// Avvio del server
app.listen(port, () => {
  console.log(`Applicazione in esecuzione sulla porta ${port}`);
});