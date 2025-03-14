document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app');
  
    // Dynamische Kriterien-Definition
    const bewertungskriterien = {
      'Döner': [
        { name: 'brot', label: 'Brot' },
        { name: 'fleisch', label: 'Fleisch' },
        { name: 'gemuese', label: 'Gemüse' },
        { name: 'sossen', label: 'Soßen' },
        { name: 'preis', label: 'Preis-Leistung' },
        { name: 'aussehen', label: 'Aussehen' }
      ],
      'Bier': [
        { name: 'schaum', label: 'Schaum' },
        { name: 'geruch', label: 'Geruch' },
        { name: 'geschmack', label: 'Geschmack' },
        { name: 'preis', label: 'Preis' }
      ]
    };
  
    let username = '';
  
    // Startbildschirm
    function showStartPage() {
      appContainer.innerHTML = `
        <h1>Willkommen zur Bewertungsplattform!</h1>
        <form id="nameForm">
          <label for="username">Dein Name:</label>
          <input type="text" id="username" name="username" required>
          <button type="submit">Einloggen</button>
        </form>
        <button id="showStats">Auswertung ansehen</button>
      `;
  
      document.getElementById('nameForm').addEventListener('submit', (e) => {
        e.preventDefault();
        username = document.getElementById('username').value.trim();
        if (username) {
          showProduktAuswahl();
        }
      });
  
      document.getElementById('showStats').addEventListener('click', showAuswertung);
    }
  
    // Produktauswahl
    function showProduktAuswahl() {
      appContainer.innerHTML = `
        <h2>Hi ${username}, was willst du bewerten?</h2>
        <button onclick="selectProduktart('Döner')">Döner</button>
        <button onclick="selectProduktart('Bier')">Bier</button>
        <button onclick="showStartPage()">Zurück</button>
      `;
    }
  
    // Produktart auswählen
    window.selectProduktart = function(produktart) {
      appContainer.innerHTML = `
        <h2>${produktart} bewerten</h2>
        <form id="produktForm">
            ${produktart === 'Döner' ? `
                <label for="ort">Ort auswählen:</label>
                <select id="ort" name="ort">
                    <option value="">Ort wählen...</option>
                </select>
            ` : ''}

            <label for="produkt">Produkt auswählen:</label>
            <select id="produkt" name="produkt">
                <option value="">Produkt wählen...</option>
            </select>
  
            <button type="submit">Weiter zur Bewertung</button>
        </form>
        <button onclick="showProduktAuswahl()">Zurück</button>
      `;
  
        // Orte für Döner dynamisch laden
        if (produktart == 'Döner'){
            fetch('/api/orte')
                .then(res => res.json())
                .then(orte => {
                    const ortSelect = document.getElementById('ort');
                    ortSelect.innerHTML = `<option value="">Ort wählen...</option>`;
                    orte.forEach(ort => {
                        ortSelect.innerHTML += `<option value="${ort}">${ort}</option>`;
                    });
                })
                .catch(err => {
                    console.error(err);
                    alert('Fehler beim Laden der Orte!');
                });
        }

        // Produkte für die gewählte Produktart dynamisch laden
        fetch(`/api/produkte/${produktart}`)
        .then(res => res.json())
        .then(produkte => {
            const produktSelect = document.getElementById('produkt');
            produktSelect.innerHTML = `<option value="">Produkt wählen...</option>`;
            produkte.forEach(produkt => {
                produktSelect.innerHTML += `<option value="${produkt}">${produkt}</option>`;
            });
        })
        .catch(err => {
            console.error(err);
            alert('Fehler beim Laden der Produkte!');
        });

        // Formular abschicken, um die Bewertung zu starten
        document.getElementById('produktForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const produkt = document.getElementById('produkt').value.trim();
            const ort = produktart === 'Döner' ? document.getElementById('ort').value.trim() : '';
    
            // Überprüfe, ob ein Produkt und bei Döner auch ein Ort gewählt wurde
            if (produkt && (produktart !== 'Döner' || ort)) {
                // Hier rufen wir die Funktion fetchExistingBewertung() auf
                fetchExistingBewertung(produktart, produkt, ort);
            } else {
                alert('Bitte wähle ein Produkt und einen Ort (bei Döner) aus.');
            }
        });
      
    };
  
    // Funktion, um eine vorhandene Bewertung abzurufen
    function fetchExistingBewertung(produktart, produkt, ort) {
        const ortParam = ort && ort.trim() !== '' ? ort : 'kein-ort';
        const url = `/api/bewertung/${username}/${produktart}/${ortParam}/${produkt}`;
        // console.log('Hole Bewertung von:', url); // <- URL prüfen!

        fetch(url)
            .then(res => res.json())
            .then(data => {
                // console.log('Antwort von fetchExistingBewertung:', data); // <-- Logge das komplette Ergebnis!
                if (data.success && data.bewertung) {
                    const item = data.bewertung;
                    // Vorhandene Bewertung anzeigen
                    const bewertung = JSON.parse(item.bewertungen);
                    const bild = item.bild || null;
                    showBewertungsformular(item.produktart, item.produkt, item.ort, bewertung, bild);
                } else {
                    // Keine Bewertung gefunden, neues Formular anzeigen
                    console.log('Keine vorhandene Bewertung gefunden, zeige leeres Formular.');
                    showBewertungsformular(produktart, produkt, ort);
                }
            })
            .catch(err => {
                console.error(err);
                alert('Fehler beim Laden der Bewertung!');
            });
    }
  

    // Bewertungsformular anzeigen
    function showBewertungsformular(produktart, produkt, ort, bewertung = null, bildPfad = null) {

        const form = document.createElement('form');
        form.id = 'bewertungForm';
        form.enctype = 'multipart/form-data';
  
        let html = `<h2>${produktart} bewerten: ${produkt}</h2>`;
        html += `<input type="hidden" name="produktart" value="${produktart}">`;
        html += `<input type="hidden" name="produkt" value="${produkt}">`;
        html += `<input type="hidden" name="ort" value="${ort}">`;
        html += `<input type="hidden" name="name" value="${username}">`;
  
        // Dynamische Felder für die Kriterien
        bewertungskriterien[produktart].forEach(kriterium => {
            html += `
                <div class="kriterium">
                <label>${kriterium.label}:</label>
                <div class="rating-options" id="rating-${kriterium.name}">
            `;
  
            for (let i = 1; i <= 10; i++) {
                const checked = bewertung && bewertung[kriterium.name] == i ? 'checked' : '';
                html += `
                    <input type="radio" id="${kriterium.name}-${i}" name="${kriterium.name}" value="${i}" ${checked} required>
                    <label for="${kriterium.name}-${i}" class="rating-box">${i}</label>
                `;
            }
  
            html += `</div></div>`;
        });
  
        // Bild-Upload (falls vorhanden)
        if (bildPfad) {
            html += `
                <label>Aktuelles Bild:</label>
                <img src="${bildPfad}" alt="Aktuelles Bild" style="max-width: 200px;">
                <br><br>
            `;
        }
  
        html += `
            <label for="bild">Bild hochladen (optional):</label>
            <input type="file" id="bild" name="bild" accept="image/*">
        `;
  
        html += `
            <button type="submit">${bewertung ? 'Bewertung ändern' : 'Bewertung absenden'}</button>
            <button type="button" onclick="showProduktAuswahl()">Zurück</button>
        `;
  
        form.innerHTML = html;
        appContainer.innerHTML = '';
        appContainer.appendChild(form);
  
        form.addEventListener('submit', submitBewertung);
    }
  
  
  
    // Bewertung absenden
    function submitBewertung(e) {
      e.preventDefault();
  
      const form = document.getElementById('bewertungForm');
      const formData = new FormData(form);
  
      fetch('/api/bewertung', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert('Bewertung gespeichert!');
            showProduktAuswahl();
          } else {
            alert('Fehler beim Speichern.');
          }
        })
        .catch(err => {
          console.error(err);
          alert('Netzwerkfehler!');
        });
    }
      
    // Auswertung anzeigen
    function showAuswertung() {
        fetch('/api/auswertung')
            .then(res => res.json())
            .then(data => {
                renderAuswertung(data);
            })
            .catch(err => {
                console.error(err);
                alert('Fehler beim Laden der Auswertung!');
            });
    }
  
    function renderAuswertung(data) {
      appContainer.innerHTML = `
        <h2>Auswertung</h2>
        <button onclick="showStartPage()">Zurück</button>
        
        <div id="beste-doener"></div>
        <div id="beste-biere"></div>
        <div id="charts"></div>
      `;
  
      const chartsContainer = document.getElementById('charts');
      const besteDoenerContainer = document.getElementById('beste-doener');
      const besteBiereContainer = document.getElementById('beste-biere');
  
      if (!data || data.length === 0) {
        chartsContainer.innerHTML = '<p>Noch keine Bewertungen vorhanden.</p>';
        return;
      }
  
      // Schritt 1: Diagramme rendern
      data.forEach((item, index) => {
        const canvasId = `chart-${index}`;
  
        const div = document.createElement('div');
        div.classList.add('auswertung-item');
        div.innerHTML = `
          <h3>${item.produktart} - ${item.produkt} (${item.ort})</h3>
          <canvas id="${canvasId}" width="400" height="200"></canvas>
        `;
  
        chartsContainer.appendChild(div);
  
        const ctx = document.getElementById(canvasId).getContext('2d');
        const labels = Object.keys(item.durchschnitt);
        const dataValues = Object.values(item.durchschnitt).map(val => parseFloat(val));
  
        // Gesamtdurchschnitt berechnen
        const total = dataValues.reduce((sum, val) => sum + val, 0);
        const average = (dataValues.length > 0) ? (total / dataValues.length) : 0;
  
        // Label + Wert hinzufügen
        labels.push('Gesamtbewertung');
        dataValues.push(parseFloat(average.toFixed(2))); // Optional auf 2 Nachkommastellen runden
  
        // Chart.js Balkendiagramm erstellen
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Durchschnittsbewertung',
              data: dataValues,
              backgroundColor: labels.map(label => label === 'Gesamtbewertung' ? 'rgba(255, 99, 132, 0.6)' : 'rgba(33, 150, 243, 0.6)'),
              borderColor: labels.map(label => label === 'Gesamtbewertung' ? 'rgba(255, 99, 132, 1)' : 'rgba(33, 150, 243, 1)'),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 10
              }
            }
          }
        });
      });
  
        // Schritt 2: Besten 3 Döner anzeigen
        if (data.filter(item => item.produktart === 'Döner').length > 0) {
            const besteDoener = data.filter(item => item.produktart === 'Döner')
                .sort((a, b) => {
                    const averageA = Object.values(a.durchschnitt).reduce((sum, val) => sum + parseFloat(val), 0) / Object.values(a.durchschnitt).length;
                    const averageB = Object.values(b.durchschnitt).reduce((sum, val) => sum + parseFloat(val), 0) / Object.values(b.durchschnitt).length;
                    return averageB - averageA; // absteigend sortieren
                }).slice(0, 3);

            besteDoenerContainer.innerHTML = `
                <h3>Top 3 Döner</h3>
                <ul>
                    ${besteDoener.map((doener, index) => `
                        <li>${index + 1}. ${doener.produkt} (${doener.ort}) - Durchschnitt: ${(Object.values(doener.durchschnitt).reduce((sum, val) => sum + parseFloat(val), 0) / Object.values(doener.durchschnitt).length).toFixed(2)}</li>
                    `).join('')}
                </ul>
            `;
        } else {
            besteDoenerContainer.innerHTML = '<p>Keine Bewertungen für Döner verfügbar.</p>';
        }
  
        // Schritt 3: Besten 3 Biere anzeigen
        if (data.filter(item => item.produktart === 'Bier').length > 0) {
            const besteBiere = data.filter(item => item.produktart === 'Bier')
                .sort((a, b) => {
                    const averageA = Object.values(a.durchschnitt).reduce((sum, val) => sum + parseFloat(val), 0) / Object.values(a.durchschnitt).length;
                    const averageB = Object.values(b.durchschnitt).reduce((sum, val) => sum + parseFloat(val), 0) / Object.values(b.durchschnitt).length;
                    return averageB - averageA; // absteigend sortieren
                }).slice(0, 3);

            besteBiereContainer.innerHTML = `
                <h3>Top 3 Biere</h3>
                <ul>
                    ${besteBiere.map((bier, index) => `
                        <li>${index + 1}. ${bier.produkt} (${bier.ort}) - Durchschnitt: ${(Object.values(bier.durchschnitt).reduce((sum, val) => sum + parseFloat(val), 0) / Object.values(bier.durchschnitt).length).toFixed(2)}</li>
                    `).join('')}
                </ul>
            `;
        } else {
            besteBiereContainer.innerHTML = '<p>Keine Bewertungen für Biere verfügbar.</p>';
        }
    }
  
  
    window.showProduktAuswahl = showProduktAuswahl;
    window.showStartPage = showStartPage;

    // Startseite anzeigen beim Laden
    showStartPage();
});
  