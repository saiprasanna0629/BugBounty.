from flask import Flask, render_template, request, session, redirect, url_for, jsonify
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

def init_db():
    conn = sqlite3.connect('healthportal.db')
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY, username TEXT UNIQUE, email TEXT, 
                  password TEXT, full_name TEXT, dob TEXT, phone TEXT, 
                  address TEXT, created_at TEXT, ssn TEXT, insurance_id TEXT, 
                  credit_card TEXT, bank_account TEXT)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS medical_records
                 (id INTEGER PRIMARY KEY, user_id INTEGER, diagnosis TEXT, 
                  doctor TEXT, date TEXT, notes TEXT, prescription TEXT)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS lab_results
                 (id INTEGER PRIMARY KEY, user_id INTEGER, test_name TEXT, 
                  result TEXT, date TEXT, status TEXT, report_file TEXT)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS appointments
                 (id INTEGER PRIMARY KEY, user_id INTEGER, doctor TEXT, 
                  specialty TEXT, date TEXT, time TEXT, status TEXT, notes TEXT)''')
    
    # TARGET: Amanda Peterson - CEO with highly sensitive information
    users = [
        (1001, 'john.doe', 'john.doe@email.com', generate_password_hash('patient123'), 
         'John Doe', '1985-03-15', '555-0101', '123 Main St, Boston, MA', '2024-01-15',
         '123-45-6789', 'INS-1001-ABC', '4532-1234-5678-9010', 'ACC-1001-8765432'),
        (1002, 'sarah.smith', 'sarah.smith@email.com', generate_password_hash('patient456'), 
         'Sarah Smith', '1990-07-22', '555-0102', '456 Oak Ave, Boston, MA', '2024-02-20',
         '987-65-4321', 'INS-1002-DEF', '4532-2345-6789-0123', 'ACC-1002-7654321'),
        (1003, 'mike.johnson', 'mike.johnson@email.com', generate_password_hash('patient789'), 
         'Mike Johnson', '1978-11-08', '555-0103', '789 Pine Rd, Boston, MA', '2024-03-10',
         '456-78-9012', 'INS-1003-GHI', '4532-3456-7890-1234', 'ACC-1003-6543210'),
        # TARGET PATIENT - CEO with valuable personal and financial information
        (1004, 'a.peterson', 'amanda.peterson@techcorp.com', generate_password_hash('secure2025'), 
         'Amanda Peterson', '1972-08-14', '555-0199', 'Penthouse Suite, 500 Executive Tower, Boston, MA', '2023-06-01',
         '555-12-8888', 'INS-PLATINUM-EXEC', '4532-8888-9999-0000', 'ACC-CEO-9876543210'),
    ]
    
    medical_records = [
        (5001, 1001, 'Type 2 Diabetes', 'Dr. Emily Chen', '2025-10-01', 
         'Patient shows improved glucose levels. Continue current medication regimen.', 'Metformin 500mg twice daily'),
        (5002, 1002, 'Hypertension', 'Dr. Robert Williams', '2025-09-15', 
         'Blood pressure well controlled with current medication. Monitor monthly.', 'Lisinopril 10mg daily'),
        (5003, 1003, 'Seasonal Allergies', 'Dr. Emily Chen', '2025-10-05', 
         'Prescribed antihistamine for seasonal allergy management.', 'Cetirizine 10mg as needed'),
        (5004, 1004, 'Executive Stress Management', 'Dr. James Anderson', '2025-10-12',
         'CEO experiencing high stress levels due to upcoming merger negotiations. Patient disclosed concerns about Q4 earnings report showing 15% revenue decline. Recommended stress management therapy and confidential counseling. Patient mentioned planned acquisition of competitor "DataSync Solutions" for $2.3 billion - deal confidential until January 2026 announcement.', 
         'Alprazolam 0.5mg as needed, max 2x daily'),
    ]
    
    lab_results = [
        (2001, 1001, 'HbA1c Test', '6.2%', '2025-10-10', 'Normal', 'lab_2001.pdf'),
        (2002, 1002, 'Lipid Panel', 'Total Cholesterol: 195 mg/dL', '2025-09-20', 'Normal', 'lab_2002.pdf'),
        (2003, 1003, 'Complete Blood Count', 'WBC: 7.5 K/uL, Normal range', '2025-10-08', 'Normal', 'lab_2003.pdf'),
        (2004, 1004, 'Executive Health Panel', 'Cortisol: Elevated (32 mcg/dL). Stress markers significantly elevated.', '2025-10-13', 'Confidential', 'lab_2004_EXEC_CONFIDENTIAL.pdf'),
    ]
    
    appointments = [
        (3001, 1001, 'Dr. Emily Chen', 'Endocrinology', '2025-11-15', '10:00 AM', 'Scheduled', 'Routine diabetes follow-up'),
        (3002, 1002, 'Dr. Robert Williams', 'Cardiology', '2025-11-20', '2:00 PM', 'Scheduled', 'Blood pressure checkup'),
        (3003, 1003, 'Dr. Emily Chen', 'Allergy & Immunology', '2025-11-18', '11:30 AM', 'Scheduled', 'Allergy testing'),
        (3004, 1004, 'Dr. James Anderson', 'Executive Psychiatry', '2025-11-25', '7:00 AM', 'VIP Private', 'Confidential therapy session - merger stress'),
    ]
    
    c.executemany('INSERT OR IGNORE INTO users VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', users)
    c.executemany('INSERT OR IGNORE INTO medical_records VALUES (?,?,?,?,?,?,?)', medical_records)
    c.executemany('INSERT OR IGNORE INTO lab_results VALUES (?,?,?,?,?,?,?)', lab_results)
    c.executemany('INSERT OR IGNORE INTO appointments VALUES (?,?,?,?,?,?,?,?)', appointments)
    
    conn.commit()
    conn.close()

init_db()

@app.route('/', methods=['GET', 'POST'])
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        conn = sqlite3.connect('healthportal.db')
        c = conn.cursor()
        c.execute('SELECT * FROM users WHERE username=?', (username,))
        user = c.fetchone()
        conn.close()
        
        if user and check_password_hash(user[3], password):
            session['user_id'] = user[0]
            session['username'] = user[1]
            session['full_name'] = user[4]
            return redirect(url_for('dashboard'))
        
        return render_template('login.html', error='Invalid credentials')
    
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    # VULNERABLE: accepts user_id from query parameter
    user_id = request.args.get('user_id', session['user_id'])
    
    conn = sqlite3.connect('healthportal.db')
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE id=?', (user_id,))
    user = c.fetchone()
    conn.close()
    
    if not user:
        return 'User not found', 404
    
    return render_template('dashboard.html', user=user, current_user=session['user_id'])

@app.route('/api/medical-records/<int:record_id>')
def get_medical_record(record_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    # VULNERABLE: no authorization check
    conn = sqlite3.connect('healthportal.db')
    c = conn.cursor()
    c.execute('SELECT * FROM medical_records WHERE id=?', (record_id,))
    record = c.fetchone()
    conn.close()
    
    if record:
        return jsonify({
            'id': record[0],
            'user_id': record[1],
            'diagnosis': record[2],
            'doctor': record[3],
            'date': record[4],
            'notes': record[5],
            'prescription': record[6]
        })
    return jsonify({'error': 'Not found'}), 404

@app.route('/lab-results')
def lab_results():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    # VULNERABLE
    user_id = request.args.get('patient_id', session['user_id'])
    
    conn = sqlite3.connect('healthportal.db')
    c = conn.cursor()
    c.execute('SELECT * FROM lab_results WHERE user_id=?', (user_id,))
    results = c.fetchall()
    conn.close()
    
    return render_template('lab_results.html', results=results, patient_id=user_id)

@app.route('/appointments')
def appointments():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    # VULNERABLE
    user_id = request.args.get('user_id', session['user_id'])
    
    conn = sqlite3.connect('healthportal.db')
    c = conn.cursor()
    c.execute('SELECT * FROM appointments WHERE user_id=?', (user_id,))
    appointments = c.fetchall()
    conn.close()
    
    return render_template('appointments.html', appointments=appointments)

@app.route('/download/<filename>')
def download_report(filename):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    # VULNERABLE: no ownership check
    return f"<h2>Downloading: {filename}</h2><p>File download simulated for security testing purposes.</p>"

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True, port=5000)
