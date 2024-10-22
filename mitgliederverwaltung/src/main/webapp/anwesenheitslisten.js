// Globale Variablen für Anwesenheitslisten und Mitglieder
let anwesenheitslisten = [];
let mitglieder = []; // Diese Variable muss mit den vorhandenen Mitgliedern gefüllt werden
let aktivitaeten = []; // Aktivitäten dynamisch aus localStorage laden

const dauerOptionen = ["0,5", "1", "1,5", "2", "2,5", "3", "3,5", "4", "4,5", "5", "5,5", "6", "6,5", "7", "7,5", "8", "8,5", "9", "9,5", "10"];

// Temporäre Variablen für Aktivität und Dauer
let temporaereAktivitaet = '';
let temporaereDauer = '';

document.addEventListener('DOMContentLoaded', () => {
    ladeMitglieder();
    ladeAktivitaetenUndAnwesenheitslisten();

    const neueAnwesenheitslisteButton = document.getElementById('neueAnwesenheitslisteButton');
    const aktivitaetenVerwaltenButton = document.getElementById('aktivitaetenVerwaltenButton');
    const popup = document.getElementById('aktivitaetenPopup');
    const closePopup = document.getElementById('closePopup');

    if (neueAnwesenheitslisteButton) {
        neueAnwesenheitslisteButton.addEventListener('click', erstelleAnwesenheitsliste);
    }

    // Öffnen des Popups bei Klick auf "Aktivitäten verwalten"
    if (aktivitaetenVerwaltenButton) {
        aktivitaetenVerwaltenButton.addEventListener('click', () => {
            popup.style.display = 'block';
        });
    }

    // Schließen des Popups bei Klick auf das Schließen-Symbol
    if (closePopup) {
        closePopup.addEventListener('click', () => {
            popup.style.display = 'none';
        });
    }

    // Schließen des Popups bei Klick außerhalb des Popups
    window.addEventListener('click', (event) => {
        if (event.target == popup) {
            popup.style.display = 'none';
        }
    });
});

// Funktion zum Laden der Aktivitäten und dann der Anwesenheitslisten
function ladeAktivitaetenUndAnwesenheitslisten() {
    ladeAktivitaeten(); // Aktivitäten laden
    ladeAnwesenheitslisten(); // Nach dem Laden der Aktivitäten, Anwesenheitslisten anzeigen
}

// Funktion zum Erstellen einer neuen Anwesenheitsliste
function erstelleAnwesenheitsliste() {
    const heute = new Date().toLocaleDateString('de-DE');
    
    if (anwesenheitslisten.some((liste) => liste.datum === heute)) {
        alert('Es wurde heute bereits eine Anwesenheitsliste erstellt.');
        return;
    }

    const neueListe = {
        datum: heute,
        eintraege: mitglieder.map((mitglied) => ({
            mitglied,
            status: 'abwesend', 
        })),
        aktivitaet: '', // Aktivität wird später ausgewählt
        dauer: '',      // Dauer wird später ausgewählt
    };

    anwesenheitslisten.unshift(neueListe);
    speichereAnwesenheitslisten();
    zeigeAlleAnwesenheitslisten();
    bearbeiteAnwesenheitsliste(0); // Bearbeitungsmodus für die neue Liste starten
}

// Funktion zum Speichern der Anwesenheitslisten im localStorage
function speichereAnwesenheitslisten() {
    localStorage.setItem('anwesenheitslisten', JSON.stringify(anwesenheitslisten));
}

// Funktion zum Laden der Anwesenheitslisten aus dem localStorage
function ladeAnwesenheitslisten() {
    anwesenheitslisten = JSON.parse(localStorage.getItem('anwesenheitslisten')) || [];
    zeigeAlleAnwesenheitslisten();
}

// Funktion zum Laden der Mitglieder aus dem localStorage oder einer anderen Quelle
function ladeMitglieder() {
    mitglieder = JSON.parse(localStorage.getItem('mitglieder')) || [];
    if (mitglieder.length === 0) {
        console.warn("Keine Mitglieder gefunden. Füge Mitglieder hinzu, bevor du Anwesenheitslisten erstellst.");
    }
}

