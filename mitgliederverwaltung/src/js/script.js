// Globale Variablen
let mitglieder = [];
let anwesenheitslisten = [];
let gruppen = [];
let bearbeitungsIndex = null; // Variable, um zu verfolgen, ob ein Mitglied oder eine Gruppe bearbeitet wird

// Pop-up Variablen
let popupTitel = document.getElementById('popupTitel');
let popupSpeichernButton = document.getElementById('popupSpeichern');
let mitgliedFormPopup = document.getElementById('mitgliedFormPopup');
let gruppenTypSelect = document.getElementById('gruppenTyp');
let positionenContainer = document.getElementById('positionenContainer');
let mitgliederZuordnungContainer = document.getElementById('mitgliederZuordnungContainer');
let mitgliederZuweisen = document.getElementById('mitgliederZuweisen');
let gruppenNameInput = document.getElementById('gruppenName');

// Event Listener beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    ladeMitglieder();
    ladeAnwesenheitslisten();
    ladeGruppen();

    mitgliedFormPopup.addEventListener('submit', neuesMitgliedSpeichern);
    document.getElementById('neuesMitgliedButton').addEventListener('click', () => {
        bearbeitungsIndex = null;
        oeffnePopup('Neues Mitglied hinzufügen', 'Hinzufügen');
    });

    document.getElementById('neueAnwesenheitslisteButton').addEventListener('click', erstelleAnwesenheitsliste);

    document.getElementById('neueGruppeButton').addEventListener('click', () => {
        bearbeitungsIndex = null; // Keine Gruppe wird bearbeitet, es wird eine neue erstellt
        gruppenTypSelect.disabled = false; // Typ-Auswahl für neue Gruppe aktivieren
        gruppenNameInput.value = ''; // Name für neue Gruppe leeren
        resetPositionen(); // Positionen für Wettkampfgruppen leeren
        oeffneGruppePopup('Gruppe erstellen', 'Erstellen', false); // false: es wird keine Wettkampfgruppe bearbeitet
    });

    // Listener für das Speichern der Gruppe
    document.getElementById('gruppeFormPopup').addEventListener('submit', speichereGruppe);

    gruppenTypSelect.addEventListener('change', toggleMitgliederContainer); // Mitglieder-Auswahl steuern
});

// Funktion zum Öffnen des Mitglieder-Pop-ups
function oeffnePopup(titel, speicherButtonText, mitglied = null) {
    document.getElementById('popupTitel').innerText = titel;
    document.getElementById('popupSpeichern').innerText = speicherButtonText;
    document.getElementById('mitgliedPopup').style.display = 'block';

    // Wenn ein Mitglied bearbeitet wird, fülle die Felder mit den vorhandenen Daten
    if (mitglied) {
        document.getElementById('vornamePopup').value = mitglied.vorname;
        document.getElementById('namePopup').value = mitglied.name;
        document.getElementById('geburtsdatumPopup').value = mitglied.geburtsdatum;
        document.getElementById('strassePopup').value = mitglied.wohnort.strasse;
        document.getElementById('hausnummerPopup').value = mitglied.wohnort.hausnummer;
        document.getElementById('plzPopup').value = mitglied.wohnort.plz;
        document.getElementById('ortPopup').value = mitglied.wohnort.ort;
    } else {
        // Felder leeren, wenn ein neues Mitglied hinzugefügt wird
        document.getElementById('vornamePopup').value = '';
        document.getElementById('namePopup').value = '';
        document.getElementById('geburtsdatumPopup').value = '';
        document.getElementById('strassePopup').value = '';
        document.getElementById('hausnummerPopup').value = '';
        document.getElementById('plzPopup').value = '';
        document.getElementById('ortPopup').value = '';
    }
}

// Funktion zum Schließen des Mitglieder-Pop-ups
function schliessePopup() {
    document.getElementById('mitgliedPopup').style.display = 'none';
}

