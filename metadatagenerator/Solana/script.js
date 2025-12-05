// Global variables
let csvData = [];
let manualData = [];
let generatedMetadata = {};
let currentChain = 'solana';

// DOM elements
const chainButtons = document.querySelectorAll('.chain-btn');
const methodButtons = document.querySelectorAll('.method-btn');
const inputMethods = document.querySelectorAll('.input-method');
const csvFile = document.getElementById('csv-file');
const uploadArea = document.getElementById('upload-area');
const csvPreview = document.getElementById('csv-preview');
const csvTable = document.getElementById('csv-table');
const manualForm = document.getElementById('manual-form');
const manualList = document.getElementById('manual-list');
const nftList = document.getElementById('nft-list');
const previewBtn = document.getElementById('preview-btn');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const metadataPreview = document.getElementById('metadata-preview');
const downloadOptions = document.getElementById('download-options');
const downloadTemplate = document.getElementById('download-template');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateButtonStates();
});

// Event listeners
function initializeEventListeners() {
    // Chain selection
    chainButtons.forEach(btn => {
        btn.addEventListener('click', () => selectChain(btn.dataset.chain));
    });

    // Input method selection
    methodButtons.forEach(btn => {
        btn.addEventListener('click', () => selectInputMethod(btn.dataset.method));
    });

    // CSV file handling
    csvFile.addEventListener('change', handleFileSelect);
    uploadArea.addEventListener('click', () => csvFile.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);

    // Manual form
    manualForm.addEventListener('submit', handleManualSubmit);

    // Control buttons
    previewBtn.addEventListener('click', previewMetadata);
    generateBtn.addEventListener('click', generateMetadata);
    downloadBtn.addEventListener('click', downloadAllFiles);

    // Download options
    document.getElementById('download-individual').addEventListener('click', () => downloadFiles('individual'));
    document.getElementById('download-zip').addEventListener('click', () => downloadFiles('zip'));
    document.getElementById('download-json').addEventListener('click', () => downloadFiles('json'));

    // Download template
    downloadTemplate.addEventListener('click', downloadCSVTemplate);
}

// Chain selection
function selectChain(chain) {
    if (document.querySelector(`[data-chain="${chain}"]`).disabled) return;
    
    currentChain = chain;
    chainButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.chain === chain);
    });
    
    // Clear existing data when switching chains
    clearAllData();
    updateButtonStates();
}

// Input method selection
function selectInputMethod(method) {
    methodButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.method === method);
    });
    
    inputMethods.forEach(section => {
        section.classList.toggle('active', section.id === `${method}-section`);
    });
}

// File handling
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processCSVFile(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleFileDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processCSVFile(files[0]);
    }
}

function processCSVFile(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please select a CSV file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        parseCSV(csv);
    };
    reader.readAsText(file);
}

function parseCSV(csv) {
    const lines = csv.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        alert('CSV file must contain at least a header row and one data row.');
        return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = currentChain === 'solana' ? ['id', 'name', 'description'] : ['id', 'name', 'description', 'image'];
    
    // Check for required headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
        alert(`Missing required columns: ${missingHeaders.join(', ')}`);
        return;
    }

    // Identify trait columns (any column that's not a required field). 'symbol' is optional and not a trait. Exclude 'image' from traits for Solana format.
    const traitColumns = headers.filter(h => !requiredHeaders.includes(h) && h !== 'symbol' && h !== 'image');
    
    csvData = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index].trim();
            });
            // Store trait columns info for later use
            row._traitColumns = traitColumns;
            csvData.push(row);
        }
    }

    displayCSVPreview();
    updateButtonStates();
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

