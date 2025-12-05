document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileInput = document.getElementById('csvFileInput');
    const dropArea = document.getElementById('dropArea');
    const rowInput = document.getElementById('rowNumberInput');
    const deleteBtn = document.getElementById('deleteBtn');

    // Set initial text based on default checked radio
    deleteBtn.textContent = 'Delete Selected Rows';
    const errorMsg = document.getElementById('errorMsg');
    const previewSection = document.getElementById('previewSection');
    const csvPreview = document.getElementById('csvPreview');
    const downloadBtn = document.getElementById('downloadBtn');
    const fileMsg = dropArea.querySelector('.file-msg');
    const modeRadios = document.querySelectorAll('input[name="deleteMode"]');
    const rowInputLabel = document.querySelector('.row-selector label');

    let currentFile = null;
    let updatedContent = '';

    // Mode Switch Feedback
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'keep') {
                rowInputLabel.textContent = 'Rows to Keep';
                deleteBtn.textContent = 'Keep Selected Rows';
            } else {
                rowInputLabel.textContent = 'Rows to Delete';
                deleteBtn.textContent = 'Delete Selected Rows';
            }
        });
    });

    // Drag & Drop Handling
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('dragover'), false);
    });

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Input Change Handling
    fileInput.addEventListener('change', function () {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                currentFile = file;
                fileMsg.textContent = `Selected: ${file.name}`;
                fileMsg.style.color = '#fff';
                errorMsg.style.display = 'none';
            } else {
                showError('Please upload a valid CSV file.');
            }
        }
    }

    // Delete Row Logic
    deleteBtn.addEventListener('click', () => {
        if (!currentFile) {
            showError('Please select a CSV file first.');
            return;
        }

        const inputVal = rowInput.value.trim();
        if (!inputVal) {
            showError('Please enter row numbers to delete.');
            return;
        }

        // Parse rows
        const rowsToDelete = new Set();
        const parts = inputVal.split(',').map(s => s.trim());

        for (const part of parts) {
            if (part) {
                if (part.includes('-')) {
                    // Range
                    const rangeParts = part.split('-').map(s => parseInt(s.trim()));
                    if (rangeParts.length !== 2 || isNaN(rangeParts[0]) || isNaN(rangeParts[1])) {
                        showError(`Invalid range format: "${part}"`);
                        return;
                    }
                    const start = Math.min(rangeParts[0], rangeParts[1]);
                    const end = Math.max(rangeParts[0], rangeParts[1]);
                    for (let i = start; i <= end; i++) {
                        if (i < 1) {
                            showError(`Row number ${i} must be 1 or greater.`);
                            return;
                        }
                        rowsToDelete.add(i);
                    }
                } else {
                    // Single Number
                    const num = parseInt(part);
                    if (isNaN(num)) {
                        showError(`Invalid row number: "${part}"`);
                        return;
                    }
                    if (num < 1) {
                        showError(`Row number ${num} must be 1 or greater.`);
                        return;
                    }
                    rowsToDelete.add(num);
                }
            }
        }

        if (rowsToDelete.size === 0) {
            showError('No valid rows selected.');
            return;
        }

        readFile(currentFile, (content) => {
            // Split by newline
            const lines = content.split(/\r\n|\n|\r/);

            // Validate Max Row
            const maxRow = Math.max(...rowsToDelete);
            if (maxRow > lines.length) {
                showError(`Row ${maxRow} does not exist. File has ${lines.length} rows.`);
                return;
            }

            // check mode
            const mode = document.querySelector('input[name="deleteMode"]:checked').value;
            let newLines;

            if (mode === 'keep') {
                // Keep Only: Filter IN the rows
                newLines = lines.filter((_, index) => rowsToDelete.has(index + 1));
            } else {
                // Delete: Filter OUT the rows (default)
                newLines = lines.filter((_, index) => !rowsToDelete.has(index + 1));
            }

            // Rebuild content
            updatedContent = newLines.join('\n');

            showPreview(updatedContent);
        });
    });

    // Helper to read file
    function readFile(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            callback(e.target.result);
        };
        reader.onerror = () => {
            showError('Error reading file.');
        };
        reader.readAsText(file);
    }

    // UI Feedback
    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
    }

    function showPreview(content) {
        errorMsg.style.display = 'none';
        previewSection.style.display = 'block';
        csvPreview.value = content;
    }

    // Download Logic
    downloadBtn.addEventListener('click', () => {
        if (!updatedContent) return;

        const blob = new Blob([updatedContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        // Generate filename
        const originalName = currentFile ? currentFile.name : 'data.csv';
        const newName = originalName.replace('.csv', '_updated.csv');

        a.href = url;
        a.download = newName;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});
