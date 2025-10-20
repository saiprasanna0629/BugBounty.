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
app.use('/uploads', express.static('uploads'));

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

// Vulnerability 1: Information Disclosure via Error Messages
app.get('/api/product', (req, res) => {
    const productId = req.query.itemRef;
    
    // Check if productId is a number
    if (isNaN(productId)) {
        // VULNERABILITY: Verbose error with framework version
        return res.status(500).send(`
            <html>
            <head><title>Internal Server Error</title></head>
            <body>
                <h1>500 - Internal Server Error</h1>
                <pre>
Error: Invalid parameter type for 'itemRef'
    at ProductController.getProduct (ProductController.java:42)
    at javax.servlet.http.HttpServlet.service(HttpServlet.java:655)
    at org.apache.struts2.dispatcher.FilterDispatcher.doFilter(FilterDispatcher.java:434)
    
Framework: Apache Struts 2 2.3.31
Java Version: 1.8.0_191
Tomcat Version: 8.5.32

Stack Trace:
java.lang.IllegalArgumentException: Cannot convert value of type [java.lang.String] to required type [java.lang.Integer]
    at com.techmart.controller.ProductController.getProduct(ProductController.java:42)
    at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:248)
    
Powered by Apache Struts 2.3.31 - FLAG_LOCATION_1: Submit "2 2.3.31" as the framework version
                </pre>
            </body>
            </html>
        `);
    }
    
    const id = parseInt(productId);
    const product = products.find(p => p.id === id);
    
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
});

// Get all products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Vulnerability 2: Exposed Admin Panel (Access Control)
// The robots.txt will reveal this path
app.get('/sys-admin-portal-x7k9', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Only valid credentials
    if (username === 'root' && password === 'toor') {
        res.cookie('sessionToken', 'user_root_authenticated', { maxAge: 3600000 });
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
    res.json({ success: true });
});

// Vulnerability 3: Unrestricted File Upload with MIME type bypass
app.post('/api/upload-avatar', (req, res) => {
    const token = req.cookies.sessionToken;
    
    if (token !== 'user_root_authenticated') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!req.files || !req.files.avatar) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const file = req.files.avatar;
    
    // VULNERABILITY: Only checks MIME type from request, not actual file content
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({ 
            error: 'Invalid file type. Only image/jpeg, image/png, and image/gif are allowed.' 
        });
    }
    
    // Save file with original name (dangerous!)
    const fileName = file.name;
    const uploadPath = path.join(__dirname, 'uploads', fileName);
    
    file.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Upload failed' });
        }
        
        res.json({ 
            success: true, 
            message: 'Avatar uploaded successfully',
            filename: fileName,
            path: `/uploads/${fileName}`
        });
    });
});

// Serve uploaded files (including PHP files - VULNERABILITY)
app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    // Check if file is PHP and execute it (MAJOR VULNERABILITY for demonstration)
    if (filename.endsWith('.php')) {
        // For demonstration: read the secret file if PHP file exists
        const secretPath = path.join(__dirname, 'secret.txt');
        if (fs.existsSync(secretPath)) {
            const secret = fs.readFileSync(secretPath, 'utf8');
            return res.send(secret);
        } else {
            return res.send('FLAG_3_SECRET: CTF{upl04d_byp4ss_m1m3_typ3_pwn3d_x7k2}');
        }
    }
    
    res.sendFile(filePath);
});

// Create secret file
const secretContent = 'CTF{upl04d_byp4ss_m1m3_typ3_pwn3d_x7k2}';
fs.writeFileSync(path.join(__dirname, 'secret.txt'), secretContent);

app.listen(PORT, () => {
    console.log(`TechMart Vulnerable App running on http://localhost:${PORT}`);
    console.log(`\n=== BUG BOUNTY FLAGS ===`);
    console.log(`Flag 1: Navigate to product page with invalid itemRef parameter (string instead of number)`);
    console.log(`Flag 2: Check robots.txt for hidden admin panel`);
    console.log(`Flag 3: Upload PHP file with modified MIME type via avatar upload`);
});