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
                bewertungen TEXT NOT NULL,
                bild TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    });
}

function insertBewertung(bewertung) {
    return new Promise((resolve, reject) => {
        const stmt = `
            INSERT INTO bewertungen
            (name, produktart, ort, produkt, brot, fleisch, gemüse, sossen, preis, aussehen, bild)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            bewertung.name,
            bewertung.produktart,
            bewertung.ort,
            bewertung.produkt,
            bewertung.brot,
            bewertung.fleisch,
            bewertung.gemüse,
            bewertung.sossen,
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
                AVG(brot) AS avg_brot,
                AVG(fleisch) AS avg_fleisch,
                AVG(gemüse) AS avg_gemüse,
                AVG(sossen) AS avg_sossen,
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

        query += ' GROUP BY ort, produkt ORDER BY (avg_brot + avg_fleisch + avg_gemüse + avg_sossen + avg_preis + avg_aussehen)/6 DESC';

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
