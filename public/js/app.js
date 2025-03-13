const app = document.getElementById('app');

let userName = '';
let selectedProduct = '';

// Dummy Daten für Dropdowns (können später per API kommen)
const orte = ['Berlin', 'Hamburg', 'München'];
const produkte = {
    Döner: ['Mustafa\'s', 'Imren', 'Kotti'],
    Bier: ['Augustiner', 'Becks', 'Berliner Kindl']
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

// Bewertungsformular
function showBewertungForm() {
    const ortOptions = orte.map(ort => `<option value="${ort}">${ort}</option>`).join('');
    const produktOptions = produkte[selectedProduct].map(prod => `<option value="${prod}">${prod}</option>`).join('');

    app.innerHTML = `
        <h2>${selectedProduct} bewerten</h2>
        <label for="ort">Ort:</label>
        <select id="ort">${ortOptions}</select>

        <label for="produkt">Produkt:</label>
        <select id="produkt">${produktOptions}</select>

        <label for="geschmack">Geschmack (1-10):</label>
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
}

function submitBewertung() {
    const ort = document.getElementById('ort').value;
    const produkt = document.getElementById('produkt').value;
    const geschmack = document.getElementById('geschmack').value;
    const preis = document.getElementById('preis').value;
    const aussehen = document.getElementById('aussehen').value;
    const bild = document.getElementById('bild').files[0];

    if (!geschmack || !preis || !aussehen) {
        alert('Bitte alle Bewertungen ausfüllen!');
        return;
    }

    const formData = new FormData();
    formData.append('name', userName);
    formData.append('produktart', selectedProduct);
    formData.append('ort', ort);
    formData.append('produkt', produkt);
    formData.append('geschmack', geschmack);
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

// Auswertungsseite (Platzhalter)
function showAuswertung() {
    app.innerHTML = `
        <h2>Auswertung</h2>
        <p>(Hier kommt später das Balkendiagramm!)</p>
        <button onclick="showLoginPage()">Zurück</button>
    `;

    // TODO: Chart.js Diagramm nach Backend-Integration
}

// Start mit Login-Seite
showLoginPage();