// Tab-Wechsel-Logik
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName('tabcontent');
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    tablinks = document.getElementsByClassName('tablinks');
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
}

// Pop-up für Gruppen öffnen
function oeffneGruppePopup(titel, speicherButtonText, bearbeiteWettkampfgruppe = false) {
    document.getElementById('gruppePopupTitel').innerText = titel;
    document.getElementById('gruppeSpeichern').innerText = speicherButtonText;
    document.getElementById('gruppePopup').style.display = 'block';

    // Positionen-Container nur anzeigen, wenn eine Wettkampfgruppe bearbeitet wird
    if (bearbeiteWettkampfgruppe) {
        togglePositionenContainer(true); // Positionen-Container anzeigen
    } else {
        togglePositionenContainer(false); // Positionen-Container verstecken
    }

    toggleMitgliederContainer(); // Mitglieder-Auswahl immer anzeigen
    zeigeMitgliederZuweisung(); // Zeige die Mitglieder-Auswahl
}

// Pop-up für Gruppen schließen
function schliesseGruppePopup() {
    document.getElementById('gruppePopup').style.display = 'none';
}

// Funktion zum Ein- und Ausblenden der Wettkampfgruppen-Positionen
function togglePositionenContainer(show) {
    if (show) {
        positionenContainer.style.display = 'block';
    } else {
        positionenContainer.style.display = 'none';
    }
}

// Funktion zum Ein- und Ausblenden des Mitglieder-Zuweisung-Containers
function toggleMitgliederContainer() {
    const gruppenTyp = document.getElementById('gruppenTyp').value;
    // Mitglieder-Auswahl wird für alle Gruppen angezeigt (normale und Wettkampfgruppen)
    if (gruppenTyp === 'wettkampf' || gruppenTyp === 'normal') {
        mitgliederZuordnungContainer.style.display = 'block';
    } else {
        mitgliederZuordnungContainer.style.display = 'none';
    }

    // Wenn es eine Wettkampfgruppe ist, zeige den Positionen-Container
    if (gruppenTyp === 'wettkampf') {
        togglePositionenContainer(true);
    } else {
        togglePositionenContainer(false);
    }
}

// Funktion zum Zuweisen von Mitgliedern für alle Gruppen
function zeigeMitgliederZuweisung(ausgewaehlteMitglieder = []) {
    mitgliederZuweisen.innerHTML = '';
    mitglieder.forEach((mitglied) => {
        const nameVollständig = `${mitglied.vorname} ${mitglied.name}`;
        const checked = ausgewaehlteMitglieder.includes(nameVollständig) ? 'checked' : '';
        const div = document.createElement('div');
        div.innerHTML = `<input type="checkbox" id="${nameVollständig}" name="mitglied" value="${nameVollständig}" ${checked}>${nameVollständig}`;
        mitgliederZuweisen.appendChild(div);
    });
}

// Funktion zum Zuweisen der Positionen in einer Wettkampfgruppe
function zeigePositionenZuweisung(ausgewaehlteMitglieder = [], ausgewaehltePositionen = {}) {
    const mitgliederOptionen = ausgewaehlteMitglieder
        .map((mitglied) => `<option value="${mitglied}">${mitglied}</option>`)
        .join('');

    document.getElementById('gruppenführer').innerHTML = `<option value="">Nicht Zugewiesen</option>${mitgliederOptionen}`;
    document.getElementById('maschinist').innerHTML = `<option value="">Nicht Zugewiesen</option>${mitgliederOptionen}`;
    document.getElementById('melder').innerHTML = `<option value="">Nicht Zugewiesen</option>${mitgliederOptionen}`;
    document.getElementById('schlauchTruppFührer').innerHTML = `<option value="">Nicht Zugewiesen</option>${mitgliederOptionen}`;
    document.getElementById('schlauchTruppMann').innerHTML = `<option value="">Nicht Zugewiesen</option>${mitgliederOptionen}`;
    document.getElementById('wasserTruppFührer').innerHTML = `<option value="">Nicht Zugewiesen</option>${mitgliederOptionen}`;
    document.getElementById('wasserTruppMann').innerHTML = `<option value="">Nicht Zugewiesen</option>${mitgliederOptionen}`;
    document.getElementById('angriffsTruppFührer').innerHTML = `<option value="">Nicht Zugewiesen</option>${mitgliederOptionen}`;
    document.getElementById('angriffsTruppMann').innerHTML = `<option value="">Nicht Zugewiesen</option>${mitgliederOptionen}`;

    // Setze die ausgewählten Positionen
    if (ausgewaehltePositionen) {
        Object.keys(ausgewaehltePositionen).forEach((position) => {
            document.getElementById(position).value = ausgewaehltePositionen[position] || '';
        });
    }
}

