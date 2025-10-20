from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import uuid
import re

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app, expose_headers='X-Vulnerability-Confirmed')

# --- Storage for Fixed Flags ---
# These are now predefined and will be the same every time the server runs.
FIXED_FLAGS = {
    'xss-reflected': 'a8f5b4d2e1c9a0b3f5d8e7c6a5b4d3e2',
    'idor': 'c3d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5',
    'xss-stored': 'b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4',
    'sqli': 'e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1'
}

# --- Simulated Database ---
ADMIN_UUID = str(uuid.uuid4())
ALICE_UUID = str(uuid.uuid4())
BOB_UUID = str(uuid.uuid4())

USERS = {
    ALICE_UUID: {'name': 'Alice', 'title': 'Student Coordinator', 'bio': 'A creative mind...', 'last_support_ticket': f'Ticket #735 resolved by administrator ({ADMIN_UUID}).'},
    BOB_UUID: {'name': 'Bob', 'title': 'Faculty Advisor', 'bio': 'Professor of Computer Science...'},
    ADMIN_UUID: {'name': 'Fest Admin', 'title': 'Portal Administrator', 'bio': 'I manage the portal.', 'private_note': 'Reminder: The staging server password is temp-admin-pass-2025!', 'password_hash': 'sha256$f4a22b35a...c9e1'}
}
PRODUCTS = {'1': {'name': 'DJ Night Ticket'}, '2': {'name': 'Workshop Pass'}, '3': {'name': 'Food Coupon'}}
POSTS = ["Welcome to the guestbook!"]

def flawed_sanitize(comment):
    sanitized = comment.replace('<script>', '').replace('</script>', '')
    sanitized = re.sub(r'onerror\s*=', '', sanitized, flags=re.IGNORECASE)
    return sanitized

# --- API Endpoints ---

@app.route('/api/generate-flag/<challenge_id>')
def generate_flag(challenge_id):
    """
    Returns a fixed, predefined string for a given challenge.
    """
    flag = FIXED_FLAGS.get(challenge_id, "invalid_challenge_id")
    return jsonify({'flag': flag})

@app.route('/api/users')
def get_public_users():
    public_users = [
        {'id': ALICE_UUID, 'name': 'Alice', 'title': USERS[ALICE_UUID]['title']},
        {'id': BOB_UUID, 'name': 'Bob', 'title': USERS[BOB_UUID]['title']}
    ]
    return jsonify(public_users)
        
@app.route('/api/search')
def search():
    query = request.args.get('q', '')
    if '<script>' in query.lower():
        response_html = "Search term contains invalid characters."
    else:
        response_html = f"You searched for: {query}"
    
    response = jsonify({'html': response_html})
    if '<script>' not in query.lower() and re.search(r'\s+on[a-z]+\s*=', query, re.IGNORECASE):
        response.headers['X-Vulnerability-Confirmed'] = 'xss-reflected'
    return response

@app.route('/api/profile/<user_id>')
def profile(user_id):
    user_info = USERS.get(user_id)
    if user_info:
        user_data_safe = user_info.copy()
        user_data_safe.pop('password_hash', None)
        response = jsonify({'user': user_data_safe})
        if user_id == ADMIN_UUID:
            response.headers['X-Vulnerability-Confirmed'] = 'idor'
        return response
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/api/guestbook', methods=['GET', 'POST'])
def guestbook():
    if request.method == 'POST':
        comment = request.json.get('comment', '')
        sanitized_comment = flawed_sanitize(comment)
        POSTS.append(sanitized_comment)
        return jsonify({'status': 'success'})

    response = jsonify({'posts': POSTS})
    for post in POSTS:
        if (re.search(r'\s+on[a-z]+\s*=', post, re.IGNORECASE) or 
            re.search(r'</?script>', post, re.IGNORECASE) or 
            re.search(r'</?svg>', post, re.IGNORECASE)):
            response.headers['X-Vulnerability-Confirmed'] = 'xss-stored'
            break
    return response

@app.route('/api/products')
def get_products():
    query = request.args.get('q', '')
    results = []
    union_match = re.search(r"union\s+select\s+([^,]+)\s*,\s*([^-]+)", query, re.IGNORECASE)
    
    if union_match:
        col1, col2 = union_match.group(1).strip(), union_match.group(2).strip()
        if col1.lower() == 'name' and col2.lower() == 'password_hash':
             for user in USERS.values():
                results.append({'name': user.get('name'), 'description': user.get('password_hash', 'N/A')})
    else:
        for product in PRODUCTS.values():
            if query.lower() in product.get('name', '').lower():
                results.append(product)

    response = jsonify(results)
    if union_match and any(r.get('description', '').startswith('sha256$') for r in results):
        response.headers['X-Vulnerability-Confirmed'] = 'sqli'
    return response

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    print("--- Starting Vulnerable Fest Portal ---")
    print(f"[*] Alice's UUID: {ALICE_UUID}")
    print(f"[*] Bob's UUID:   {BOB_UUID}")
    print(f"[*] Admin's UUID: {ADMIN_UUID} (Keep this one secret!)")
    print("---------------------------------------")
    app.run(host='0.0.0.0', port=5000)

