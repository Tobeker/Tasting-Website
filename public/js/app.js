document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app');
  
    // Dynamische Kriterien-Definition
    const bewertungskriterien = {
      'Döner': [
        { name: 'brot', label: 'Brot' },
        { name: 'fleisch', label: 'Gleisch' },
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
          <label for="produkt">Produktname:</label>
          <input type="text" id="produkt" name="produkt" required>
  
          <label for="ort">Ort:</label>
          <input type="text" id="ort" name="ort" required>
  
          <button type="submit">Weiter zur Bewertung</button>
        </form>
        <button onclick="showProduktAuswahl()">Zurück</button>
      `;
  
      document.getElementById('produktForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const produkt = document.getElementById('produkt').value.trim();
        const ort = document.getElementById('ort').value.trim();
        if (produkt && ort) {
          showBewertungsformular(produktart, produkt, ort);
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
          <label for="${kriterium.name}">${kriterium.label} (1-10):</label>
          <input type="number" id="${kriterium.name}" name="${kriterium.name}" min="1" max="10" required>
        `;
      });
  
      // Bild-Upload
      html += `
        <label for="bild">Bild hochladen (optional):</label>
        <input type="file" id="bild" name="bild" accept="image/*">
      `;
  
      html += `<button type="submit">Bewertung absenden</button>`;
      html += `<button type="button" onclick="showProduktAuswahl()">Zurück</button>`;
  
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
  
    // Darstellung der Auswertung
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
  
      // Beispiel-Darstellung
      bewertungen.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('auswertung-item');
        div.innerHTML = `
          <h3>${item.produktart} - ${item.produkt} (${item.ort})</h3>
          <p>Durchschnittswerte:</p>
          <pre>${JSON.stringify(item.durchschnitt, null, 2)}</pre>
        `;
        chartsContainer.appendChild(div);
      });
    }
  
    // Startseite anzeigen beim Laden
    showStartPage();
  });
  