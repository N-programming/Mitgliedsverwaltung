document.addEventListener('DOMContentLoaded', () => {
    // Lade alle Module
    ladeMitglieder();
    ladeAnwesenheitslisten();
    ladeGruppen();

    // Event Listener für die Mitglieder
    document.getElementById('neuesMitgliedButton').addEventListener('click', () => {
        bearbeitungsIndex = null;
        oeffnePopup('Neues Mitglied hinzufügen', 'Hinzufügen');
    });

    // Event Listener für die Anwesenheitslisten
    document.getElementById('neueAnwesenheitslisteButton').addEventListener('click', erstelleAnwesenheitsliste);

    // Event Listener für die Gruppen
    document.getElementById('neueGruppeButton').addEventListener('click', () => {
        bearbeitungsIndex = null;
        gruppenTypSelect.disabled = false;
        gruppenNameInput.value = '';
        resetPositionen();
        oeffneGruppePopup('Gruppe erstellen', 'Erstellen', false);
    });
});
