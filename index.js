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

    switch(fileType){
        case 'json':
            populateTableJSON(content);
            break;
        case 'xml':
            populateTableXML(content);
            break;
        case 'csv':
            populateTableCSV(content);
            break;
        default:
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

function openModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'block';
}
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function exportTable() {
    const exportFormat = document.getElementById('exportFormat').value;

    switch(exportFormat) {
        case 'json':
            exportJSON();
            break;
        case 'xml':
            exportXML();
            break;
        case 'csv':
            exportCSV();
            break;
        default:
            console.error('Unsupported export format'); 
    }
}

function exportJSON() {
    const tableBody = document.getElementById('tableBody');
    const rows = tableBody.getElementsByTagName('tr');
    const rowData = [];

    for (const row of rows) {
        const cells = row.getElementsByTagName('td');
        const cellData = {};

        for (let i=0; i < cells.length - 1; i++){
            const header = document.getElementById('tableHead').getElementsByTagName('th')[i].textContent;
            const value = cells[i].textContent;
            cellData[header] = value;
        }
        rowData.push(cellData)
    }
    const jsonString = JSON.stringify(rowData, null, 2);;
    console.log(jsonString);
    const blob = new Blob([jsonString], {type: 'application/json'});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'table_data.json';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportCSV() {
    const tableBody = document.getElementById('tableBody');
    const rows = tableBody.getElementsByTagName('tr');
    let csvContent = '';

    for (const row of rows) {
        const cells = row.getElementsByTagName('td');
        let rowData = '';

        for (let i=0; i<cells.length -1; i++){
            const value = cells[i].textContent;
            rowData += `"${value}",`;
        }
        rowData = rowData.slice(0, -1) + '\n';
        csvContent += rowData;
    }
    const headers = Array.from(document.getElementById('tableHead').getElementsByTagName('th'));
    const headerRow = headers.slice(0, -1).map(th => `"${th.textContent}"`).join(',') + '\n';
    csvContent = headerRow + csvContent;

    console.log(csvContent);
    const blob = new Blob([csvContent], {type: 'text/csv'});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'table_data.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportXML() {
    const tableBody = document.getElementById('tableBody');
    const rows = tableBody.getElementsByTagName('tr');

    let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';

    for (const row of rows) {
        const cells = row.getElementsByTagName('td');
        xmlString += '  <item>\n';

        for (let i=0; i < cells.length - 1; i++){
            const header = document.getElementById('tableHead').getElementsByTagName('th')[i].textContent;
            const value = cells[i].textContent;
            xmlString += `  <${header}>${value}</${header}>\n`;
        }
        xmlString += '  </item>\n';
    }
    xmlString += '</data>';
    console.log(xmlString);
    const blob = new Blob([xmlString], {type: 'application/xml'});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'table_data.xml';

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
}
