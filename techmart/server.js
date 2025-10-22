const express = require('express');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(fileUpload());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Product database
const products = [
    { id: 1, name: "Quantum Processor X1", price: 899.99, category: "Electronics", image: "🖥️", description: "Revolutionary quantum computing processor for next-gen applications" },
    { id: 2, name: "NeuralLink Headset", price: 1299.99, category: "Electronics", image: "🎧", description: "Direct brain-computer interface for immersive experiences" },
    { id: 3, name: "HoloDisplay Pro", price: 2499.99, category: "Electronics", image: "📱", description: "3D holographic display technology" },
    { id: 4, name: "BioFuel Cell", price: 599.99, category: "Energy", image: "🔋", description: "Sustainable biological energy cell" },
    { id: 5, name: "SmartFabric Jacket", price: 349.99, category: "Clothing", image: "🧥", description: "Temperature-adaptive smart clothing" },
    { id: 6, name: "Nanobot Health Kit", price: 4999.99, category: "Medical", image: "💊", description: "Personal health monitoring nanobots" },
    { id: 7, name: "GravityBoard", price: 899.99, category: "Sports", image: "🛹", description: "Anti-gravity hovering skateboard" },
    { id: 8, name: "AI Companion Drone", price: 1799.99, category: "Robotics", image: "🤖", description: "Autonomous personal assistant drone" },
    { id: 9, name: "Solar Paint", price: 299.99, category: "Energy", image: "🎨", description: "Photovoltaic paint for energy generation" },
    { id: 10, name: "TimeFreeze Camera", price: 2199.99, category: "Electronics", image: "📷", description: "Ultra high-speed photography system" },
    { id: 11, name: "Atmospheric Water Generator", price: 799.99, category: "Utilities", image: "💧", description: "Extract water from air humidity" },
    { id: 12, name: "Molecular Food Printer", price: 3499.99, category: "Kitchen", image: "🍔", description: "3D print food from molecular ingredients" }
];

// Get all products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Regular product API (no vulnerability)
app.get('/api/product', (req, res) => {
    const productId = req.query.itemRef;
    
    if (!productId || isNaN(productId)) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    const id = parseInt(productId);
    const product = products.find(p => p.id === id);
    
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
});

/* ==================== VULNERABILITY 1: SENSITIVE DATA EXPOSURE VIA COMMENTS ==================== */
/* NEW CONCEPT: Instead of parameter manipulation, this uses HTML/JS comments exposure */

// API endpoint that returns user data with sensitive comments
app.get('/api/user-profile', (req, res) => {
    const token = req.cookies.sessionToken;
    
    // VULNERABILITY: Sensitive information in response that should be server-side only
    const userData = {
        username: token === 'user_root_authenticated' ? 'root' : 'guest',
        email: 'user@techmart.com',
        memberSince: 'January 2025',
        role: 'customer',
        // CRITICAL: API returns more data than UI shows
        _internal_notes: 'User authentication uses weak session tokens',
        _framework_info: 'Backend powered by PHP 7.4.33 with Apache/2.4.52',
        _debug_mode: true,
        _database_version: 'MySQL 8.0.31',
        _user_id: 'uid8796-1001',
        orders: []
    };
    
    res.json(userData);
});

/* ==================== VULNERABILITY 2: EXPOSED ADMIN PANEL ==================== */
app.get('/sys-admin-portal-x7k9', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

/* ==================== VULNERABILITY 3: FILE UPLOAD WITH MIME TYPE BYPASS ==================== */

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'root' && password === 'toor') {
        // Create unique session for each user
        const sessionId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        res.cookie('sessionToken', 'user_root_authenticated', { maxAge: 3600000 });
        res.cookie('sessionId', sessionId, { maxAge: 3600000 });
        res.json({ success: true, message: 'Login successful', user: 'root' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Check session
app.get('/api/session', (req, res) => {
    const token = req.cookies.sessionToken;
    if (token === 'user_root_authenticated') {
        res.json({ authenticated: true, user: 'root' });
    } else {
        res.json({ authenticated: false });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    res.clearCookie('sessionToken');
    res.clearCookie('sessionId');
    res.json({ success: true });
});

// File upload with MIME type check (VULNERABLE)
app.post('/api/upload-avatar', (req, res) => {
    const token = req.cookies.sessionToken;
    const sessionId = req.cookies.sessionId || 'default';
    
    if (token !== 'user_root_authenticated') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!req.files || !req.files.avatar) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const file = req.files.avatar;
    
    // VULNERABILITY: Only checks MIME type from request header
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({ 
            error: 'Invalid file type. Only image/jpeg, image/png, and image/gif are allowed.' 
        });
    }
    
    // Create user-specific upload directory
    const userUploadDir = path.join(__dirname, 'uploads', sessionId);
    if (!fs.existsSync(userUploadDir)) {
        fs.mkdirSync(userUploadDir, { recursive: true });
    }
    
    const fileName = file.name;
    const uploadPath = path.join(userUploadDir, fileName);
    
    file.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Upload failed' });
        }
        
        res.json({ 
            success: true, 
            message: 'Avatar uploaded successfully',
            filename: fileName,
            path: `/uploads/${sessionId}/${fileName}`
        });
    });
});

