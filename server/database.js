const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'datenbank.sqlite');
let db;

function initDatabase() {
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            return console.error('DB Fehler:', err.message);
        }
        console.log('Verbindung zur SQLite-Datenbank erfolgreich!');
    });

    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS bewertungen (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                produktart TEXT NOT NULL,
                ort TEXT NOT NULL,
                produkt TEXT NOT NULL,
                geschmack INTEGER NOT NULL,
                preis INTEGER NOT NULL,
                aussehen INTEGER NOT NULL,
                bild TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    });
}

function insertBewertung(bewertung) {
    return new Promise((resolve, reject) => {
        const stmt = `
            INSERT INTO bewertungen
            (name, produktart, ort, produkt, geschmack, preis, aussehen, bild)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            bewertung.name,
            bewertung.produktart,
            bewertung.ort,
            bewertung.produkt,
            bewertung.geschmack,
            bewertung.preis,
            bewertung.aussehen,
            bewertung.bild
        ];

        db.run(stmt, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

function getAuswertungen(ort, produkt) {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT
                ort,
                produkt,
                AVG(geschmack) AS avg_geschmack,
                AVG(preis) AS avg_preis,
                AVG(aussehen) AS avg_aussehen,
                COUNT(*) AS anzahl
            FROM bewertungen
            WHERE 1=1
        `;
        const params = [];

        if (ort) {
            query += ' AND ort = ?';
            params.push(ort);
        }
        if (produkt) {
            query += ' AND produkt = ?';
            params.push(produkt);
        }

        query += ' GROUP BY ort, produkt ORDER BY (avg_geschmack + avg_preis + avg_aussehen)/3 DESC';

        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

module.exports = {
    initDatabase,
    insertBewertung,
    getAuswertungen
};