// Funktion zum Zurücksetzen der Positionen bei der Erstellung einer neuen Gruppe
function resetPositionen() {
    document.getElementById('gruppenführer').innerHTML = `<option value="Gruppenführer Nicht Zugewiesen">Nicht Zugewiesen</option>`;
    document.getElementById('maschinist').innerHTML = `<option value="Maschinist Nicht Zugewiesen">Nicht Zugewiesen</option>`;
    document.getElementById('melder').innerHTML = `<option value="Melder Nicht Zugewiesen">Nicht Zugewiesen</option>`;
    document.getElementById('schlauchTruppFührer').innerHTML = `<option value="Schlauchtrupp Führer Nicht Zugewiesen">Nicht Zugewiesen</option>`;
    document.getElementById('schlauchTruppMann').innerHTML = `<option value="Schlauchtrupp Mann Nicht Zugewiesen">Nicht Zugewiesen</option>`;
    document.getElementById('wasserTruppFührer').innerHTML = `<option value="Wassertrupp Führer Nicht Zugewiesen">Nicht Zugewiesen</option>`;
    document.getElementById('wasserTruppMann').innerHTML = `<option value="Wassertrupp Mann Nicht Zugewiesen">Nicht Zugewiesen</option>`;
    document.getElementById('angriffsTruppFührer').innerHTML = `<option value="Angriffstrupp Führer Nicht Zugewiesen">Nicht Zugewiesen</option>`;
    document.getElementById('angriffsTruppMann').innerHTML = `<option value="Angriffstrupp Mann Nicht Zugewiesen">Nicht Zugewiesen</option>`;
}

// Funktion zum Speichern einer Gruppe (neu oder aktualisiert)
function speichereGruppe(event) {
    event.preventDefault();

    const gruppe = {
        name: document.getElementById('gruppenName').value,
        typ: document.getElementById('gruppenTyp').value, // Jeder Gruppe wird individuell ihr Typ zugewiesen
        mitglieder: Array.from(document.querySelectorAll('input[name="mitglied"]:checked')).map(
            (checkbox) => checkbox.value
        ),
    };

    if (gruppe.typ === 'wettkampf' && gruppe.mitglieder.length > 9) {
        alert('Eine Wettkampfgruppe darf maximal aus 9 Mitgliedern bestehen.');
        return;
    }

    if (gruppe.typ === 'wettkampf') {
        gruppe.positionen = {
            gruppenführer: document.getElementById('gruppenführer').value,
            maschinist: document.getElementById('maschinist').value,
            melder: document.getElementById('melder').value,
            schlauchTruppFührer: document.getElementById('schlauchTruppFührer').value,
            schlauchTruppMann: document.getElementById('schlauchTruppMann').value,
            wasserTruppFührer: document.getElementById('wasserTruppFührer').value,
            wasserTruppMann: document.getElementById('wasserTruppMann').value,
            angriffsTruppFührer: document.getElementById('angriffsTruppFührer').value,
            angriffsTruppMann: document.getElementById('angriffsTruppMann').value,
        };

        // Prüfen, ob alle Positionen nur einmal besetzt sind
        const positionenArray = Object.values(gruppe.positionen).filter(Boolean);
        const uniquePositionen = new Set(positionenArray);
        if (uniquePositionen.size !== positionenArray.length) {
            alert('Jede Position darf nur einmal besetzt werden.');
            return;
        }
    }

    // Wenn bearbeitungsIndex nicht null ist, wird die bestehende Gruppe aktualisiert, andernfalls wird eine neue Gruppe erstellt
    if (bearbeitungsIndex !== null) {
        gruppen[bearbeitungsIndex] = gruppe;
        bearbeitungsIndex = null; // Nach dem Speichern auf null setzen
    } else {
        gruppen.unshift(gruppe); // Neue Gruppe an den Anfang hinzufügen
    }

    speichereGruppen();
    aktualisiereGruppenListe();
    schliesseGruppePopup();
}