// Funktion zum Anzeigen aller Anwesenheitslisten
function zeigeAlleAnwesenheitslisten() {
    const container = document.getElementById('anwesenheitslisteInhalt');
    container.innerHTML = '';
    
    anwesenheitslisten.forEach((liste, index) => {
        const div = document.createElement('div');
        div.innerHTML = `
            <h3 onclick="toggleAnwesenheitsDetails(${index})">
                Anwesenheitsliste vom ${liste.datum} – Aktivität: ${liste.aktivitaet || "Noch nicht ausgewählt"} ${"(" + liste.dauer + " Std.)"}
                <svg style="align-self: center" id="dropdown-icon-${index}" style="transform: rotate(0deg);" xmlns="http://www.w3.org/2000/svg" width="25px" fill="white" height="25px" viewBox="0 0 24 24">
                <rect x="0" fill="none" width="24" height="24"/>
                    <g>
                        <path d="M7 10l5 5 5-5"/>
                    </g>
                </svg>
            </h3>
            <div id="anwesenheitsliste-${index}" style="display:none; padding-left:20px">
                <div class="aktivitätUndDauer">
                    <label for="aktivitaet-${index}">Aktivität: </label>
                    <select id="aktivitaet-${index}" disabled onchange="aendernAktivitaetTemporar(${index}, this.value)">
                        <option value="">Bitte wählen</option>
                        ${aktivitaeten.map((aktivitaet) => `<option value="${aktivitaet}" ${liste.aktivitaet === aktivitaet ? 'selected' : ''}>${aktivitaet}</option>`).join('')}
                    </select>
                    <label for="dauer-${index}">Dauer: </label>
                    <select id="dauer-${index}" disabled onchange="aendernDauerTemporar(${index}, this.value)">
                        <option value="">Bitte wählen</option>
                        ${dauerOptionen.map((dauer) => `<option value="${dauer}" ${liste.dauer === dauer ? 'selected' : ''}>${dauer}</option>`).join('')}
                    </select>
                </div>
                <h3>Mitglieder</h3>
                <div id="anwesenheitslisteEintraege-${index}" class="anwesenheitslisteEintraege"></div>
                <div class="bearbeitenUndLöschen">
                    <button id="bearbeiten-${index}" onclick="bearbeiteAnwesenheitsliste(${index})" class="small-button">Bearbeiten</button>
                    <button id="speichern-${index}" style="display:none" onclick="speichereAnwesenheitsliste(${index})" class="small-button-erstellen">Speichern</button>
                    <button onclick="loescheAnwesenheitsliste(${index})" class="small-button-delete">Löschen</button>
                </div>
            </div>
        `;
        container.appendChild(div);
        zeigeAnwesenheitsliste(liste, index);
    });
}

// Funktion zum Ein- und Ausklappen der Anwesenheitsdetails
function toggleAnwesenheitsDetails(index) {
    const details = document.getElementById(`anwesenheitsliste-${index}`);
    const icon = document.getElementById(`dropdown-icon-${index}`); 

    if (details.style.display === 'none' || details.style.display === '') {
        details.style.display = 'block';
        icon.style.transform = 'rotate(180deg)'; 
    } else {
        details.style.display = 'none';
        icon.style.transform = 'rotate(0deg)'; 
    }
}

// Funktion zum Temporären Ändern der Aktivität
function aendernAktivitaetTemporar(index, wert) {
    temporaereAktivitaet = wert;
}

// Funktion zum Temporären Ändern der Dauer
function aendernDauerTemporar(index, wert) {
    temporaereDauer = wert;
}

// Funktion zum Bearbeiten der Anwesenheitsliste
function bearbeiteAnwesenheitsliste(index) {
    document.getElementById(`bearbeiten-${index}`).style.display = 'none';
    document.getElementById(`speichern-${index}`).style.display = 'inline';

    // Setze die temporären Werte auf die aktuellen
    temporaereAktivitaet = anwesenheitslisten[index].aktivitaet;
    temporaereDauer = anwesenheitslisten[index].dauer;

    // Aktivieren der Dropdowns für Aktivität und Dauer
    document.getElementById(`aktivitaet-${index}`).disabled = false;
    document.getElementById(`dauer-${index}`).disabled = false;

    anwesenheitslisten[index].eintraege.forEach((eintrag, eintragIndex) => {
        document.getElementById(`status-${index}-${eintragIndex}`).disabled = false;
    });
}

// Funktion zum Speichern der bearbeiteten Anwesenheitsliste
function speichereAnwesenheitsliste(index) {
    document.getElementById(`bearbeiten-${index}`).style.display = 'inline';
    document.getElementById(`speichern-${index}`).style.display = 'none';

    // Übernehme die temporären Änderungen
    anwesenheitslisten[index].aktivitaet = temporaereAktivitaet;
    anwesenheitslisten[index].dauer = temporaereDauer;

    // Deaktivieren der Dropdowns für Aktivität und Dauer
    document.getElementById(`aktivitaet-${index}`).disabled = true;
    document.getElementById(`dauer-${index}`).disabled = true;

    anwesenheitslisten[index].eintraege.forEach((eintrag, eintragIndex) => {
        document.getElementById(`status-${index}-${eintragIndex}`).disabled = true;
    });

    speichereAnwesenheitslisten();
    zeigeAlleAnwesenheitslisten(); // Aktualisiere die Anzeige des Titels
    alert('Anwesenheitsliste wurde gespeichert.');
}

