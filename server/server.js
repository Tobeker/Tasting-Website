const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Setup
const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// Statische Daten
const orte = [
    'Schafstädt King-Döner',
    'Bad Lauchstädt Bosporos',
    'Merseburg Star-Döner',
    'Halle Neustadt Atlanta',
    'Angersdorf Hayat'
];
  
const produkte = {
    'Döner': [
      'Döner',
      'Dürüm',
      'Döner-Teller',
      'Sonstiges'
    ],
    'Bier': [
      'Ur-Krostitzer',
      'Becks',
      'Krombacher',
      'Veltins'
    ]
};
  

// Multer für Bild-Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});
const upload = multer({ storage });

// SQLite Datenbank
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error(err.message);
  else console.log('SQLite DB verbunden!');
});

// Tabelle erstellen
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS bewertungen (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      produktart TEXT,
      ort TEXT,
      produkt TEXT,
      bewertungen TEXT,     -- JSON mit den Bewertungskriterien
      bild TEXT,            -- Bildpfad
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// --------------------------------------
// ROUTES
// --------------------------------------

// Root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/orte', (req, res) => {
    res.json(orte);
});
  
app.get('/api/produkte/:produktart', (req, res) => {
    const produktart = req.params.produktart;
  
    if (!produkte[produktart]) {
      return res.status(404).json({ error: 'Produktart nicht gefunden' });
    }
  
    res.json(produkte[produktart]);
});
  

// Bewertung absenden
app.post('/api/bewertung', upload.single('bild'), (req, res) => {
  try {
    const { name, produktart, ort, produkt } = req.body;
    const kriterien = { ...req.body };

    // Entferne Felder, die nicht zu den Bewertungen gehören
    delete kriterien.name;
    delete kriterien.produktart;
    delete kriterien.ort;
    delete kriterien.produkt;

    const bewertungenJSON = JSON.stringify(kriterien);
    const bildPfad = req.file ? `/uploads/${req.file.filename}` : null;

    const query = `
      INSERT INTO bewertungen
      (name, produktart, ort, produkt, bewertungen, bild)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [name, produktart, ort, produkt, bewertungenJSON, bildPfad], function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({ success: false, error: err.message });
      } else {
        res.json({ success: true, id: this.lastID });
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Serverfehler' });
  }
});

// Auswertung abrufen
app.get('/api/auswertung', (req, res) => {
  const query = `SELECT * FROM bewertungen`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: err.message });
    }

    // Aggregation vorbereiten
    const result = {};

    rows.forEach(row => {
      const key = `${row.produktart}|${row.ort}|${row.produkt}`;
      if (!result[key]) {
        result[key] = {
          produktart: row.produktart,
          ort: row.ort,
          produkt: row.produkt,
          anzahl: 0,
          summe: {},
          durchschnitt: {}
        };
      }

      const bewertungen = JSON.parse(row.bewertungen);
      result[key].anzahl += 1;

      for (const [kriterium, wert] of Object.entries(bewertungen)) {
        const val = parseFloat(wert);
        if (!result[key].summe[kriterium]) {
          result[key].summe[kriterium] = 0;
        }
        result[key].summe[kriterium] += val;
      }
    });

    // Durchschnitt berechnen
    const auswertung = Object.values(result).map(item => {
      for (const kriterium in item.summe) {
        item.durchschnitt[kriterium] = (item.summe[kriterium] / item.anzahl).toFixed(2);
      }
      delete item.summe; // Summe rauswerfen, nur Durchschnitt zurückgeben
      return item;
    });

    res.json(auswertung);
  });
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