// Funktion zum Laden der Gruppen aus localStorage
function ladeGruppen() {
    gruppen = JSON.parse(localStorage.getItem('gruppen')) || [];
    aktualisiereGruppenListe();
}

// Funktion zum Speichern der Gruppen in localStorage
function speichereGruppen() {
    localStorage.setItem('gruppen', JSON.stringify(gruppen));
}

// Funktion zum Anzeigen der Gruppenliste
function aktualisiereGruppenListe() {
    const wettkampfContainer = document.getElementById('wettkampfGruppenInhalt');
    const normaleGruppenContainer = document.getElementById('normaleGruppenInhalt');

    wettkampfContainer.innerHTML = '';
    normaleGruppenContainer.innerHTML = '';

    gruppen.forEach((gruppe, index) => {
        const div = document.createElement('div');
        div.innerHTML = `
            <h3 onclick="toggleGruppenDetails(${index})">${gruppe.name}</h3>
            <div id="gruppenDetails-${index}" style="display:none;">
                <button onclick="bearbeiteGruppe(${index})">Bearbeiten</button>
                <button onclick="loescheGruppe(${index})">Löschen</button>
                ${gruppe.typ === 'wettkampf' ? zeigePositionen(gruppe.positionen) : ''}
                <div>
                    <h4>Mitglieder:</h4>
                    <ul>
                        ${gruppe.mitglieder.map((mitglied) => `<li>${mitglied}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        // Gruppen je nach Typ in den passenden Container anzeigen
        if (gruppe.typ === 'wettkampf') {
            wettkampfContainer.appendChild(div);
        } else {
            normaleGruppenContainer.appendChild(div);
        }
    });
}

// Funktion zum Ein- und Ausklappen der Gruppendetails
function toggleGruppenDetails(index) {
    const details = document.getElementById(`gruppenDetails-${index}`);
    if (details.style.display === 'none') {
        details.style.display = 'block';
    } else {
        details.style.display = 'none';
    }
}

// Funktion zum Bearbeiten einer Gruppe
function bearbeiteGruppe(index) {
    const gruppe = gruppen[index];
    bearbeitungsIndex = index; // Den Index der bearbeiteten Gruppe speichern
    gruppenTypSelect.disabled = true; // Typ-Auswahl deaktivieren beim Bearbeiten
    gruppenNameInput.value = gruppe.name; // Setze den Gruppenname für die Bearbeitung
    gruppenTypSelect.value = gruppe.typ; // Setze den Gruppentyp

    oeffneGruppePopup('Gruppe bearbeiten', 'Speichern', gruppe.typ === 'wettkampf'); // Überprüfen, ob es eine Wettkampfgruppe ist
    zeigeMitgliederZuweisung(gruppe.mitglieder); // Zeige die Mitglieder der Gruppe

    if (gruppe.typ === 'wettkampf') {
        zeigePositionenZuweisung(gruppe.mitglieder, gruppe.positionen); // Zeige Positionen, falls es eine Wettkampfgruppe ist
    }
}

