document.addEventListener('DOMContentLoaded', function() {
    // Initialize
    console.log('TechVault Invoice System v2.1.5');
    
    // Tab switching
    window.showTab = function(tabName) {
        const tabs = document.querySelectorAll('.portal-tab');
        const buttons = document.querySelectorAll('.sidebar-btn');
        
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        buttons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        event.target.classList.add('active');
        
        if (tabName === 'history') {
            loadInvoiceHistory();
        }
    };
    
    // Load template
    window.loadTemplate = function() {
        const editor = document.getElementById('xmlEditor');
        if (editor) {
            editor.value = `<?xml version="1.0" encoding="UTF-8"?>
<invoice>
    <invoiceId>INV-2025-${Math.floor(Math.random() * 9999)}</invoiceId>
    <supplier>
        <name>Acme Corporation</name>
        <vendorCode>ACME-5421</vendorCode>
    </supplier>
    <items>
        <item>
            <description>Cloud Services</description>
            <amount>5000.00</amount>
            <currency>USD</currency>
        </item>
    </items>
    <total>5000.00</total>
</invoice>`;
        }
    };
    
    // Clear editor
    window.clearEditor = function() {
        const editor = document.getElementById('xmlEditor');
        const responseBox = document.getElementById('responseBox');
        
        if (editor) {
            editor.value = '';
        }
        
        if (responseBox) {
            responseBox.innerHTML = '<p class="response-placeholder">Response will appear here after submission...</p>';
        }
    };
    
    // Format XML
    window.formatXML = function() {
        const editor = document.getElementById('xmlEditor');
        if (!editor) return;
        
        try {
            const xmlText = editor.value;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            const serializer = new XMLSerializer();
            const formatted = serializer.serializeToString(xmlDoc);
            
            editor.value = formatted;
        } catch (e) {
            alert('Unable to format XML: ' + e.message);
        }
    };
    
    // Submit invoice
    window.submitInvoice = function() {
        const editor = document.getElementById('xmlEditor');
        const responseBox = document.getElementById('responseBox');
        const submitBtn = document.getElementById('submitInvoiceBtn');
        
        if (!editor || !responseBox) return;
        
        const xmlData = editor.value.trim();
        
        if (!xmlData) {
            responseBox.innerHTML = `<pre class="response-error">${JSON.stringify({
                status: 'error',
                message: 'Please enter XML data'
            }, null, 2)}</pre>`;
            return;
        }
        
        // Show loading
        responseBox.innerHTML = '<p style="color: #9ca3af;">Processing invoice...</p>';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        
        // Send request
        fetch('/api/v2/invoice/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: xmlData
        })
        .then(response => response.json())
        .then(data => {
            const className = data.status === 'success' ? 'response-success' : 'response-error';
            responseBox.innerHTML = `<pre class="${className}">${JSON.stringify(data, null, 2)}</pre>`;
        })
        .catch(error => {
            responseBox.innerHTML = `<pre class="response-error">${JSON.stringify({
                status: 'error',
                message: 'Network error: ' + error.message
            }, null, 2)}</pre>`;
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Invoice';
        });
    };
    
    // Load invoice history
    window.loadInvoiceHistory = function() {
        const tableBody = document.getElementById('invoiceHistoryTable');
        if (!tableBody) return;
        
        fetch('/api/v2/invoice/list')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.invoices.length > 0) {
                    let html = '';
                    data.invoices.forEach(inv => {
                        html += `
                            <tr>
                                <td>${inv.id}</td>
                                <td>${inv.supplier}</td>
                                <td>${inv.total}</td>
                                <td><code>${inv.approval_token}</code></td>
                                <td><span class="badge-active">Approved</span></td>
                                <td>${new Date(inv.timestamp).toLocaleString()}</td>
                            </tr>
                        `;
                    });
                    tableBody.innerHTML = html;
                } else {
                    tableBody.innerHTML = '<tr><td colspan="6" class="table-empty">No invoices submitted yet</td></tr>';
                }
            })
            .catch(error => {
                tableBody.innerHTML = '<tr><td colspan="6" class="table-empty">Error loading invoices</td></tr>';
            });
    };
});
