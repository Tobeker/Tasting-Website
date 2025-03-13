const app = document.getElementById('app');

let userName = '';
let selectedProduct = '';

const bewertungskriterien = {
    "Döner": [
      { name: "brot", label: "Brot" },
      { name: "fleisch", label: "Fleisch" },
      { name: "gemüse", label: "Gemüse" },
      { name: "sossen", label: "Soßen" },
      { name: "preis", label: "Preis-Leistung" },
      { name: "aussehen", label: "Aussehen" }
    ],
    "Bier": [
      { name: "schaum", label: "Schaum" },
      { name: "geruch", label: "Geruch" },
      { name: "geschmack", label: "Geschmack" },
      { name: "preis", label: "Preis" }
    ]
};
  

// Dummy Daten für Dropdowns (können später per API kommen)
const orte = ['Schafstädt King-Döner', 'Bad Lauchstädt Bosporos', 'Merseburg Star-Döner', 'Bier'];
const produkte = {
    Döner: ['Döner', 'Dürüm', 'Döner-Teller'],
    Bier: ['Ur-Krostitzer', 'Becks', 'Veltins', 'Spaten']
};

// Startseite
function showLoginPage() {
    app.innerHTML = `
        <h1>Willkommen!</h1>
        <label for="name">Bitte gib deinen Namen ein:</label>
        <input type="text" id="name" placeholder="Dein Name" />
        <button onclick="handleLogin()">Weiter</button>
        <button onclick="showAuswertung()">Zur Auswertung</button>
    `;
}

function handleLogin() {
    const nameInput = document.getElementById('name');
    userName = nameInput.value.trim();
    if (userName === '') {
        alert('Bitte gib deinen Namen ein!');
        return;
    }
    showProductSelection();
}

// Produktwahl
function showProductSelection() {
    app.innerHTML = `
        <h2>Hallo ${userName}!</h2>
        <p>Was möchtest du bewerten?</p>
        <button onclick="handleProductSelection('Döner')">Döner</button>
        <button onclick="handleProductSelection('Bier')">Bier</button>
        <button onclick="showLoginPage()">Zurück</button>
    `;
}

function handleProductSelection(product) {
    selectedProduct = product;
    showBewertungForm();
}

// Bewertungsformular alt
/*function showBewertungForm() {
    const ortOptions = orte.map(ort => `<option value="${ort}">${ort}</option>`).join('');
    const produktOptions = produkte[selectedProduct].map(prod => `<option value="${prod}">${prod}</option>`).join('');

    app.innerHTML = `
        <h2>${selectedProduct} bewerten</h2>
        <label for="ort">Ort:</label>
        <select id="ort">${ortOptions}</select>

        <label for="produkt">Produkt:</label>
        <select id="produkt">${produktOptions}</select>

        <label for="brot">Brot (1-10):</label>
        <input type="number" id="geschmack" min="1" max="10" />

        <label for="fleisch">Fleisch (1-10):</label>
        <input type="number" id="geschmack" min="1" max="10" />

        <label for="gemüse">Gemüse (1-10):</label>
        <input type="number" id="geschmack" min="1" max="10" />

        <label for="sossen">Soßen (1-10):</label>
        <input type="number" id="geschmack" min="1" max="10" />

        <label for="preis">Preis-Leistung (1-10):</label>
        <input type="number" id="preis" min="1" max="10" />

        <label for="aussehen">Aussehen (1-10):</label>
        <input type="number" id="aussehen" min="1" max="10" />

        <label for="bild">Bild hochladen (optional):</label>
        <input type="file" id="bild" accept="image/*" />

        <button onclick="submitBewertung()">Bewertung abschicken</button>
        <button onclick="showProductSelection()">Zurück</button>
    `;
}*/

function showBewertungsformular(produktart, produkt) {
    const form = document.createElement('form');
    form.id = "bewertungForm";
    form.onsubmit = submitBewertung;
  
    form.innerHTML = `
      <h2>Bewertung abgeben für ${produktart}: ${produkt}</h2>
      <label for="ort">Ort:</label>
      <input type="text" id="ort" name="ort" required>
  
      <label for="produktName">Produkt:</label>
      <input type="text" id="produktName" name="produktName" value="${produkt}" required>
    `;
  
    // Kriterien dynamisch hinzufügen
    bewertungskriterien[produktart].forEach(kriterium => {
      form.innerHTML += `
        <label for="${kriterium.name}">${kriterium.label} (1-10):</label>
        <input type="number" id="${kriterium.name}" name="${kriterium.name}" min="1" max="10" required>
      `;
    });
  
    form.innerHTML += `
      <label for="bild">Bild hochladen:</label>
      <input type="file" id="bild" name="bild" accept="image/*">
  
      <button type="submit">Bewertung absenden</button>
    `;
  
    appContainer.innerHTML = '';
    appContainer.appendChild(form);
  }
  