// Serve uploaded files with PHP execution simulation
app.get('/uploads/:sessionId/:filename', (req, res) => {
    const { sessionId, filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', sessionId, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }
    
    // VULNERABILITY: Simulates PHP execution for .php files
    if (filename.endsWith('.php')) {
        // Read the PHP file content
        const phpContent = fs.readFileSync(filePath, 'utf8');
        
        // Parse and simulate LIMITED PHP execution (SAFE SIMULATION)
        // Only allow specific safe patterns
        
        // Pattern 1: file_get_contents with specific paths
        const fileGetContentsPattern = /file_get_contents\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        let match;
        let output = '';
        
        while ((match = fileGetContentsPattern.exec(phpContent)) !== null) {
            const requestedPath = match[1];
            
            // ONLY allow reading the secret file (safe, controlled)
            if (requestedPath === '/home/sushanth/secret' || 
                requestedPath.includes('secret')) {
                output += 'Welcome Sush4nth! \n This is what you thought of hiding : !MyS3cr3t@-2k2s143\n';
            } else if (requestedPath === '/etc/passwd') {
                output += '[BLOCKED] Access to /etc/passwd is restricted\n';
            } else {
                output += '[BLOCKED] Access denied\n';
            }
        }
        
        // Pattern 2: system() or exec() calls - BLOCK dangerous commands
        const systemPattern = /(?:system|exec|shell_exec|passthru)\s*\(/;
        if (systemPattern.test(phpContent)) {
            output += '\n[SECURITY] Dangerous functions detected and blocked\n';
            output += 'Allowed operations: file_get_contents() with whitelisted paths only\n';
        }
        
        // Pattern 3: phpinfo() - show limited info
        if (phpContent.includes('phpinfo()')) {
            output += '\n=== PHP Information ===\n';
            output += 'PHP Version: 7.4.33\n';
            output += 'Server: Apache/2.4.52\n';
            output += 'Loaded Extensions: Core, date, json, mysqli\n';
        }
        
        // If no recognized patterns, show hint
        if (!output) {
            output = '<!-- PHP Execution Environment -->\n';
            output += '<!-- Hint: Try using file_get_contents() -->\n';
            output += 'PHP script uploaded but no output generated.\n';
        }
        
        // Send as text/html to display in browser
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send('<pre>' + output + '</pre>');
        return;
    }
    
    // For non-PHP files, serve normally
    res.sendFile(filePath);
});

// Create secret file
const secretContent = '!MyS3cr3t@-2k2s143';
fs.writeFileSync(path.join(__dirname, 'secret.txt'), secretContent);

// Add PHP version header to all responses (HINT for participants)
app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'PHP/7.4.33');
    next();
});

app.listen(PORT, () => {
    console.log(`\n🚀 TechMart Vulnerable App running on http://localhost:${PORT}`);
    console.log(`\n=== BUG BOUNTY CHALLENGES ===\n`);
    console.log(`📍 Challenge 1: SENSITIVE DATA EXPOSURE`);
    console.log(`   Type: Information Disclosure via API Response`);
    console.log(`   Hint: Check network requests when viewing your profile`);
    console.log(`   bug : user id -- uid8796-1001\n`);
    
    console.log(`📍 Challenge 2: ACCESS CONTROL BYPASS`);
    console.log(`   Type: Exposed Admin Panel`);
    console.log(`   Hint: What files do search engines check first?`);
    console.log(`   Bug ID : 2025-T3ChM4RT-4782\n`);
    
    console.log(`📍 Challenge 3: FILE UPLOAD VULNERABILITY`);
    console.log(`   Type: MIME Type Bypass + RCE`);
    console.log(`   Hint: Server supports PHP. Can you upload executable code?`);
    console.log(`   Flag : !MyS3cr3t@-2k2s143\n`);
    
    console.log(`⚠️  Each user gets isolated upload directory for security\n`);
});