// Funktion zum Löschen einer Gruppe
function loescheGruppe(index) {
    if (confirm('Möchten Sie diese Gruppe wirklich löschen?')) {
        gruppen.splice(index, 1);
        speichereGruppen();
        aktualisiereGruppenListe();
    }
}

// Funktion zum Anzeigen der Positionen in einer Wettkampfgruppe
function zeigePositionen(positionen) {
    return `
        <div>
            <p><strong>Gruppenführer:</strong> ${positionen.gruppenführer}</p>
            <p><strong>Maschinist:</strong> ${positionen.maschinist}</p>
            <p><strong>Melder:</strong> ${positionen.melder}</p>
            <p><strong>Schlauchtrupp:</strong> Führer: ${positionen.schlauchTruppFührer}, Mann: ${positionen.schlauchTruppMann}</p>
            <p><strong>Wassertrupp:</strong> Führer: ${positionen.wasserTruppFührer}, Mann: ${positionen.wasserTruppMann}</p>
            <p><strong>Angriffstrupp:</strong> Führer: ${positionen.angriffsTruppFührer}, Mann: ${positionen.angriffsTruppMann}</p>
        </div>
    `;
}

// Mitglieder verwalten
function ladeMitglieder() {
    mitglieder = JSON.parse(localStorage.getItem('mitglieder')) || [];
    aktualisiereMitgliederTabelle();
}

function speichereMitglieder() {
    localStorage.setItem('mitglieder', JSON.stringify(mitglieder));
}

function neuesMitgliedSpeichern(event) {
    event.preventDefault();

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
    };

    if (bearbeitungsIndex === null) {
        mitglieder.push(mitglied);
    } else {
        mitglieder[bearbeitungsIndex] = mitglied;
        bearbeitungsIndex = null;
    }

    speichereMitglieder();
    aktualisiereMitgliederTabelle();
    schliessePopup();
}

function aktualisiereMitgliederTabelle() {
    const tbody = document.querySelector('#mitgliederTabelle tbody');
    tbody.innerHTML = '';

    // Mitglieder alphabetisch sortieren
    mitglieder.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });

    mitglieder.forEach((mitglied, index) => {
        const alter = berechneAlter(mitglied.geburtsdatum);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${mitglied.vorname}</td>
            <td>${mitglied.name}</td>
            <td>${mitglied.geburtsdatum} (${alter} Jahre)</td>
            <td>${mitglied.wohnort.strasse} ${mitglied.wohnort.hausnummer}, ${mitglied.wohnort.plz} ${mitglied.wohnort.ort}</td>
            <td>
                <button onclick="bearbeiteMitglied(${index})">Bearbeiten</button>
                <button onclick="loescheMitglied(${index})">Löschen</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function bearbeiteMitglied(index) {
    const mitglied = mitglieder[index];
    bearbeitungsIndex = index;
    oeffnePopup('Mitglied bearbeiten', 'Speichern', mitglied);
}

function loescheMitglied(index) {
    if (confirm('Möchten Sie dieses Mitglied wirklich löschen?')) {
        mitglieder.splice(index, 1);
        speichereMitglieder();
        aktualisiereMitgliederTabelle();
    }
}

function berechneAlter(geburtsdatum) {
    const geburtsdatumObj = new Date(geburtsdatum);
    const differenz = Date.now() - geburtsdatumObj.getTime();
    const alterDatum = new Date(differenz);
    return Math.abs(alterDatum.getUTCFullYear() - 1970);
}

// Anwesenheitslisten verwalten
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
    };

    // Füge die neue Liste an den Anfang des Arrays hinzu
    anwesenheitslisten.unshift(neueListe);
    speichereAnwesenheitslisten();
    zeigeAlleAnwesenheitslisten();

    const index = 0; // Da wir die Liste am Anfang eingefügt haben, ist der Index 0
    bearbeiteAnwesenheitsliste(index);
}