function displayCSVPreview() {
    if (csvData.length === 0) return;

    // Filter out internal fields from display
    const headers = Object.keys(csvData[0]).filter(h => !h.startsWith('_'));
    let tableHTML = '<thead><tr>';
    headers.forEach(header => {
        tableHTML += `<th>${header.charAt(0).toUpperCase() + header.slice(1)}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    csvData.slice(0, 10).forEach(row => {
        tableHTML += '<tr>';
        headers.forEach(header => {
            const value = row[header] || '';
            const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
            tableHTML += `<td title="${value}">${displayValue}</td>`;
        });
        tableHTML += '</tr>';
    });

    if (csvData.length > 10) {
        tableHTML += `<tr><td colspan="${headers.length}" style="text-align: center; font-style: italic;">... and ${csvData.length - 10} more rows</td></tr>`;
    }

    tableHTML += '</tbody>';
    csvTable.innerHTML = tableHTML;
    csvPreview.style.display = 'block';
}

// Manual form handling
function handleManualSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const nftData = {
        id: document.getElementById('nft-id').value,
        name: document.getElementById('nft-name').value,
        description: document.getElementById('nft-description').value,
        image: document.getElementById('nft-image').value,
        headwear: document.getElementById('trait-headwear').value || 'None',
        eyes: document.getElementById('trait-eyes').value || 'None',
        mouth: document.getElementById('trait-mouth').value || 'None',
        outfit: document.getElementById('trait-outfit').value || 'None',
        body: document.getElementById('trait-body').value || 'None'
    };

    manualData.push(nftData);
    displayManualList();
    event.target.reset();
    updateButtonStates();
}

function displayManualList() {
    if (manualData.length === 0) {
        manualList.style.display = 'none';
        return;
    }

    let listHTML = '';
    manualData.forEach((nft, index) => {
        listHTML += `
            <div class="nft-item">
                <div class="nft-info">
                    <h5>${nft.name}</h5>
                    <p>${nft.description.substring(0, 100)}${nft.description.length > 100 ? '...' : ''}</p>
                </div>
                <div class="nft-actions">
                    <button onclick="removeManualNFT(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    nftList.innerHTML = listHTML;
    manualList.style.display = 'block';
}

function removeManualNFT(index) {
    manualData.splice(index, 1);
    displayManualList();
    updateButtonStates();
}

// Metadata generation
function previewMetadata() {
    const data = getCurrentData();
    if (data.length === 0) return;

    const sample = data.slice(0, 3);
    let previewHTML = '';

    sample.forEach(nft => {
        const metadata = generateNFTMetadata(nft);
        
        previewHTML += `
            <div class="metadata-item">
                <div class="metadata-header">
                    <span>${nft.name || nft.id}</span>
                    <span>${currentChain.toUpperCase()}</span>
                </div>
                <div class="metadata-content">
                    <pre>${JSON.stringify(metadata, null, 2)}</pre>
                </div>
            </div>
        `;
    });

    if (data.length > 3) {
        previewHTML += `
            <div class="metadata-item">
                <div class="metadata-header">
                    <span>... and ${data.length - 3} more NFTs</span>
                </div>
            </div>
        `;
    }

    metadataPreview.innerHTML = previewHTML;
}

function generateMetadata() {
    const data = getCurrentData();
    if (data.length === 0) return;

    generatedMetadata = {};
    
    data.forEach(nft => {
        const metadata = generateNFTMetadata(nft);
        const id = nft.id || nft.name;
        generatedMetadata[id] = metadata;
    });

    displayGeneratedMetadata();
    updateButtonStates();
}

function generateNFTMetadata(nft) {
    switch (currentChain) {
        case 'cardano':
            return generateCardanoMetadata(nft);
        case 'ethereum':
            return generateEthereumMetadata(nft);
        case 'solana':
            return generateSolanaMetadata(nft);
        case 'polygon':
            return generatePolygonMetadata(nft);
        default:
            return generateCardanoMetadata(nft);
    }
}

function generateCardanoMetadata(nft) {
    const metadata = {
        name: nft.name,
        description: nft.description,
        image: nft.image,
        mediaType: "image/png"
    };

    // Add traits dynamically based on CSV columns or use default traits for manual entry
    let traits;
    if (nft._traitColumns && nft._traitColumns.length > 0) {
        // Use dynamic traits from CSV
        traits = nft._traitColumns;
    } else {
        // Use default traits for manual entry
        traits = ['headwear', 'eyes', 'mouth', 'outfit', 'body'];
    }
    
    traits.forEach(trait => {
        if (nft[trait] && nft[trait] !== 'None' && nft[trait].trim() !== '') {
            metadata[trait] = nft[trait];
        }
    });

    return metadata;
}

function generateEthereumMetadata(nft) {
    const attributes = [];
    
    // Add traits dynamically based on CSV columns or use default traits for manual entry
    let traits;
    if (nft._traitColumns && nft._traitColumns.length > 0) {
        // Use dynamic traits from CSV
        traits = nft._traitColumns;
    } else {
        // Use default traits for manual entry
        traits = ['headwear', 'eyes', 'mouth', 'outfit', 'body'];
    }
    
    traits.forEach(trait => {
        if (nft[trait] && nft[trait] !== 'None' && nft[trait].trim() !== '') {
            attributes.push({
                trait_type: toTitleCase(trait),
                value: nft[trait]
            });
        }
    });

    return {
        name: nft.name,
        description: nft.description,
        image: nft.image,
        attributes: attributes
    };
}

function generateSolanaMetadata(nft) {
    const attributes = [];
    
    // Add traits dynamically based on CSV columns or use default traits for manual entry
    let traits;
    if (nft._traitColumns && nft._traitColumns.length > 0) {
        traits = nft._traitColumns;
    } else {
        traits = ['headwear', 'eyes', 'mouth', 'outfit', 'body'];
    }
    
    traits.forEach(trait => {
        if (nft[trait] && nft[trait] !== 'None' && nft[trait].trim() !== '') {
            attributes.push({
                trait_type: toTitleCase(trait),
                value: nft[trait]
            });
        }
    });

    return {
        name: nft.name,
        symbol: nft.symbol || "NFT",
        description: nft.description,
        attributes: attributes
    };
}

function generatePolygonMetadata(nft) {
    return generateEthereumMetadata(nft); // Same format as Ethereum
}

function displayGeneratedMetadata() {
    const keys = Object.keys(generatedMetadata);
    if (keys.length === 0) return;

    let metadataHTML = '';
    keys.forEach(key => {
        const metadata = generatedMetadata[key];
        
        metadataHTML += `
            <div class="metadata-item">
                <div class="metadata-header">
                    <span>${key}</span>
                    <button onclick="downloadSingleFile('${key}')" class="btn-link" style="color: white;">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
                <div class="metadata-content">
                    <pre>${JSON.stringify(metadata, null, 2)}</pre>
                </div>
            </div>
        `;
    });

    metadataPreview.innerHTML = metadataHTML;
}

// Download functions
function downloadAllFiles() {
    // Download a ZIP archive containing one JSON file per NFT
    downloadZipFile();
}

function showDownloadOptions() {
    downloadOptions.style.display = downloadOptions.style.display === 'none' ? 'block' : 'none';
}

function downloadFiles(type) {
    const keys = Object.keys(generatedMetadata);
    if (keys.length === 0) return;

    switch (type) {
        case 'individual':
            keys.forEach(key => downloadSingleFile(key));
            break;
        case 'zip':
            downloadZipFile();
            break;
        case 'json':
            downloadSingleJSON();
            break;
    }
}

function downloadSingleFile(key) {
    // Download a single file containing just the NFT's metadata object
    const metadata = generatedMetadata[key];
    
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${key}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadZipFile() {
    const zip = new JSZip();
    const keys = Object.keys(generatedMetadata);

    keys.forEach(key => {
        // Add plain metadata object for each file in ZIP
        const metadata = generatedMetadata[key];
        zip.file(`${key}.json`, JSON.stringify(metadata, null, 2));
    });

    zip.generateAsync({ type: 'blob' }).then(function(content) {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentChain}_nft_metadata.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function downloadSingleJSON() {
    // Create a single JSON file with all metadata in nested structure
    const finalMetadata = {};
    Object.keys(generatedMetadata).forEach(id => {
        finalMetadata[id] = generatedMetadata[id];
    });
    
    const blob = new Blob([JSON.stringify(finalMetadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentChain}_nft_metadata_collection.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadCSVTemplate() {
    const template = `ID,name,description,symbol,Accessory,Background,Face,Left Eye,Mouth,Right Eye
1,NFT #1,NFT #1 - Generated and deployed on LaunchMyNFT.,NFT,Horns Yellow,Black,Round Aqua,Swirl Orange,Grin Green,X Aqua
2,NFT #2,NFT #2 - Generated and deployed on LaunchMyNFT.,NFT,Horns Red,Blue,Round Purple,Swirl Green,Grin Blue,X Yellow`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nft_metadata_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/* Utility helpers */
function toTitleCase(str) {
    return str.split(/[\s_]+/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

// Utility functions
function getCurrentData() {
    const activeMethod = document.querySelector('.method-btn.active').dataset.method;
    return activeMethod === 'csv' ? csvData : manualData;
}

function updateButtonStates() {
    const data = getCurrentData();
    const hasData = data.length > 0;
    const hasMetadata = Object.keys(generatedMetadata).length > 0;

    previewBtn.disabled = !hasData;
    generateBtn.disabled = !hasData;
    downloadBtn.disabled = !hasMetadata;

    if (hasMetadata) {
        downloadOptions.style.display = 'block';
    }
}

function clearAllData() {
    csvData = [];
    manualData = [];
    generatedMetadata = {};
    
    csvPreview.style.display = 'none';
    manualList.style.display = 'none';
    downloadOptions.style.display = 'none';
    
    metadataPreview.innerHTML = `
        <div class="preview-placeholder">
            <i class="fas fa-file-code"></i>
            <p>Upload CSV or add NFTs manually to generate metadata</p>
        </div>
    `;
    
    updateButtonStates();
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    alert('An error occurred. Please check the console for details.');
});

// Utility function to validate IPFS URLs
function isValidIPFS(url) {
    return url.startsWith('ipfs://') || url.startsWith('https://ipfs.io/') || url.startsWith('https://gateway.pinata.cloud/');
}

// Add validation to form inputs
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('nft-image');
    if (imageInput) {
        imageInput.addEventListener('blur', function() {
            if (this.value && !isValidIPFS(this.value)) {
                this.style.borderColor = '#dc3545';
                this.title = 'Please enter a valid IPFS URL (e.g., ipfs://...)';
            } else {
                this.style.borderColor = '#e0e0e0';
                this.title = '';
            }
        });
    }
});
