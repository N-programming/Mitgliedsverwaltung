// Globale Variablen für Gruppen und Mitglieder
let gruppen = [];
let mitglieder = [];
let bearbeitungsIndex = null;

// Event Listener, um sicherzustellen, dass alles geladen wird, wenn die Seite bereit ist
document.addEventListener('DOMContentLoaded', () => {
    // Mitglieder und Gruppen laden und darstellen
    ladeMitglieder();
    ladeGruppen();

    // Event Listener für das Erstellen einer neuen Gruppe
    const neueGruppeButton = document.getElementById('neueGruppeButton');
    if (neueGruppeButton) {
        neueGruppeButton.addEventListener('click', () => {
            bearbeitungsIndex = null; // Reset, da eine neue Gruppe erstellt wird
            oeffneGruppePopup('Neue Gruppe erstellen', 'Erstellen');
        });
    } else {
        console.error("Button zum Erstellen einer neuen Gruppe nicht gefunden");
    }

    // Event Listener für das Speichern einer Gruppe
    const gruppeFormPopup = document.getElementById('gruppeFormPopup');
    if (gruppeFormPopup) {
        gruppeFormPopup.addEventListener('submit', speichereGruppe);
    }

    // Event Listener für das Ändern des Gruppentyps
    const gruppenTypSelect = document.getElementById('gruppenTyp');
    if (gruppenTypSelect) {
        gruppenTypSelect.addEventListener('change', togglePositionenContainer);
    }
});

// Funktion zum Öffnen des Pop-ups für Gruppen
function oeffneGruppePopup(titel, speicherButtonText, ausgewaehlteMitglieder = [], ausgewaehltePositionen = {}) {
    document.getElementById('gruppePopupTitel').innerText = titel;
    document.getElementById('gruppeSpeichern').innerText = speicherButtonText;
    document.getElementById('gruppenName').value = ''; // Felder zurücksetzen
    document.getElementById('gruppenTyp').value = 'normal'; // Standardmäßig auf 'standard' setzen
    document.getElementById('mitgliederZuordnungContainer').style.display = 'block'; // Mitglieder-Auswahl anzeigen

    togglePositionenContainer(); // Container für die Positionen je nach Gruppentyp anzeigen
    zeigeMitgliederZuweisung(ausgewaehlteMitglieder); // Mitglieder in der Checkbox anzeigen

    if (Object.keys(ausgewaehltePositionen).length > 0) {
        zeigePositionenZuweisung(ausgewaehlteMitglieder, ausgewaehltePositionen); // Positionen anzeigen
    } else {
        zeigePositionenZuweisung(ausgewaehlteMitglieder); // Positionen leeren
    }

    document.getElementById('gruppePopup').style.display = 'block'; // Pop-up anzeigen
}

// Funktion zum Schließen des Pop-ups
function schliesseGruppePopup() {
    document.getElementById('gruppePopup').style.display = 'none'; // Pop-up schließen
}

// Funktion zum Anzeigen der Mitglieder zur Auswahl
function zeigeMitgliederZuweisung(ausgewaehlteMitglieder = []) {
    const mitgliederContainer = document.getElementById('mitgliederZuweisen');
    mitgliederContainer.innerHTML = ''; // Container leeren

    mitglieder.forEach((mitglied) => {
        const nameVollständig = `${mitglied.vorname} ${mitglied.name}`;
        const checked = ausgewaehlteMitglieder.includes(nameVollständig) ? 'checked' : ''; // Vorhandene Mitglieder in der Gruppe anhaken
        const div = document.createElement('div');
        div.innerHTML = `<input type="checkbox" id="${nameVollständig}" name="mitglied" value="${nameVollständig}" ${checked}> ${nameVollständig}`;
        mitgliederContainer.appendChild(div);
    });
}

// Funktion zum Anzeigen der Positionen für eine Wettkampfgruppe
function zeigePositionenZuweisung(ausgewaehlteMitglieder = [], ausgewaehltePositionen = {}) {
    const mitgliederOptionen = ausgewaehlteMitglieder
        .map((mitglied) => `<option value="${mitglied}">${mitglied}</option>`)
        .join('');

    // Füge die Optionen zu den Positionsfeldern hinzu
    const positionen = [
        'gruppenführer', 'maschinist', 'melder',
        'schlauchTruppFührer', 'schlauchTruppMann',
        'wasserTruppFührer', 'wasserTruppMann',
        'angriffsTruppFührer', 'angriffsTruppMann'
    ];

    positionen.forEach((position) => {
        const selectElement = document.getElementById(position); 
        selectElement.innerHTML = `<option value="">Nicht Zugewiesen</option>${mitgliederOptionen}`;
        if (ausgewaehltePositionen[position]) {
            selectElement.value = ausgewaehltePositionen[position];
        }
    });
}

// Funktion zum Speichern einer Gruppe (neu oder bearbeitet)
function speichereGruppe(event) {
    event.preventDefault();

    const gruppenName = document.getElementById('gruppenName').value;

    if (gruppenName.length > 30 || gruppenName.length < 1) {
        alert('Der Gruppenname muss zwischen 1 und 30 Zeichen lang sein.');
        return; // Verhindert das Speichern, wenn die Bedingung nicht erfüllt ist
    }
    

    const gruppe = {
        name: gruppenName,
        typ: document.getElementById('gruppenTyp').value,
        mitglieder: Array.from(document.querySelectorAll('input[name="mitglied"]:checked')).map(
            (checkbox) => checkbox.value
        ),
    };

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

    if (bearbeitungsIndex !== null) {
        // Gruppe aktualisieren
        gruppen[bearbeitungsIndex] = gruppe;
    } else {
        // Neue Gruppe hinzufügen
        gruppen.unshift(gruppe);
    }

    speichereGruppen();
    aktualisiereGruppenListe();
    schliesseGruppePopup();
}


