const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { initDatabase, insertBewertung, getAuswertungen } = require('./database');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Statische Dateien (Frontend)
app.use('/uploads', express.static('uploads')); // Bilder öffentlich erreichbar machen

// Bilder Upload (Multer Config)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Init SQLite DB
initDatabase();

// ROUTEN -----------------------------

// Test-Route
app.get('/api/ping', (req, res) => {
    res.json({ message: 'Server läuft!' });
});

// Bewertung speichern
app.post('/api/bewertung', upload.single('bild'), async (req, res) => {
    try {
        const { name, produktart, ort, produkt, geschmack, preis, aussehen } = req.body;
        const bildPath = req.file ? req.file.path : null;

        if (!name || !produktart || !ort || !produkt || !geschmack || !preis || !aussehen) {
            return res.status(400).json({ message: 'Fehlende Felder!' });
        }

        await insertBewertung({
            name,
            produktart,
            ort,
            produkt,
            geschmack: parseInt(geschmack),
            preis: parseInt(preis),
            aussehen: parseInt(aussehen),
            bild: bildPath
        });

        res.json({ message: 'Bewertung gespeichert!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Fehler beim Speichern!' });
    }
});

// Auswertungen abrufen
app.get('/api/auswertungen', async (req, res) => {
    try {
        const { ort, produkt } = req.query;

        const daten = await getAuswertungen(ort, produkt);

        res.json(daten);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Fehler beim Abrufen der Auswertungen!' });
    }
});

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
