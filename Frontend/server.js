import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Servi i file statici dalla cartella dist
app.use(express.static(path.join(__dirname, 'dist')));

// Per tutte le altre richieste, restituisci index.html (SPA routing)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Bizment Frontend Server in ascolto sulla porta ${port}`);
});
