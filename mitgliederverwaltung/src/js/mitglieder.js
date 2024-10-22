// Globale Variablen
let mitglieder = [];
let bearbeitungsIndex = null; // Verfolgt, ob ein Mitglied bearbeitet wird

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM vollständig geladen");

    // Lade Mitglieder-Daten (falls vorhanden)
    ladeMitglieder();

    // Event Listener für das Formular und den Button zum Hinzufügen eines neuen Mitglieds
    const mitgliedFormPopup = document.getElementById('mitgliedFormPopup');
    const neuesMitgliedButton = document.getElementById('neuesMitgliedButton');

    if (mitgliedFormPopup && neuesMitgliedButton) {
        console.log("Mitgliedsformular und Button gefunden");

        // Event Listener für das Speichern des neuen Mitglieds
        mitgliedFormPopup.addEventListener('submit', neuesMitgliedSpeichern);

        // Event Listener für das Öffnen des Pop-ups beim Klicken auf den Button
        neuesMitgliedButton.addEventListener('click', () => {
            bearbeitungsIndex = null; // Reset, da ein neues Mitglied hinzugefügt wird
            console.log("Neues Mitglied Button geklickt");
            oeffnePopup('Neues Mitglied hinzufügen', 'Hinzufügen');
        });
    } else {
        console.error("Mitgliedsformular oder Button zum Hinzufügen eines neuen Mitglieds nicht gefunden");
    }
});

// Funktion zum Öffnen des Pop-ups
function oeffnePopup(titel, speicherButtonText, mitglied = null) {
    console.log("Pop-up wird geöffnet");
    document.getElementById('popupTitel').innerText = titel;
    
    document.getElementById('mitgliedPopup').style.display = 'block';

    // Felder leeren, wenn ein neues Mitglied hinzugefügt wird
    if (mitglied === null) {
        document.getElementById('vornamePopup').value = '';
        document.getElementById('namePopup').value = '';
        document.getElementById('geburtsdatumPopup').value = '';
        document.getElementById('strassePopup').value = '';
        document.getElementById('hausnummerPopup').value = '';
        document.getElementById('plzPopup').value = '';
        document.getElementById('ortPopup').value = '';
        document.getElementById('eintrittsdatumPopup').value = '';

    } else {
        // Felder mit den vorhandenen Daten füllen, wenn ein Mitglied bearbeitet wird
        document.getElementById('vornamePopup').value = mitglied.vorname;
        document.getElementById('namePopup').value = mitglied.name;
        document.getElementById('geburtsdatumPopup').value = mitglied.geburtsdatum;
        document.getElementById('strassePopup').value = mitglied.wohnort.strasse;
        document.getElementById('hausnummerPopup').value = mitglied.wohnort.hausnummer;
        document.getElementById('plzPopup').value = mitglied.wohnort.plz;
        document.getElementById('ortPopup').value = mitglied.wohnort.ort;
        document.getElementById('eintrittsdatumPopup').value = mitglied.eintrittsdatum;
    }
}


// Funktion zum Schließen des Pop-ups
function schliessePopup() {
    console.log("Pop-up wird geschlossen");
    document.getElementById('mitgliedPopup').style.display = 'none';
}

// Funktion zum Speichern eines neuen Mitglieds
function neuesMitgliedSpeichern(event) {
    event.preventDefault(); // Verhindert das Neuladen der Seite

    const mitglied = {
        vorname: document.getElementById('vornamePopup').value,
        name: document.getElementById('namePopup').value,
        geburtsdatum: document.getElementById('geburtsdatumPopup').value,
        wohnort: {
            strasse: document.getElementById('strassePopup').value,
            hausnummer: document.getElementById('hausnummerPopup').value,
            plz: document.getElementById('plzPopup').value,
            ort: document.getElementById('ortPopup').value,
        },
        eintrittsdatum: document.getElementById('eintrittsdatumPopup').value,
    };

    if (bearbeitungsIndex === null) {
        // Neues Mitglied hinzufügen
        mitglieder.push(mitglied);
        console.log("Neues Mitglied hinzugefügt:", mitglied);
    } else {
        // Vorhandenes Mitglied aktualisieren
        mitglieder[bearbeitungsIndex] = mitglied;
        bearbeitungsIndex = null;
        console.log("Mitglied aktualisiert:", mitglied);
    }

    speichereMitglieder();
    aktualisiereMitgliederTabelle();
    schliessePopup();
}