function speichereAnwesenheitslisten() {
    localStorage.setItem('anwesenheitslisten', JSON.stringify(anwesenheitslisten));
}

function ladeAnwesenheitslisten() {
    anwesenheitslisten = JSON.parse(localStorage.getItem('anwesenheitslisten')) || [];
    zeigeAlleAnwesenheitslisten();
}

function zeigeAlleAnwesenheitslisten() {
    const container = document.getElementById('anwesenheitslisteInhalt');
    container.innerHTML = '';

    anwesenheitslisten.forEach((liste, index) => {
        const div = document.createElement('div');
        div.innerHTML = `
            <h3 onclick="toggleAnwesenheitsDetails(${index})">Anwesenheitsliste vom ${liste.datum}</h3>
            <div id="anwesenheitsliste-${index}" style="display:none;">
                <button id="bearbeiten-${index}" onclick="bearbeiteAnwesenheitsliste(${index})">Bearbeiten</button>
                <button id="speichern-${index}" style="display:none" onclick="speichereAnwesenheitsliste(${index})">Speichern</button>
                <button onclick="loescheAnwesenheitsliste(${index})">Löschen</button>
                <div id="anwesenheitslisteEintraege-${index}"></div>
            </div>
        `;
        container.appendChild(div);
        zeigeAnwesenheitsliste(liste, index);
    });
}

function toggleAnwesenheitsDetails(index) {
    const details = document.getElementById(`anwesenheitsliste-${index}`);
    if (details.style.display === 'none') {
        details.style.display = 'block';
    } else {
        details.style.display = 'none';
    }
}

function zeigeAnwesenheitsliste(liste, index) {
    const container = document.getElementById(`anwesenheitslisteEintraege-${index}`);
    container.innerHTML = '';

    liste.eintraege.forEach((eintrag, eintragIndex) => {
        const div = document.createElement('div');
        div.innerHTML = `
            ${eintrag.mitglied.vorname} ${eintrag.mitglied.name}:
            <select id="status-${index}-${eintragIndex}" onchange="statusÄndern(${index}, ${eintragIndex}, this.value)" disabled>
                <option value="anwesend" ${eintrag.status === 'anwesend' ? 'selected' : ''}>Anwesend</option>
                <option value="entschuldigt" ${eintrag.status === 'entschuldigt' ? 'selected' : ''}>Entschuldigt</option>
                <option value="abwesend" ${eintrag.status === 'abwesend' ? 'selected' : ''}>Abwesend</option>
            </select>
        `;
        container.appendChild(div);
    });
}

function bearbeiteAnwesenheitsliste(index) {
    document.getElementById(`bearbeiten-${index}`).style.display = 'none';
    document.getElementById(`speichern-${index}`).style.display = 'inline';

    anwesenheitslisten[index].eintraege.forEach((eintrag, eintragIndex) => {
        document.getElementById(`status-${index}-${eintragIndex}`).disabled = false;
    });
}

function speichereAnwesenheitsliste(index) {
    document.getElementById(`bearbeiten-${index}`).style.display = 'inline';
    document.getElementById(`speichern-${index}`).style.display = 'none';

    anwesenheitslisten[index].eintraege.forEach((eintrag, eintragIndex) => {
        document.getElementById(`status-${index}-${eintragIndex}`).disabled = true;
    });

    speichereAnwesenheitslisten();
    alert('Anwesenheitsliste wurde gespeichert.');
}

function loescheAnwesenheitsliste(index) {
    if (confirm('Möchten Sie diese Anwesenheitsliste wirklich löschen?')) {
        anwesenheitslisten.splice(index, 1);
        speichereAnwesenheitslisten();
        zeigeAlleAnwesenheitslisten();
    }
}

function statusÄndern(listeIndex, eintragIndex, neuerStatus) {
    anwesenheitslisten[listeIndex].eintraege[eintragIndex].status = neuerStatus;
    speichereAnwesenheitslisten();
}
