document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app');
  
    // Dynamische Kriterien-Definition
    const bewertungskriterien = {
      'Döner': [
        { name: 'brot', label: 'Brot' },
        { name: 'fleisch', label: 'Fleisch' },
        { name: 'gemüse', label: 'Gemüse' },
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

      document.getElementById('produktForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const produkt = document.getElementById('produkt').value.trim();
        const ort = produktart === 'Döner' ? document.getElementById('ort').value.trim() : '';
        if (produkt && (produktart !== 'Döner' || ort)) {
          showBewertungsformular(produktart, produkt, ort);
        } else {
            alert('Bitte wähle ein Produkt und einen Ort (bei Döner) aus.')
        }
      });
    };
  
    // Bewertungsformular anzeigen
    function showBewertungsformular(produktart, produkt, ort) {
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
                html += `
                    <input type="radio" id="${kriterium.name}-${i}" name="${kriterium.name}" value="${i}" required>
                    <label for="${kriterium.name}-${i}" class="rating-box">${i}</label>
                `;
            }
  
            html += `</div></div>`;
        });
  
        // Bild-Upload
        html += `
            <label for="bild">Bild hochladen (optional):</label>
            <input type="file" id="bild" name="bild" accept="image/*">
        `;
  
        html += `
            <button type="submit">Bewertung absenden</button>
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
  
    function renderAuswertung(bewertungen) {
        appContainer.innerHTML = `
          <h2>Auswertung</h2>
          <button onclick="showStartPage()">Zurück</button>
          <div id="charts"></div>
        `;
      
        const chartsContainer = document.getElementById('charts');
      
        if (bewertungen.length === 0) {
          chartsContainer.innerHTML = '<p>Noch keine Bewertungen vorhanden.</p>';
          return;
        }
      
        bewertungen.forEach((item, index) => {
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
      
          // ➡️ Schritt 1: Gesamtdurchschnitt berechnen
          const total = dataValues.reduce((sum, val) => sum + val, 0);
          const average = (dataValues.length > 0) ? (total / dataValues.length) : 0;
      
          // ➡️ Schritt 2: Label + Wert hinzufügen
          labels.push('Gesamtbewertung');
          dataValues.push(parseFloat(average.toFixed(2))); // Optional auf 2 Nachkommastellen runden
      
          // ➡️ Schritt 3: Chart.js Balkendiagramm erstellen
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
    }
      
  
  
    window.showProduktAuswahl = showProduktAuswahl;
    window.showStartPage = showStartPage;

    // Startseite anzeigen beim Laden
    showStartPage();
});
  