// Funktion zum Laden der Mitglieder aus dem localStorage
function ladeMitglieder() {
    mitglieder = JSON.parse(localStorage.getItem('mitglieder')) || [];
    aktualisiereMitgliederTabelle();
}

// Funktion zum Speichern der Mitglieder im localStorage
function speichereMitglieder() {
    localStorage.setItem('mitglieder', JSON.stringify(mitglieder));
}

//<td>${mitglied.geburtsdatum} (${alter} Jahre)</td>
//<td>${mitglied.wohnort.strasse} ${mitglied.wohnort.hausnummer}, ${mitglied.wohnort.plz} ${mitglied.wohnort.ort}</td>
//<td>${mitglied.eintrittsdatum} (seit ${eintritt} Jahre)</td>

// Funktion zur Aktualisierung der Mitgliederliste in der Tabelle
function aktualisiereMitgliederTabelle() {
    const tbody = document.querySelector('#mitgliederTabelle tbody');
    tbody.innerHTML = '';

    mitglieder.sort((a, b) => a.name.localeCompare(b.name)); // Alphabetische Sortierung nach Name

    mitglieder.forEach((mitglied, index) => {
        const alter = berechneAlter(mitglied.geburtsdatum);
        const eintritt = berechneEintritt(mitglied.eintrittsdatum);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${mitglied.vorname}</td>
            <td>${mitglied.name}</td>

            <td class="aktionen">
                <div></div>
                <button onclick="bearbeiteMitglied(${index})" class="mitglied-bearbeiten"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 24 24">
                <path d="M 18.414062 2 C 18.158062 2 17.902031 2.0979687 17.707031 2.2929688 L 15.707031 4.2929688 L 14.292969 5.7070312 L 3 17 L 3 21 L 7 21 L 21.707031 6.2929688 C 22.098031 5.9019687 22.098031 5.2689063 21.707031 4.8789062 L 19.121094 2.2929688 C 18.926094 2.0979687 18.670063 2 18.414062 2 z M 18.414062 4.4140625 L 19.585938 5.5859375 L 18.292969 6.8789062 L 17.121094 5.7070312 L 18.414062 4.4140625 z M 15.707031 7.1210938 L 16.878906 8.2929688 L 6.171875 19 L 5 19 L 5 17.828125 L 15.707031 7.1210938 z"></path>
            </svg></button>
                <button onclick="loescheMitglied(${index})" class="mitglied-löschen"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 64 64">
                <path d="M 28 11 C 26.895 11 26 11.895 26 13 L 26 14 L 13 14 C 11.896 14 11 14.896 11 16 C 11 17.104 11.896 18 13 18 L 14.160156 18 L 16.701172 48.498047 C 16.957172 51.583047 19.585641 54 22.681641 54 L 41.318359 54 C 44.414359 54 47.041828 51.583047 47.298828 48.498047 L 49.839844 18 L 51 18 C 52.104 18 53 17.104 53 16 C 53 14.896 52.104 14 51 14 L 38 14 L 38 13 C 38 11.895 37.105 11 36 11 L 28 11 z M 18.173828 18 L 45.828125 18 L 43.3125 48.166016 C 43.2265 49.194016 42.352313 50 41.320312 50 L 22.681641 50 C 21.648641 50 20.7725 49.194016 20.6875 48.166016 L 18.173828 18 z"></path>
                </svg></button>
                <div></div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Funktion zum Bearbeiten eines Mitglieds
function bearbeiteMitglied(index) {
    const mitglied = mitglieder[index];
    bearbeitungsIndex = index;
    oeffnePopup('Mitglied bearbeiten', 'Speichern', mitglied);
}

// Funktion zum Löschen eines Mitglieds
function loescheMitglied(index) {
    if (confirm('Möchten Sie dieses Mitglied wirklich löschen?')) {
        mitglieder.splice(index, 1);
        speichereMitglieder();
        aktualisiereMitgliederTabelle();
    }
}

// Funktion zum Berechnen des Alters basierend auf dem Geburtsdatum
function berechneAlter(geburtsdatum) {
    const geburtsdatumObj = new Date(geburtsdatum);
    const differenz = Date.now() - geburtsdatumObj.getTime();
    const alterDatum = new Date(differenz);
    return Math.abs(alterDatum.getUTCFullYear() - 1970);
}

function berechneEintritt(eintrittsdatum) {
    const eintrittsdatumObj = new Date(eintrittsdatum);
    const differenz = Date.now() - eintrittsdatumObj.getTime();
    const eintrittDatum = new Date(differenz);
    return Math.abs(eintrittDatum.getUTCFullYear() - 1970);
}