// Funktion zum Umschalten der Sichtbarkeit des Positionen-Containers
function togglePositionenContainer() {
    const gruppenTyp = document.getElementById('gruppenTyp').value;
    if (gruppenTyp === 'wettkampf') {
        document.getElementById('positionenContainer').style.display = 'block';
    } else {
        document.getElementById('positionenContainer').style.display = 'none';
    }
}

// Funktion zum Laden der Mitglieder aus dem localStorage
function ladeMitglieder() {
    mitglieder = JSON.parse(localStorage.getItem('mitglieder')) || [];
    if (mitglieder.length === 0) {
        console.warn("Keine Mitglieder gefunden.");
    }
}

// Funktion zum Laden der Gruppen aus dem localStorage
function ladeGruppen() {
    gruppen = JSON.parse(localStorage.getItem('gruppen')) || [];
    aktualisiereGruppenListe();
}

// Funktion zum Speichern der Gruppen im localStorage
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
            <div class="gruppenContainer">
                <div class="gruppenName"><h3 onclick="toggleGruppenDetails(${index})">${gruppe.name}</h3>
                <svg id="dropdown-icon-${index}" style="transform: rotate(0deg);" xmlns="http://www.w3.org/2000/svg" width="25px" fill="white" height="25px" viewBox="0 0 24 24">
                <rect x="0" fill="none" width="24" height="24"/>
                    <g>
                        <path d="M7 10l5 5 5-5"/>
                    </g>
                </svg>
                </div>
                <div id="gruppenDetails-${index}" style="display:none;">
                    <div class="gruppenMitglieder">
                        <h3>Mitglieder</h3>
                        <ul>
                            ${gruppe.mitglieder.map((mitglied) => `<li>${mitglied}</li>`).join('')}
                        </ul>
                    </div>
                    ${gruppe.typ === 'wettkampf' ? zeigePositionen(gruppe.positionen) : ''}
                    <div class="bearbeitenUndLöschen">
                        <button onclick="bearbeiteGruppe(${index})" class="small-button">Bearbeiten</button>
                        <button onclick="loescheGruppe(${index})" class="small-button-delete">Löschen</button>
                    </div>
                </div>
            </div>
        `;
        if (gruppe.typ === 'wettkampf') {
            wettkampfContainer.appendChild(div);
        } else {
            normaleGruppenContainer.appendChild(div);
        }
    });
}


// Funktion zum Bearbeiten einer Gruppe
function bearbeiteGruppe(index) {
    const gruppe = gruppen[index];
    bearbeitungsIndex = index;
    oeffneGruppePopup('Gruppe bearbeiten', 'Speichern', gruppe.mitglieder, gruppe.positionen);
    document.getElementById('gruppenName').value = gruppe.name;
    document.getElementById('gruppenTyp').value = gruppe.typ;

    // Wenn es eine Wettkampfgruppe ist, stelle sicher, dass die Positionen angezeigt werden
    if (gruppe.typ === 'wettkampf') {
        togglePositionenContainer();
        zeigePositionenZuweisung(gruppe.mitglieder, gruppe.positionen);
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

// Funktion zum Ein- und Ausklappen der Gruppendetails
function toggleGruppenDetails(index) {
    const details = document.getElementById(`gruppenDetails-${index}`);
    const icon = document.getElementById(`dropdown-icon-${index}`); // Dynamische ID für das Icon

    if (details.style.display === 'none' || details.style.display === '') {
        details.style.display = 'block';
        icon.style.transform = 'rotate(180deg)'; // Icon drehen, wenn die Details geöffnet sind
    } else {
        details.style.display = 'none';
        icon.style.transform = 'rotate(0deg)'; // Icon zurückdrehen, wenn die Details geschlossen sind
    }
}
// Funktion zum Anzeigen der Positionen in einer Wettkampfgruppe
function zeigePositionen(positionen) {
    if (!positionen) return '';
    return `
        <div class="mitglieder-positionen">
            <h3>Positionen</h3>
            <p><strong>Gruppenführer:</strong> ${positionen.gruppenführer || "Nicht Ausgewählt"}</p>
            <p><strong>Maschinist:</strong> ${positionen.maschinist || "Nicht Ausgewählt"}</p>
            <p><strong>Melder:</strong> ${positionen.melder || "Nicht Ausgewählt"}</p>
            <p><strong>Schlauchtrupp:</strong><br> <small>Führer:</small> ${positionen.schlauchTruppFührer || "Nicht Ausgewählt"};<br> <small>Mann:</small> ${positionen.schlauchTruppMann || "Nicht Ausgewählt"}</p>
            <p><strong>Wassertrupp:</strong><br> <small>Führer:</small> ${positionen.wasserTruppFührer || "Nicht Ausgewählt"};<br> <small>Mann:</small> ${positionen.wasserTruppMann || "Nicht Ausgewählt"}</p>
            <p><strong>Angriffstrupp:</strong><br> <small>Führer:</small> ${positionen.angriffsTruppFührer || "Nicht Ausgewählt"};<br> <small>Mann:</small> ${positionen.angriffsTruppMann || "Nicht Ausgewählt"}</p>
        </div>
    `;
}
