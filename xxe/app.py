from flask import Flask, render_template, request, jsonify
from lxml import etree
from datetime import datetime
import os
import uuid
from io import BytesIO

app = Flask(__name__)

invoices_db = []
CONFIG_DIR = '/tmp/techvault/config'
CONFIG_FILE = f'{CONFIG_DIR}/api_keys.xml'

# Custom resolver with path restrictions
class RestrictedResolver(etree.Resolver):
    """
    Custom resolver that only allows access to specific whitelisted files
    This prevents players from accessing sensitive system files
    """
    
    # Whitelist of allowed files for the challenge
    ALLOWED_FILES = [
        '/tmp/techvault/config/api_keys.xml',      # Challenge flag file
        '/tmp/techvault/config/database.xml',      # Decoy file
        '/tmp/techvault/logs/application.log',     # Decoy file
        '/tmp/techvault/docs/readme.txt',          # Decoy file
        '/etc/hostname',                            # Harmless system file (for testing)
    ]
    
    def resolve(self, url, id, context):
        # Extract the file path from the URL
        if url.startswith('file://'):
            file_path = url.replace('file://', '')
        else:
            file_path = url
        
        # Normalize the path to prevent directory traversal
        file_path = os.path.normpath(file_path)
        
        # Check if the requested file is in the whitelist
        if file_path not in self.ALLOWED_FILES:
            # Return empty content for unauthorized files
            # This prevents access to /etc/passwd, /etc/shadow, etc.
            return self.resolve_string("", context)
        
        # If file is whitelisted, allow access
        return self.resolve_filename(url, context)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/api/v2/invoice/submit', methods=['POST'])
def submit_invoice():
    try:
        xml_data = request.data
        xml_file = BytesIO(xml_data)
        
        # Create parser with restricted resolver
        parser = etree.XMLParser(
            load_dtd=True,
            resolve_entities=True
        )
        
        # Add the restricted resolver
        parser.resolvers.add(RestrictedResolver())
        
        # Parse the XML
        tree = etree.parse(xml_file, parser)
        root = tree.getroot()
        
        invoice_id = root.find('.//invoiceId')
        supplier_name = root.find('.//supplier/name')
        vendor_code = root.find('.//supplier/vendorCode')
        total = root.find('.//total')
        
        if supplier_name is not None:
            # Get all text content from the element
            supplier_text = etree.tostring(supplier_name, method='text', encoding='unicode')
            
            valid_suppliers = [
                'Acme Corporation', 
                'TechSupply Inc', 
                'CloudVendor LLC',
                'Global Solutions Ltd',
                'Enterprise Systems Inc'
            ]
            
            if supplier_text.strip() not in valid_suppliers:
                return jsonify({
                    'status': 'error',
                    'code': 'INVALID_SUPPLIER',
                    'message': f'Supplier not found: {supplier_text}',
                    'timestamp': datetime.now().isoformat()
                }), 400
            
            approval_token = f"APR-{uuid.uuid4().hex[:8]}"
            
            invoice_record = {
                'id': invoice_id.text if invoice_id is not None else f"INV-{uuid.uuid4().hex[:8]}",
                'supplier': supplier_text.strip(),
                'vendor_code': vendor_code.text if vendor_code is not None else 'N/A',
                'total': total.text if total is not None else '0.00',
                'approval_token': approval_token,
                'timestamp': datetime.now().isoformat()
            }
            
            invoices_db.append(invoice_record)
            
            return jsonify({
                'status': 'success',
                'invoiceId': invoice_record['id'],
                'approvalToken': approval_token,
                'message': f'Invoice submitted successfully for supplier: {supplier_text.strip()}',
                'timestamp': datetime.now().isoformat()
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'code': 'MISSING_SUPPLIER',
                'message': 'Supplier information is required',
                'timestamp': datetime.now().isoformat()
            }), 400
            
    except etree.XMLSyntaxError as e:
        return jsonify({
            'status': 'error',
            'code': 'XML_PARSE_ERROR',
            'message': f'Invalid XML format: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 400
    except Exception as e:
        return jsonify({
            'status': 'error',
            'code': 'INTERNAL_ERROR',
            'message': f'Error: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'operational',
        'version': '2.1.5',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/robots.txt')
def robots():
    return """User-agent: *
Disallow: /api/debug/

# Config: /tmp/techvault/config/api_keys.xml
""", 200, {'Content-Type': 'text/plain'}

if __name__ == '__main__':
    # Create all directories
    os.makedirs(CONFIG_DIR, exist_ok=True)
    os.makedirs('/tmp/techvault/logs', exist_ok=True)
    os.makedirs('/tmp/techvault/docs', exist_ok=True)
    
    # In the config file, make the password clearly labeled
    config_content = '''<?xml version="1.0" encoding="UTF-8"?>
    <configuration>
        <services>
            <payment_gateway>
                <provider>StripeConnect</provider>
                <api_key>sk_live_51Hx7y8K9p2Q3r4S5t6U7v8W9x0Y1z2A3b4C5d6E</api_key>
            </payment_gateway>
            <database>
                <host>db.internal.techvault.com</host>
                <username>admin_db</username>
                <password>P@ssw0rd_2025_Secure!</password>
                <database>invoice_production</database>
            </database>
            <internal_note>
                <message>Database credentials for production environment</message>
            </internal_note>
        </services>
    </configuration>'''

    
    with open(CONFIG_FILE, 'w') as f:
        f.write(config_content)
    
    # Create decoy files (no useful information)
    decoy_db_config = '''<?xml version="1.0" encoding="UTF-8"?>
<database>
    <connection>
        <host>localhost</host>
        <port>5432</port>
        <type>postgresql</type>
    </connection>
    <note>This is a decoy file. No credentials here!</note>
</database>'''
    
    with open(f'{CONFIG_DIR}/database.xml', 'w') as f:
        f.write(decoy_db_config)
    
    # Create decoy log file
    decoy_log = '''[2025-10-21 14:23:45] INFO: Application started
[2025-10-21 14:24:12] INFO: Invoice received from supplier
[2025-10-21 14:25:33] INFO: Processing invoice INV-2025-1001
[2025-10-21 14:26:45] WARNING: Invalid XML format detected
[2025-10-21 14:27:12] INFO: Invoice approved
'''
    
    with open('/tmp/techvault/logs/application.log', 'w') as f:
        f.write(decoy_log)
    
    # Create decoy readme
    decoy_readme = '''TechVault Invoice Processing System
Version: 2.1.5
Environment: Production

This system processes XML-based invoices from registered suppliers.
For support, contact: support@techvault.com

Configuration files are stored in /tmp/techvault/config/
'''
    
    with open('/tmp/techvault/docs/readme.txt', 'w') as f:
        f.write(decoy_readme)
    
    print("=" * 70)
    print("TechVault Invoice Processing System - XXE Challenge (Restricted)")
    print("=" * 70)
    print(f"Server: http://localhost:5000")
    print(f"Bounty file: {CONFIG_FILE}")
    print("\nAllowed files for XXE exploitation:")
    print("  ✓ /tmp/techvault/config/api_keys.xml (FLAG HERE)")
    print("  ✓ /tmp/techvault/config/database.xml (decoy)")
    print("  ✓ /tmp/techvault/logs/application.log (decoy)")
    print("  ✓ /tmp/techvault/docs/readme.txt (decoy)")
    print("  ✓ /etc/hostname (for testing)")

    print("=" * 70)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
