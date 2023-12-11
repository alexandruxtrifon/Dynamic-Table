function importFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if(!file) {
        alert('You need to select a file.');
        return;
    }

const reader = new FileReader();
reader.onload = function (e) {
    const content = e.target.result;
    //const extension = file.name.split('.').pop().toLowerCase();
    const fileType = getFileType(file.name);
    if (fileType === 'json'){
        populateTableJSON(content);
    } else if (fileType === 'xml') {
        populateTableXML(content);
    } else if (fileType === 'csv') {
        populateTableCSV(content);
    }
    else {
        alert('Unsupported file format. Choose a JSON, XML or CSV file.');
    }

};
    reader.readAsText(file);
}

function getFileType(fileName){
    const extension = fileName.split('.').pop().toLowerCase();
    return extension;
}

function populateTableJSON(json) {
    const data = JSON.parse(json);
    renderTable(data);
}
function populateTableXML(xml) {

}
function populateTableCSV(csv) {

}

function renderTable(data) {
    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');

    tableHead.innerHTML = ''; // sterg placeholder
    tableBody.innerHTML = ''; // idem
    
    if (data.length > 0) {
        const headers = Object.keys(data[0]);
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        tableHead.appendChild(headerRow);
        const buttonCell = document.createElement('th');
        headerRow.appendChild(buttonCell);

        data.forEach(item => {
            const row = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = item[header];
                row.appendChild(td);
            });

            const duplicateButton = createButton('Duplicate', () => duplicateRow(row));
            const deleteButton = createButton('Delete', () => deleteRow(row));
            const buttonCell = document.createElement('td');
            buttonCell.appendChild(duplicateButton);
            buttonCell.appendChild(deleteButton);
            row.appendChild(buttonCell);

            tableBody.appendChild(row);
        });
    }
}

function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
}

function duplicateRow(row) {
    const newRow = row.cloneNode(true);
    row.parentNode.insertBefore(newRow, row.nextSibling);
}

function deleteRow(row) {
    row.parentNode.removeChild(row);
}
