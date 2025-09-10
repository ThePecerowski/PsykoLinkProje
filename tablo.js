// Tablo işlemleri için JavaScript kodları
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const tableNameInput = document.getElementById('tableNameInput');
    const columnCountInput = document.getElementById('columnCountInput');
    const rowCountInput = document.getElementById('rowCountInput');
    const addColumnBtn = document.getElementById('addColumnBtn');
    const removeColumnBtn = document.getElementById('removeColumnBtn');
    const addRowBtn = document.getElementById('addRowBtn');
    const removeRowBtn = document.getElementById('removeRowBtn');
    const updateTableBtn = document.getElementById('updateTableBtn');
    const clearTableBtn = document.getElementById('clearTableBtn');
    const saveTableBtn = document.getElementById('saveTableBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const exportDocxBtn = document.getElementById('exportDocxBtn');
    const exportJpgBtn = document.getElementById('exportJpgBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const headerRow = document.getElementById('headerRow');
    const tableBody = document.getElementById('tableBody');
    const savedTablesContainer = document.getElementById('savedTablesContainer');
    const noTablesMessage = document.getElementById('noTablesMessage');
    const templateContainer = document.getElementById('templateContainer');
    const tableTitle = document.getElementById('tableTitle');
    const tableDescription = document.getElementById('tableDescription');
    
    // Variables
    let currentTableType = 'custom';
    
    // Check for dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Aydınlık Mod';
    }
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tableType = urlParams.get('type');
    
    // Initialize table based on URL parameter
    if (tableType && window.tableTemplates[tableType]) {
        currentTableType = tableType;
        initializeEmptyTableWithStructure(tableType);
        
        // Show example table alert
        showTemplateExampleAlert(tableType);
    }
    
    // Initialize template cards
    initializeTemplateCards();
    
    // Load saved tables
    loadSavedTables();
      // Add visual indication for invalid input
    function markInputAsInvalid(input, isInvalid = true) {
        if (isInvalid) {
            input.classList.add('invalid');
        } else {
            input.classList.remove('invalid');
        }
    }
    
    // Enhance column and row controls with validation feedback
    addColumnBtn.addEventListener('click', function() {
        const currentValue = parseInt(columnCountInput.value);
        if (currentValue < 10) {
            columnCountInput.value = currentValue + 1;
            markInputAsInvalid(columnCountInput, false);
            updateTable();
        } else {
            // Flash feedback that we're at max columns
            markInputAsInvalid(columnCountInput, true);
            setTimeout(() => markInputAsInvalid(columnCountInput, false), 800);
        }
    });
    
    removeColumnBtn.addEventListener('click', function() {
        const currentValue = parseInt(columnCountInput.value);
        if (currentValue > 1) {
            columnCountInput.value = currentValue - 1;
            markInputAsInvalid(columnCountInput, false);
            updateTable();
        } else {
            // Flash feedback that we're at min columns
            markInputAsInvalid(columnCountInput, true);
            setTimeout(() => markInputAsInvalid(columnCountInput, false), 800);
        }
    });
    
    addRowBtn.addEventListener('click', function() {
        const currentValue = parseInt(rowCountInput.value);
        if (currentValue < 20) {
            rowCountInput.value = currentValue + 1;
            markInputAsInvalid(rowCountInput, false);
            updateTable();
        } else {
            // Flash feedback that we're at max rows
            markInputAsInvalid(rowCountInput, true);
            setTimeout(() => markInputAsInvalid(rowCountInput, false), 800);
        }
    });
    
    removeRowBtn.addEventListener('click', function() {
        const currentValue = parseInt(rowCountInput.value);
        if (currentValue > 1) {
            rowCountInput.value = currentValue - 1;
            markInputAsInvalid(rowCountInput, false);
            updateTable();
        } else {
            // Flash feedback that we're at min rows
            markInputAsInvalid(rowCountInput, true);
            setTimeout(() => markInputAsInvalid(rowCountInput, false), 800);
        }
    });
      // Enhanced input validation with real-time checks
    columnCountInput.addEventListener('input', function() {
        // Validate and sanitize input as user types
        let value = parseInt(this.value);
        
        if (isNaN(value)) {
            // Allow empty field during typing, but don't update table
            return;
        }
        
        // Apply constraints immediately
        if (value < 1) value = 1;
        if (value > 10) value = 10;
        
        // Only update the input value if it changed (avoid cursor jumping)
        if (value.toString() !== this.value) {
            this.value = value;
        }
    });
    
    // Handle final change when user is done typing
    columnCountInput.addEventListener('change', function() {
        // Final validation before updating
        let value = parseInt(this.value);
        
        // Handle empty or invalid input
        if (isNaN(value) || this.value === '') {
            this.value = 1;
            value = 1;
        }
        
        // Apply constraints one more time
        if (value < 1) this.value = 1;
        if (value > 10) this.value = 10;
        
        // Always update table on change event when finished editing
        updateTable();
    });
    
    // Same approach for row count input
    rowCountInput.addEventListener('input', function() {
        // Validate and sanitize input as user types
        let value = parseInt(this.value);
        
        if (isNaN(value)) {
            // Allow empty field during typing, but don't update table
            return;
        }
        
        // Apply constraints immediately
        if (value < 1) value = 1;
        if (value > 20) value = 20;
        
        // Only update the input value if it changed (avoid cursor jumping)
        if (value.toString() !== this.value) {
            this.value = value;
        }
    });
    
    rowCountInput.addEventListener('change', function() {
        // Final validation before updating
        let value = parseInt(this.value);
        
        // Handle empty or invalid input
        if (isNaN(value) || this.value === '') {
            this.value = 1;
            value = 1;
        }
        
        // Apply constraints one more time
        if (value < 1) this.value = 1;
        if (value > 20) this.value = 20;
        
        // Always update table on change event when finished editing
        updateTable();
    });
    
    updateTableBtn.addEventListener('click', updateTable);
    clearTableBtn.addEventListener('click', clearTable);
    saveTableBtn.addEventListener('click', saveTable);
    
    exportPdfBtn.addEventListener('click', exportToPdf);
    exportDocxBtn.addEventListener('click', exportToDocx);
    exportJpgBtn.addEventListener('click', exportToJpg);
    
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Functions
    function initializeTableFromTemplate(templateId) {
        const template = window.tableTemplates[templateId];
        if (!template) return;
        
        // Update UI elements
        tableTitle.textContent = template.name;
        tableDescription.textContent = template.description;
        tableNameInput.value = template.name;
        
        // Önce input değerlerini güncelle
        columnCountInput.value = template.columns.length;
        rowCountInput.value = template.rows;
        
        // Update header row
        headerRow.innerHTML = '';
        template.columns.forEach(column => {
            const th = document.createElement('th');
            const input = document.createElement('input');
            input.type = 'text';
            input.value = column;
            input.placeholder = 'Başlık';
            th.appendChild(input);
            headerRow.appendChild(th);
        });
        
        // Update table body
        tableBody.innerHTML = '';
        for (let i = 0; i < template.rows; i++) {
            const tr = document.createElement('tr');
            for (let j = 0; j < template.columns.length; j++) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = 'Hücre içeriği';
                
                // If example data exists, use it
                if (template.example && template.example[i] && template.example[i][j]) {
                    input.value = template.example[i][j];
                }
                
                td.appendChild(input);
                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
        }
    }
      function initializeEmptyTableWithStructure(templateId) {
        const template = window.tableTemplates[templateId];
        if (!template) return;
        
        // Show a loading indicator while table initializes
        const tableContainer = document.getElementById('tableContainer');
        tableContainer.classList.add('table-updating');
        
        setTimeout(() => {
            // Update UI elements
            tableTitle.textContent = template.name;
            tableDescription.textContent = template.description;
            tableNameInput.value = template.name;
            
            // Set input values first to ensure they're properly initialized
            // Make sure to trigger change events so any validation logic runs
            columnCountInput.value = template.columns.length;
            const columnEvent = new Event('change', { bubbles: true });
            columnCountInput.dispatchEvent(columnEvent);
            
            rowCountInput.value = template.rows;
            const rowEvent = new Event('change', { bubbles: true });
            rowCountInput.dispatchEvent(rowEvent);
            
            // Update header row
            headerRow.innerHTML = '';
            template.columns.forEach(column => {
                const th = document.createElement('th');
                const input = document.createElement('input');
                input.type = 'text';
                input.value = column;
                input.placeholder = 'Başlık';
                th.appendChild(input);
                headerRow.appendChild(th);
            });
            
            // Update table body with empty cells
            tableBody.innerHTML = '';
            for (let i = 0; i < template.rows; i++) {
                const tr = document.createElement('tr');
                for (let j = 0; j < template.columns.length; j++) {
                    const td = document.createElement('td');
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = 'Hücre içeriği';
                    td.appendChild(input);
                    tr.appendChild(td);
                }
                tableBody.appendChild(tr);
            }
            
            // Remove loading indicator
            tableContainer.classList.remove('table-updating');
            
            // Flash feedback to user that table was updated
            tableContainer.classList.add('table-updated');
            setTimeout(() => {
                tableContainer.classList.remove('table-updated');
            }, 300);
            
            // Initialize the keyboard navigation
            initializeTableFeatures();
        }, 10);
    }
    
    function showTemplateExampleAlert(templateId) {
        const template = window.tableTemplates[templateId];
        if (!template || !template.example) return;
        
        // Create table HTML for the alert
        let tableHTML = '<table class="table table-bordered table-striped">';
        
        // Add header row
        tableHTML += '<thead><tr>';
        template.columns.forEach(column => {
            tableHTML += `<th>${column}</th>`;
        });
        tableHTML += '</tr></thead>';
        
        // Add body rows with example data
        tableHTML += '<tbody>';
        for (let i = 0; i < Math.min(3, template.example.length); i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < template.columns.length; j++) {
                if (template.example[i] && template.example[i][j]) {
                    tableHTML += `<td>${template.example[i][j]}</td>`;
                } else {
                    tableHTML += '<td></td>';
                }
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody></table>';
        
        // Create custom alert content
        const alertContent = `
            <div class="modal fade" id="exampleTableModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="${template.icon} me-2"></i>${template.name} - Örnek</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Bu tablo tipi için bir örnek aşağıda gösterilmiştir. Kendi tablonuzu oluşturmak için bu örneği referans alabilirsiniz.</p>
                            <div class="table-responsive">
                                ${tableHTML}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Anladım</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Append modal to body
        document.body.insertAdjacentHTML('beforeend', alertContent);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('exampleTableModal'));
        modal.show();
        
        // Remove modal from DOM after it's hidden
        document.getElementById('exampleTableModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    function initializeTemplateCards() {
        templateContainer.innerHTML = '';
        
        for (const [id, template] of Object.entries(window.tableTemplates)) {
            if (id === 'custom') continue; // Skip the custom template
            
            const colDiv = document.createElement('div');
            colDiv.className = 'col';
            
            colDiv.innerHTML = `
                <div class="card template-card h-100" data-template-id="${id}">
                    <div class="card-body">
                        <h5 class="card-title"><i class="${template.icon} me-2"></i>${template.name}</h5>
                        <p class="card-text">${template.description}</p>
                        <div class="d-grid gap-2">
                            <button class="btn btn-outline-primary btn-sm load-template-btn">
                                <i class="fas fa-table me-1"></i> Bu şablonu kullan
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            templateContainer.appendChild(colDiv);
        }
        
        // Add event listeners to template cards
        document.querySelectorAll('.load-template-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const templateId = this.closest('.template-card').dataset.templateId;
                currentTableType = templateId;
                initializeEmptyTableWithStructure(templateId);
                showTemplateExampleAlert(templateId);
            });
        });
    }
      function updateTable() {
        // Show subtle loading indicator
        const tableContainer = document.getElementById('tableContainer');
        tableContainer.classList.add('table-updating');
        
        // Use setTimeout to allow browser to render the loading state
        setTimeout(() => {
            const columns = parseInt(columnCountInput.value);
            const rows = parseInt(rowCountInput.value);
            
            // Validate inputs one more time (defensive programming)
            const validColumns = !isNaN(columns) ? Math.min(Math.max(columns, 1), 10) : 3;
            const validRows = !isNaN(rows) ? Math.min(Math.max(rows, 1), 20) : 5;
            
            // Update input fields if values were invalid
            if (validColumns !== columns) columnCountInput.value = validColumns;
            if (validRows !== rows) rowCountInput.value = validRows;
            
            // Cache current table state for more efficient preservation of data
            const tableState = {
                headers: [],
                data: []
            };
            
            // Get header values
            const headerInputs = headerRow.querySelectorAll('input');
            headerInputs.forEach(input => {
                tableState.headers.push(input.value || '');
            });
            
            // Get cell values
            const rowElements = tableBody.querySelectorAll('tr');
            rowElements.forEach(row => {
                const rowData = [];
                const cellInputs = row.querySelectorAll('input');
                cellInputs.forEach(cell => {
                    rowData.push(cell.value || '');
                });
                tableState.data.push(rowData);
            });
            
            // Build header row efficiently with document fragment
            const headerFragment = document.createDocumentFragment();
            headerRow.innerHTML = '';
            
            for (let i = 0; i < validColumns; i++) {
                const th = document.createElement('th');
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `Başlık ${i + 1}`;
                
                // Preserve existing header value if available
                if (tableState.headers[i]) {
                    input.value = tableState.headers[i];
                }
                
                th.appendChild(input);
                headerFragment.appendChild(th);
            }
            headerRow.appendChild(headerFragment);
            
            // Build table body efficiently with document fragment
            const bodyFragment = document.createDocumentFragment();
            tableBody.innerHTML = '';
            
            for (let i = 0; i < validRows; i++) {
                const tr = document.createElement('tr');
                
                for (let j = 0; j < validColumns; j++) {
                    const td = document.createElement('td');
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = 'Hücre içeriği';
                    
                    // Preserve existing cell value if available
                    if (tableState.data[i] && tableState.data[i][j] !== undefined) {
                        input.value = tableState.data[i][j];
                    }
                    
                    td.appendChild(input);
                    tr.appendChild(td);
                }
                
                bodyFragment.appendChild(tr);
            }
            tableBody.appendChild(bodyFragment);
            
            // Remove loading indicator
            tableContainer.classList.remove('table-updating');
            
            // Flash feedback to user that table was updated
            tableContainer.classList.add('table-updated');
            setTimeout(() => {
                tableContainer.classList.remove('table-updated');
            }, 300);
        }, 10); // Small delay to allow UI to update
    }
      function clearTable() {
        if (confirm('Tablo içeriğini temizlemek istediğinize emin misiniz?')) {
            tableNameInput.value = '';
            // Clear all input values but keep structure
            document.querySelectorAll('#editableTable input').forEach(input => {
                input.value = '';
            });
            return true; // Indicate success for toast notification
        }
        return false; // Indicate cancellation for toast notification
    }
    
    function saveTable() {
        const tableName = tableNameInput.value || 'İsimsiz Tablo';
        const tableId = 'table_' + Date.now();
        
        // Get headers
        const headers = [];
        headerRow.querySelectorAll('input').forEach(input => {
            headers.push(input.value || input.placeholder);
        });
        
        // Get table data
        const tableData = [];
        tableBody.querySelectorAll('tr').forEach(row => {
            const rowData = [];
            row.querySelectorAll('input').forEach(cell => {
                rowData.push(cell.value);
            });
            tableData.push(rowData);
        });
        
        // Create table object
        const tableObject = {
            id: tableId,
            name: tableName,
            type: currentTableType,
            headers: headers,
            data: tableData,
            columns: headers.length,
            rows: tableData.length,
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        let savedTables = JSON.parse(localStorage.getItem('psykolink_tables') || '[]');
        savedTables.push(tableObject);
        localStorage.setItem('psykolink_tables', JSON.stringify(savedTables));
        
        // Update UI
        loadSavedTables();
        
        alert('Tablonuz başarıyla kaydedildi!');
    }
    
    function loadSavedTables() {
        const savedTables = JSON.parse(localStorage.getItem('psykolink_tables') || '[]');
        
        if (savedTables.length === 0) {
            noTablesMessage.style.display = 'block';
            savedTablesContainer.innerHTML = '';
            savedTablesContainer.appendChild(noTablesMessage);
            return;
        }
        
        noTablesMessage.style.display = 'none';
        savedTablesContainer.innerHTML = '';
        
        // Sort tables by date (newest first)
        savedTables.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        savedTables.forEach(table => {
            const tableCard = document.createElement('div');
            tableCard.className = 'col-md-4 mb-4';
            
            // Get icon for the table type
            const tableType = table.type || 'custom';
            const tableIcon = window.tableTemplates[tableType] ? window.tableTemplates[tableType].icon : 'fas fa-table';
            
            tableCard.innerHTML = `
                <div class="card h-100 saved-table-card" data-table-id="${table.id}">
                    <div class="card-body">
                        <h5 class="card-title"><i class="${tableIcon} me-2"></i>${table.name}</h5>
                        <p class="card-text small text-muted">
                            <i class="far fa-calendar-alt me-1"></i>
                            ${new Date(table.createdAt).toLocaleDateString('tr-TR')}
                            &bull; ${table.columns} sütun &bull; ${table.rows} satır
                        </p>
                        <div class="table-preview-mini">
                            <div class="table-preview-overflow">
                                <table class="table table-sm table-bordered">
                                    <thead>
                                        <tr>
                                            ${table.headers.map(header => `<th>${header}</th>`).join('')}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${table.data.slice(0, 2).map(row => 
                                            `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
                                        ).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-sm btn-outline-primary load-saved-table-btn">
                                <i class="fas fa-edit me-1"></i>Düzenle
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-saved-table-btn">
                                <i class="fas fa-trash-alt me-1"></i>Sil
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            savedTablesContainer.appendChild(tableCard);
        });
        
        // Add event listeners to saved table cards
        document.querySelectorAll('.load-saved-table-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tableId = this.closest('.saved-table-card').dataset.tableId;
                loadTableById(tableId);
            });
        });
        
        document.querySelectorAll('.delete-saved-table-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tableId = this.closest('.saved-table-card').dataset.tableId;
                deleteTableById(tableId);
            });
        });
    }
    
    function loadTableById(tableId) {
        const savedTables = JSON.parse(localStorage.getItem('psykolink_tables') || '[]');
        const table = savedTables.find(t => t.id === tableId);
        
        if (!table) return;
        
        // Update UI elements
        tableNameInput.value = table.name;
        columnCountInput.value = table.columns;
        rowCountInput.value = table.rows;
        currentTableType = table.type || 'custom';
        
        // Update header row
        headerRow.innerHTML = '';
        table.headers.forEach(header => {
            const th = document.createElement('th');
            const input = document.createElement('input');
            input.type = 'text';
            input.value = header;
            input.placeholder = 'Başlık';
            th.appendChild(input);
            headerRow.appendChild(th);
        });
        
        // Update table body
        tableBody.innerHTML = '';
        table.data.forEach(rowData => {
            const tr = document.createElement('tr');
            rowData.forEach(cellData => {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.value = cellData;
                input.placeholder = 'Hücre içeriği';
                td.appendChild(input);
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
        
        // Scroll to table editor
        document.querySelector('.table-editor-container').scrollIntoView({
            behavior: 'smooth'
        });
    }
      function deleteTableById(tableId) {
        if (confirm('Bu tabloyu silmek istediğinize emin misiniz?')) {
            let savedTables = JSON.parse(localStorage.getItem('psykolink_tables') || '[]');
            savedTables = savedTables.filter(t => t.id !== tableId);
            localStorage.setItem('psykolink_tables', JSON.stringify(savedTables));
            
            // Update UI
            loadSavedTables();
            return true; // Indicate success for toast notification
        }
        return false; // Indicate cancellation for toast notification
    }
    
    function exportToPdf() {
        const { jsPDF } = window.jspdf;
        const tableName = tableNameInput.value || 'PsykoLink_Tablo';
        
        // Create a clone of the table for export
        const tableClone = document.querySelector('#editableTable').cloneNode(true);
        
        // Replace inputs with text content
        tableClone.querySelectorAll('input').forEach(input => {
            const text = document.createTextNode(input.value);
            input.parentNode.replaceChild(text, input);
        });
        
        // Create a container for the table
        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.padding = '10px';
        
        // Add table title
        const title = document.createElement('h2');
        title.textContent = tableName;
        title.style.textAlign = 'center';
        title.style.marginBottom = '10px';
        container.appendChild(title);
        
        // Add PsykoLink footer
        const footer = document.createElement('p');
        footer.textContent = 'PsykoLink - Bilişsel Terapi Tabloları';
        footer.style.textAlign = 'center';
        footer.style.fontSize = '10px';
        footer.style.marginTop = '10px';
        footer.style.color = '#777';
        
        // Temporarily add to document
        container.appendChild(tableClone);
        container.appendChild(footer);
        document.body.appendChild(container);
        
        // Generate PDF
        html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            
            pdf.addImage(imgData, 'PNG', imgX, 10, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`${tableName.replace(/\s+/g, '_')}.pdf`);
            
            // Remove temporary elements
            document.body.removeChild(container);
        });
    }
    
    function exportToDocx() {
        // DOCX oluşturma kodları burada olacak
    }
    
    function exportToJpg() {
        // JPG oluşturma kodları burada olacak
    }
    
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Aydınlık Mod';
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Karanlık Mod';
        }
    }
    
    // Add keyboard navigation between cells (more spreadsheet-like behavior)
    function setupTableKeyboardNavigation() {
        const table = document.getElementById('editableTable');
        
        table.addEventListener('keydown', function(e) {
            if (!e.target.matches('input')) return;
            
            const cell = e.target.parentElement;
            const row = cell.parentElement;
            const rowIndex = Array.from(tableBody.children).indexOf(row);
            const cellIndex = Array.from(row.children).indexOf(cell);
            const totalRows = tableBody.children.length;
            const totalCols = row.children.length;
            
            let targetInput = null;
            
            // Handle arrow key navigation
            switch (e.key) {
                case 'ArrowUp':
                    if (rowIndex > 0) {
                        // Move to the cell above
                        targetInput = tableBody.children[rowIndex - 1].children[cellIndex].querySelector('input');
                    } else if (rowIndex === 0) {
                        // Move to header if at top row
                        targetInput = headerRow.children[cellIndex].querySelector('input');
                    }
                    break;
                    
                case 'ArrowDown':
                    if (rowIndex < totalRows - 1) {
                        // Move to the cell below
                        targetInput = tableBody.children[rowIndex + 1].children[cellIndex].querySelector('input');
                    }
                    break;
                    
                case 'ArrowLeft':
                    if (cellIndex > 0) {
                        // Move to the previous cell in the same row
                        targetInput = row.children[cellIndex - 1].querySelector('input');
                    } else if (cellIndex === 0 && rowIndex > 0) {
                        // Move to the last cell of the previous row
                        const prevRow = tableBody.children[rowIndex - 1];
                        targetInput = prevRow.children[prevRow.children.length - 1].querySelector('input');
                    }
                    break;
                    
                case 'ArrowRight':
                    if (cellIndex < totalCols - 1) {
                        // Move to the next cell in the same row
                        targetInput = row.children[cellIndex + 1].querySelector('input');
                    } else if (cellIndex === totalCols - 1 && rowIndex < totalRows - 1) {
                        // Move to the first cell of the next row
                        targetInput = tableBody.children[rowIndex + 1].children[0].querySelector('input');
                    }
                    break;
                    
                case 'Enter':
                    e.preventDefault();
                    if (rowIndex < totalRows - 1) {
                        // Move to the same column in the next row
                        targetInput = tableBody.children[rowIndex + 1].children[cellIndex].querySelector('input');
                    } else {
                        // At last row, move to first cell of first row
                        targetInput = tableBody.children[0].children[0].querySelector('input');
                    }
                    break;
                    
                case 'Tab':
                    // Tab navigation is handled by the browser by default
                    // But we can enhance it for a more natural flow at row boundaries
                    if (e.shiftKey && cellIndex === 0 && rowIndex > 0) {
                        // Shift+Tab at the start of a row - go to the end of the previous row
                        e.preventDefault();
                        const prevRow = tableBody.children[rowIndex - 1];
                        targetInput = prevRow.children[prevRow.children.length - 1].querySelector('input');
                    } else if (!e.shiftKey && cellIndex === totalCols - 1 && rowIndex < totalRows - 1) {
                        // Tab at the end of a row - go to the start of the next row
                        e.preventDefault();
                        targetInput = tableBody.children[rowIndex + 1].children[0].querySelector('input');
                    }
                    break;
            }
            
            // Focus the target input if found
            if (targetInput) {
                e.preventDefault();
                targetInput.focus();
                
                // Position cursor at the end of the text
                if (targetInput.value.length > 0) {
                    targetInput.selectionStart = targetInput.selectionEnd = targetInput.value.length;
                }
            }
        });
    }
    
    // Initialize keyboard navigation whenever table is updated
    function initializeTableFeatures() {
        setupTableKeyboardNavigation();
    }
    
    // Call initializeTableFeatures after table is updated
    const originalUpdateTable = updateTable;
    updateTable = function() {
        originalUpdateTable.apply(this, arguments);
        initializeTableFeatures();
    };
    
    // Also initialize on page load
    initializeTableFeatures();
    
    // Toast notification system
    function createToastContainer() {
        // Create toast container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            const toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            
            const toastHTML = `
                <div id="tableToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header">
                        <i class="fas fa-bell me-2 text-primary"></i>
                        <strong class="me-auto" id="toastTitle">Bildirim</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body" id="toastMessage">
                        İşlem başarıyla tamamlandı.
                    </div>
                </div>
            `;
            
            toastContainer.innerHTML = toastHTML;
            document.body.appendChild(toastContainer);
        }
    }
    
    // Show a toast notification
    function showToast(title, message, type = 'success') {
        createToastContainer();
        
        const toastElement = document.getElementById('tableToast');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');
        
        // Set icon and color based on type
        const iconElement = toastElement.querySelector('.toast-header i');
        iconElement.className = 'fas me-2';
        
        switch (type) {
            case 'success':
                iconElement.className += ' fa-check-circle text-success';
                break;
            case 'error':
                iconElement.className += ' fa-exclamation-circle text-danger';
                break;
            case 'warning':
                iconElement.className += ' fa-exclamation-triangle text-warning';
                break;
            case 'info':
                iconElement.className += ' fa-info-circle text-info';
                break;
            default:
                iconElement.className += ' fa-bell text-primary';
        }
        
        // Set content
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        // Show toast
        const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
        toast.show();
    }
    
    // Update functions to use toast notifications
    
    const originalSaveTable = saveTable;
    saveTable = function() {
        originalSaveTable.apply(this, arguments);
        showToast('Tablo Kaydedildi', 'Tablonuz başarıyla kaydedildi.', 'success');
    };
    
    const originalClearTable = clearTable;
    clearTable = function() {
        const result = originalClearTable.apply(this, arguments);
        if (result !== false) { // If the clear operation wasn't cancelled
            showToast('Tablo Temizlendi', 'Tablo içeriği temizlendi.', 'info');
        }
        return result;
    };
    
    const originalExportToPdf = exportToPdf;
    exportToPdf = function() {
        originalExportToPdf.apply(this, arguments);
        showToast('PDF Oluşturuldu', 'Tablonuz PDF olarak dışa aktarıldı.', 'success');
    };
    
    const originalExportToDocx = exportToDocx;
    exportToDocx = function() {
        originalExportToDocx.apply(this, arguments);
        showToast('DOCX Oluşturuldu', 'Tablonuz DOCX olarak dışa aktarıldı.', 'success');
    };
    
    const originalExportToJpg = exportToJpg;
    exportToJpg = function() {
        originalExportToJpg.apply(this, arguments);
        showToast('JPEG Oluşturuldu', 'Tablonuz JPEG olarak dışa aktarıldı.', 'success');
    };
    
    const originalDeleteTableById = deleteTableById;
    deleteTableById = function(tableId) {
        const result = originalDeleteTableById.apply(this, arguments);
        if (result !== false) { // If the delete operation wasn't cancelled
            showToast('Tablo Silindi', 'Seçilen tablo başarıyla silindi.', 'info');
        }
        return result;
    };
});