// Funktion zum Löschen einer Anwesenheitsliste
function loescheAnwesenheitsliste(index) {
    if (confirm('Möchten Sie diese Anwesenheitsliste wirklich löschen?')) {
        anwesenheitslisten.splice(index, 1);
        speichereAnwesenheitslisten();
        zeigeAlleAnwesenheitslisten();
    }
}

// Funktion zum Anzeigen einer Anwesenheitsliste
function zeigeAnwesenheitsliste(liste, index) {
    const container = document.getElementById(`anwesenheitslisteEintraege-${index}`);
    container.innerHTML = '';

    liste.eintraege.forEach((eintrag, eintragIndex) => {
        const div = document.createElement('div');
        div.innerHTML = `
            ${eintrag.mitglied.vorname} ${eintrag.mitglied.name}:
            <select id="status-${index}-${eintragIndex}" disabled onchange="statusAendern(${index}, ${eintragIndex}, this.value)">
                <option value="anwesend" ${eintrag.status === 'anwesend' ? 'selected' : ''}>Anwesend</option>
                <option value="entschuldigt" ${eintrag.status === 'entschuldigt' ? 'selected' : ''}>Entschuldigt</option>
                <option value="abwesend" ${eintrag.status === 'abwesend' ? 'selected' : ''}>Abwesend</option>
            </select>
        `;
        container.appendChild(div);
    });
}

// Funktion zum Ändern des Status eines Mitglieds in der Anwesenheitsliste
function statusAendern(listeIndex, eintragIndex, neuerStatus) {
    anwesenheitslisten[listeIndex].eintraege[eintragIndex].status = neuerStatus;
    speichereAnwesenheitslisten();
}

// Aktivitätenverwaltung

// Funktion zum Laden der Aktivitäten aus dem localStorage
function ladeAktivitaeten() {
    aktivitaeten = JSON.parse(localStorage.getItem('aktivitaeten')) || ["Meeting", "Workshop", "Training", "Event"];
    zeigeAktivitaetenVerwaltung(); // Sicherstellen, dass die Verwaltung sofort angezeigt wird
}

// Funktion zum Speichern der Aktivitäten im localStorage
function speichereAktivitaeten() {
    localStorage.setItem('aktivitaeten', JSON.stringify(aktivitaeten));
}

// Funktion zum Hinzufügen einer neuen Aktivität
function hinzufuegenAktivitaet() {
    const neueAktivitaet = document.getElementById('neueAktivitaet').value.trim();
    if (neueAktivitaet && !aktivitaeten.includes(neueAktivitaet)) {
        aktivitaeten.push(neueAktivitaet);
        speichereAktivitaeten();
        zeigeAktivitaetenVerwaltung();
        zeigeAlleAnwesenheitslisten(); // Anwesenheitslisten-Selects neu rendern
    }
    document.getElementById('neueAktivitaet').value = '';
}

// Funktion zum Löschen einer Aktivität
function loescheAktivitaet(index) {
    aktivitaeten.splice(index, 1);
    speichereAktivitaeten();
    zeigeAktivitaetenVerwaltung();
    zeigeAlleAnwesenheitslisten(); // Anwesenheitslisten-Selects neu rendern
}

// Funktion zum Anzeigen der Aktivitätenverwaltung
function zeigeAktivitaetenVerwaltung() {
    const aktivitaetenListe = document.getElementById('aktivitaetenListe');
    aktivitaetenListe.innerHTML = '';
    
    aktivitaeten.forEach((aktivitaet, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${aktivitaet} <button onclick="loescheAktivitaet(${index})" class="small-button-delete">Löschen</button>
        `;
        aktivitaetenListe.appendChild(li);
    });
}

// Funktion zum Hinzufügen einer neuen Aktivität
function hinzufuegenAktivitaet() {
    const neueAktivitaet = document.getElementById('neueAktivitaet').value.trim();

    // Überprüfen, ob die Aktivität bereits existiert
    if (neueAktivitaet && !aktivitaeten.includes(neueAktivitaet)) {
        aktivitaeten.push(neueAktivitaet);
        speichereAktivitaeten();
        zeigeAktivitaetenVerwaltung();
        zeigeAlleAnwesenheitslisten(); // Anwesenheitslisten-Selects neu rendern
    } else {
        alert('Diese Aktivität existiert bereits oder der Name ist leer.');
    }

    document.getElementById('neueAktivitaet').value = '';
}

