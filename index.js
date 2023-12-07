function importFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if(!file) {
        alert('You need to select a file.');
        return;
    }
}