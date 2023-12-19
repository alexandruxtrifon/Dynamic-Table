function enableExportButton() {
    const exportButton = document.getElementById('exportButton');
    exportButton.removeAttribute('disabled');
}
function disableExportButton() {
    const exportButton = document.getElementById('exportButton');
    exportButton.setAttribute('disabled', 'true');
}

function arraysAreEqual(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
}

function checkTableModifications() {
    //enableExportButton();

    const currentTableData = getTableData();
    if (arraysAreEqual(currentTableData, originalTableData)) {
        disableExportButton();
    } else {
        enableExportButton();
    };
    //console.log("Original Table Data:", originalTableData);
    console.log("Current Table Data:", currentTableData);
}

function getTableData() {
    const tableBody = document.getElementById('tableBody');
    const rows = tableBody.getElementsByTagName('tr');
    const tableData = [];

    for (const row of rows) {
        const cells = row.getElementsByTagName('td');
        const rowData = {};

        for (let i = 0; i < cells.length - 1; i++) {
            const header = document.getElementById('tableHead').getElementsByTagName('th')[i].textContent;
            const value = cells[i].textContent;
            rowData[header] = value;
        }
        tableData.push(rowData);
    }
    return tableData;
}

function eventListener() {
    const tableBody = document.getElementById('tableBody');

    tableBody.addEventListener('input', function(event) {
        checkTableModifications();
    });
}
function eventListenerButton() {
    const tableBody = document.getElementById('tableBody');

    tableBody.addEventListener('click', function(event) {
        checkTableModifications();
    });
}

const tableData = [];
let originalTableData;
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
            return;

    }
    const exportButton = document.getElementById('exportButton');
    exportButton.style.display = 'inline-block';

    originalTableData = getTableData();
    console.log("Original Table Data:", originalTableData);

    const newRowButton = document.getElementById('newRowButton');
    newRowButton.style.display = 'inline-block';

    makeTableEditable();
    eventListener();

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
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'application/xml');

    const headers = Array.from(xmlDoc.getElementsByTagName('item')[0].children);
    const headerNames = headers.map(header => header.tagName);

    const items = xmlDoc.getElementsByTagName('item');
    const data = Array.from(items).map(item => {
        const rowData = {};
        Array.from(item.children).forEach(child => {
            rowData[child.tagName] = child.textContent;
        });
        return rowData;
    });
    const tableData = headerNames.length > 0 ? data : [];
    renderTable(tableData);
}

function populateTableCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    const tableData = [];

    for (let i=1; i<lines.length; i++){
        const data = lines[i].split(',');
        if(data.length === headers.length) {
            const rowData = {};
            for (let j = 0; j<headers.length; j++){
                rowData[headers[j]] = data[j];
            }
            tableData.push(rowData);
        }
    }
    renderTable(tableData);
}

function renderTable(data) {
    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');

    tableHead.innerHTML = ''; // sterg placeholder
    tableBody.innerHTML = ''; // idem

    if (data.length > 0) {
        const headers = Object.keys(data[0]);
        const headerRow = document.createElement('tr');

        headers.forEach((header, index) => {
            const th = document.createElement('th');
            th.textContent = header;

            th.onclick = () => sortBy(index);

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
    //const newRow = row.cloneNode(true);

    //const duplicateButton = createButton('Duplicate', () => duplicateRow(newRow));
    //const deleteButton = createButton('Delete', () => deleteRow(newRow));
    //newRow.appendChild(duplicateButton);
    //newRow.appendChild(deleteButton);

    //row.parentNode.insertBefore(newRow, row.nextSibling);

    const tableBody = row.parentNode;
    const rowData = Array.from(row.children).slice(0, -1).map(cell => cell.textContent);

    const newRow = document.createElement('tr');
    rowData.forEach(data => {
        const td = document.createElement('td');
        td.textContent = data;
        newRow.appendChild(td);
    });

    const duplicateButton = createButton('Duplicate', () => duplicateRow(newRow));
    const deleteButton = createButton('Delete', () => deleteRow(newRow));

    const buttonCell = document.createElement('td');
    buttonCell.appendChild(duplicateButton);
    buttonCell.appendChild(deleteButton);
    newRow.appendChild(buttonCell);

    tableBody.insertBefore(newRow, row.nextSibling);
    makeTableEditable();
    eventListenerButton();
}

function deleteRow(row) {
    row.parentNode.removeChild(row);
    eventListenerButton();
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
            rowData += `${value},`;
        }
        rowData = rowData.slice(0, -1) + '\n';
        csvContent += rowData;
    }
    const headers = Array.from(document.getElementById('tableHead').getElementsByTagName('th'));
    const headerRow = headers.slice(0, -1).map(th => `${th.textContent}`).join(',') + '\n';
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

function makeTableEditable() {
    const tableBody = document.getElementById('tableBody');
    const rows = tableBody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');

        for (let j=0; j<cells.length; j++) {
            cells[j].setAttribute('contenteditable', true);
        }
    }
}

function addNewRow() {
    const tableBody = document.getElementById('tableBody');
    const headerCells = Array.from(document.getElementById('tableHead').querySelectorAll('th'));
    const newRow = document.createElement('tr');

    headerCells.slice(0, -1).forEach((header, index) => {
        const td = document.createElement('td');
        td.textContent = 'Placeholder';
        newRow.appendChild(td);
    });

    const duplicateButton = createButton('Duplicate', () => duplicateRow(newRow));
    const deleteButton = createButton('Delete', () => deleteRow(newRow));

    const buttonCell = document.createElement('td');
    buttonCell.appendChild(duplicateButton);
    buttonCell.appendChild(deleteButton);
    newRow.appendChild(buttonCell);

    tableBody.appendChild(newRow);

    enableExportButton();
    makeTableEditable();
}

function sortTable(n) {
    let table = document.getElementById("dataTable");
    let rows = table.rows;
    let switching = true;
    let direction = "ascending";

    while (switching) {
        switching = false;

        for (let i = 1; i < rows.length - 1; i++) {
            let switchNeeded = false;
            let x = rows[i].getElementsByTagName("td")[n];
            let y = rows[i + 1].getElementsByTagName("td")[n];

            if (direction == "ascending") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    switchNeeded = true;
                    break;
                }
            } else if (direction == "descending") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    switchNeeded = true;
                    break;
                }
            }
        }

        if (switchNeeded) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        } else {
            if (count == 0 && direction == "ascending") {
                direction = "descending";
                switching = true;
            }
        }
    }
}

cPrev = -1;

function sortBy(c) {
    rows = document.getElementById("dataTable").rows.length; 
    columns = document.getElementById("dataTable").rows[0].cells.length;
    arrTable = [...Array(rows)].map(e => Array(columns)); 

    for (ro=0; ro<rows; ro++) {
        for (co=0; co<columns; co++) {
            arrTable[ro][co] = document.getElementById("dataTable").rows[ro].cells[co].innerHTML;
        }
    }

    th = arrTable.shift();
    
    if (c !== cPrev) {
        arrTable.sort(
            function (a, b) {
                if (a[c] === b[c]) {
                    return 0;
                } else {
                    return (a[c] < b[c]) ? -1 : 1;
                }
            }
        );
    } else {
        arrTable.reverse();
    }
    
    cPrev = c;

    arrTable.unshift(th);

    for (ro=0; ro<rows; ro++) {
        for (co=0; co<columns; co++) {
            document.getElementById("dataTable").rows[ro].cells[co].innerHTML = arrTable[ro][co];
        }
    }
}