function submitBewertung() {
    const ort = document.getElementById('ort').value;
    const produkt = document.getElementById('produkt').value;
    const brot = document.getElementById('brot').value;
    const fleisch = document.getElementById('fleisch').value;
    const gemüse = document.getElementById('gemüse').value;
    const sossen = document.getElementById('sossen').value;
    const preis = document.getElementById('preis').value;
    const aussehen = document.getElementById('aussehen').value;
    const bild = document.getElementById('bild').files[0];

    if (!brot || !fleisch || !gemüse || !sossen || !preis || !aussehen) {
        alert('Bitte alle Bewertungen ausfüllen!');
        return;
    }

    const formData = new FormData();
    formData.append('name', userName);
    formData.append('produktart', selectedProduct);
    formData.append('ort', ort);
    formData.append('produkt', produkt);
    formData.append('brot', brot);
    formData.append('fleisch', fleisch);
    formData.append('gemüse', gemüse);
    formData.append('sossen', sossen);
    formData.append('preis', preis);
    formData.append('aussehen', aussehen);
    if (bild) {
        formData.append('bild', bild);
    }

    fetch('/api/bewertung', {
        method: 'POST',
        body: formData
    }).then(response => {
        if (response.ok) {
            alert('Bewertung gespeichert!');
            showProductSelection();
        } else {
            alert('Fehler beim Speichern!');
        }
    });
}

let chartInstance = null;

async function fetchAuswertungen() {
    const ort = document.getElementById('filter-ort')?.value || '';
    const produkt = document.getElementById('filter-produkt')?.value || '';

    const query = new URLSearchParams();
    if (ort) query.append('ort', ort);
    if (produkt) query.append('produkt', produkt);

    const response = await fetch(`/api/auswertungen?${query.toString()}`);
    const daten = await response.json();

    if (daten.length === 0) {
        alert('Keine Daten gefunden!');
        return;
    }

    renderChart(daten);
}

function renderChart(daten) {
    const labels = daten.map(item => `${item.ort} - ${item.produkt}`);
    const avgGesamt = daten.map(item => (
        ((item.avg_brot + item.avg_fleisch + item.avg_gemüse + item.avg_sossen + item.avg_preis + item.avg_aussehen) / 6).toFixed(2)
    ));

    const ctx = document.getElementById('auswertungChart').getContext('2d');

    // Vorherige Chart Instanz zerstören, falls vorhanden
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ø Bewertung',
                data: avgGesamt,
                backgroundColor: '#333',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const item = daten[context.dataIndex];
                            return [
                                `Ø Brot: ${parseFloat(item.avg_brot).toFixed(2)}`,
                                `Ø Fleisch: ${parseFloat(item.avg_fleisch).toFixed(2)}`,
                                `Ø Gemüse: ${parseFloat(item.avg_gemüse).toFixed(2)}`,
                                `Ø Soßen: ${parseFloat(item.avg_sossen).toFixed(2)}`,
                                `Ø Preis-Leistung: ${parseFloat(item.avg_preis).toFixed(2)}`,
                                `Ø Aussehen: ${parseFloat(item.avg_aussehen).toFixed(2)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });
}


function showAuswertung() {
    app.innerHTML = `
        <h2>Auswertung</h2>

        <label for="filter-ort">Filter Ort:</label>
        <select id="filter-ort">
            <option value="">Alle</option>
            ${orte.map(ort => `<option value="${ort}">${ort}</option>`).join('')}
        </select>

        <label for="filter-produkt">Filter Produkt:</label>
        <select id="filter-produkt">
            <option value="">Alle</option>
            ${[...produkte['Döner'], ...produkte['Bier']].map(prod => `<option value="${prod}">${prod}</option>`).join('')}
        </select>

        <button onclick="fetchAuswertungen()">Filtern</button>

        <canvas id="auswertungChart" width="400" height="300"></canvas>

        <button onclick="showLoginPage()">Zurück</button>
    `;

    // Direkt laden, ohne Filter
    fetchAuswertungen();
}

// Start mit Login-Seite
showLoginPage();
