const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const app = express();
const PORT = 3001;

// Flags for CTF
const FLAGS = {
  commandInjection: 'flag{0sC0mm4nd_1nj3ct10n_m4st3r}',
  pathTraversal: 'flag{p4th_tr4v3rs4l_n1nj4_2024}',
  xss: 'flag{w3bs0ck3t_xss_ch4mp10n}'
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Mock product data
const products = [
  { id: 1, name: 'Wireless Headphones', price: 79.99, stock: 15 },
  { id: 2, name: 'Smart Watch', price: 199.99, stock: 8 },
  { id: 3, name: 'Laptop Backpack', price: 49.99, stock: 23 },
  { id: 4, name: 'USB-C Hub', price: 34.99, stock: 42 },
  { id: 5, name: 'Mechanical Keyboard', price: 129.99, stock: 12 },
  { id: 6, name: 'Wireless Mouse', price: 39.99, stock: 31 },
];

const stores = [
  { id: 1, name: 'Downtown Store' },
  { id: 2, name: 'Westside Branch' },
  { id: 3, name: 'Airport Location' },
];

// Chat bot responses (15 responses that loop)
const chatResponses = [
  "Hello! How can I help you today?",
  "That's an interesting question. Let me check on that for you.",
  "I understand your concern. Our team is here to assist.",
  "Thanks for reaching out! I'll need a moment to look into this.",
  "Great question! Let me pull up that information.",
  "I appreciate your patience. Just a moment please.",
  "I see what you're asking about. Let me find the details.",
  "That's a popular inquiry! Let me get you the right information.",
  "Excellent! I'm happy to help with that.",
  "I understand. Let me check our current inventory status.",
  "Thanks for being a valued customer! How else can I assist?",
  "I'll look into that right away for you.",
  "Good point! Let me verify that information.",
  "I appreciate you contacting support. Let me help with that.",
  "Perfect! Is there anything else I can help you with today?"
];

let chatMessageCounter = 0;

// SANDBOXED COMMAND RESPONSES - Safe outputs for allowed commands
const SANDBOXED_COMMANDS = {
  'whoami': FLAGS.commandInjection,
  'id': `uid=1000(vulnshop) gid=1000(vulnshop) groups=1000(vulnshop)`,
  'pwd': '/var/www/vulnshop',
  'hostname': 'vulnshop-server',
  'uname': 'Linux vulnshop-server 5.15.0-1 #1 SMP x86_64 GNU/Linux',
  'uname -a': 'Linux vulnshop-server 5.15.0-1 #1 SMP Tue Jan 10 12:00:00 UTC 2024 x86_64 GNU/Linux',
  'date': new Date().toString(),
  'echo': (args) => args || 'Stock checking system initialized',
  'ls': 'index.html\napp.js\nstyles.css\nproducts.json\nconfig.json',
  'ls -la': `total 48
drwxr-xr-x 2 vulnshop vulnshop 4096 Jan 10 12:00 .
drwxr-xr-x 5 vulnshop vulnshop 4096 Jan 10 12:00 ..
-rw-r--r-- 1 vulnshop vulnshop 1234 Jan 10 12:00 index.html
-rw-r--r-- 1 vulnshop vulnshop 5678 Jan 10 12:00 app.js
-rw-r--r-- 1 vulnshop vulnshop 2345 Jan 10 12:00 styles.css`,
  'cat /etc/os-release': `NAME="Ubuntu"
VERSION="22.04 LTS (Jammy Jellyfish)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 22.04 LTS"`,
  'ps': `PID TTY          TIME CMD
1234 pts/0    00:00:00 node
5678 pts/0    00:00:00 ps`
};

// Helper function to parse and execute sandboxed commands
function executeSandboxedCommand(storeId) {
  console.log(`[SANDBOXED] Parsing storeId: ${storeId}`);
  
  // Check for command injection attempts with |, ;, &, &&, ||
  const commandSeparators = /[|;&]/;
  
  if (!commandSeparators.test(storeId)) {
    // Normal store ID - return stock info
    const store = stores.find(s => s.id === parseInt(storeId));
    return `Stock check completed.\nStore: ${store?.name || 'Unknown'}\nAvailable: 15 units`;
  }
  
  // Command injection detected! Parse the injected command
  // Split by command separators
  const parts = storeId.split(/([|;&]+)/);
  
  // Find the actual command (after the separator)
  let injectedCommand = '';
  for (let i = 0; i < parts.length; i++) {
    if (/[|;&]/.test(parts[i]) && i + 1 < parts.length) {
      injectedCommand = parts[i + 1].trim();
      break;
    }
  }
  
  if (!injectedCommand) {
    return 'Stock check failed. Invalid store ID.';
  }
  
  console.log(`[COMMAND INJECTION] Detected command: ${injectedCommand}`);
  
  // Check if it's a whitelisted command
  const cmd = injectedCommand.toLowerCase().trim();
  
  // Special handling for echo commands
  if (cmd.startsWith('echo ')) {
    const echoText = injectedCommand.substring(5).replace(/['"]/g, '');
    return `Stock check for store.\n${echoText}`;
  }
  
  // Check against sandboxed commands
  if (SANDBOXED_COMMANDS[cmd]) {
    const output = typeof SANDBOXED_COMMANDS[cmd] === 'function' 
      ? SANDBOXED_COMMANDS[cmd]() 
      : SANDBOXED_COMMANDS[cmd];
    
    return `Stock check for store.\n${output}`;
  }
  
  // Command not in whitelist - realistic error
  const errorMessages = [
    `bash: ${injectedCommand}: command not found`,
    `sh: 1: ${injectedCommand}: not found`,
    `'${injectedCommand}' is not recognized as an internal or external command`,
  ];
  
  return errorMessages[Math.floor(Math.random() * errorMessages.length)];
}

// VULNERABILITY 1: OS Command Injection (SANDBOXED)
app.post('/api/stock/check-win', (req, res) => {
  const { productId, storeId } = req.body;
  
  console.log(`[STOCK CHECK] Product: ${productId}, Store: ${storeId}`);
  
  // Execute sandboxed command - SAFE, no real system commands
  const output = executeSandboxedCommand(storeId);
  
  res.json({
    success: true,
    message: output
  });
});

// Linux/Unix endpoint
app.post('/api/stock/check', (req, res) => {
  const { productId, storeId } = req.body;
  
  console.log(`[STOCK CHECK UNIX] Product: ${productId}, Store: ${storeId}`);
  
  const output = executeSandboxedCommand(storeId);
  
  res.json({
    success: true,
    message: output
  });
});

// VULNERABILITY 2: Path Traversal
app.get('/api/product-image', (req, res) => {
  const filename = req.query.filename;
  
  console.log(`[IMAGE REQUEST] Filename: ${filename}`);
  
  if (!filename) {
    res.status(400).send('Filename parameter required');
    return;
  }
  
  const normalizedPath = filename.toLowerCase().replace(/\\/g, '/');
  
  if (normalizedPath.includes('etc/passwd') || normalizedPath === '/etc/passwd') {
    console.log('[PATH TRAVERSAL DETECTED] Serving /etc/passwd content');
    
    const mockPasswd = `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
flag:x:1001:1001:${FLAGS.pathTraversal}:/home/flag:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin`;
    
    res.type('text/plain');
    res.send(mockPasswd);
    return;
  }
  
  const validImagePattern = /^product-[1-6]\.(jpg|png|jpeg)$/i;
  
  if (validImagePattern.test(filename)) {
    const imagePath = path.join(__dirname, 'public', 'images', filename);
    
    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      const productId = filename.match(/product-(\d)/)[1];
      const svgPlaceholder = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#667eea"/>
        <text x="50%" y="50%" font-size="120" text-anchor="middle" dy=".3em" fill="white">P${productId}</text>
      </svg>`;
      
      res.type('image/svg+xml');
      res.send(svgPlaceholder);
    }
    return;
  }
  
  console.log('[ERROR] Invalid filename requested');
  res.status(404).send('Image not found');
});

// Standard endpoints
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/stores', (req, res) => {
  res.json(stores);
});

// Contact form endpoint
app.post('/api/contact', (req, res) => {
  const { email, message } = req.body;
  
  console.log(`[CONTACT FORM] Email: ${email}`);
  console.log(`[CONTACT FORM] Message: ${message?.substring(0, 50)}...`);
  
  // Simulate processing delay
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Message sent successfully!'
    });
  }, 500);
});

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`\n=================================`);
  console.log(`🚀 VulnShop Server Running`);
  console.log(`=================================`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📍 WebSocket: ws://localhost:${PORT + 1}`);
  console.log(`\n🎯 CTF Flags:`);
  console.log(`   Q1 (Command Injection): ${FLAGS.commandInjection}`);
  console.log(`   Q2 (Path Traversal): ${FLAGS.pathTraversal}`);
  console.log(`   Q3 (XSS): ${FLAGS.xss}`);
  console.log(`\n💡 Vulnerability 1 (Command Injection):`);
  console.log(`   - SANDBOXED: Only safe commands execute`);
  console.log(`   - Supports: | ; & separators`);
  console.log(`   - Allowed: whoami, id, pwd, ls, date, etc.`);
  console.log(`   - Real system is protected`);
  console.log(`\n💡 Vulnerability 2 (Path Traversal):`);
  console.log(`   - Access /etc/passwd via image parameter`);
  console.log(`\n💡 Vulnerability 3 (XSS):`);
  console.log(`   - Frontend encodes HTML entities`);
  console.log(`   - Must use Burp Suite to inject raw payload`);
  console.log(`   - Only alert() payloads trigger flag`);
  console.log(`=================================\n`);
});

// VULNERABILITY 3: WebSocket XSS
const wss = new WebSocket.Server({ port: PORT + 1 });

console.log(`💬 WebSocket server started on port ${PORT + 1}`);

function containsXSSPayload(message) {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /onclick=/i,
    /onmouseover=/i,
    /<img[^>]+on\w+=/i,
    /<svg[^>]+on\w+=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  
  return xssPatterns.some(pattern => pattern.test(message));
}

function isAlertPayload(message) {
  return /alert\s*\(/i.test(message);
}

wss.on('connection', (ws) => {
  console.log('[WEBSOCKET] New client connected');
  
  ws.send(JSON.stringify({
    type: 'system',
    content: 'Connected to VulnShop Support. An agent will respond shortly.',
    timestamp: new Date().toISOString()
  }));
  
  ws.on('message', (message) => {
    const msgString = message.toString();
    console.log(`[WEBSOCKET MESSAGE] ${msgString}`);
    
    if (containsXSSPayload(msgString)) {
      console.log('[XSS DETECTED] Raw XSS payload received!');
      
      if (isAlertPayload(msgString)) {
        console.log('[ALERT DETECTED] Sending flag...');
        
        setTimeout(() => {
          ws.send(JSON.stringify({
            type: 'admin',
            content: `<img src=x onerror="alert('${FLAGS.xss}')">`,
            timestamp: new Date().toISOString()
          }));
        }, 800);
      } else {
        console.log('[XSS BLOCKED] Non-alert payload blocked');
        const responseIndex = chatMessageCounter % chatResponses.length;
        chatMessageCounter++;
        
        setTimeout(() => {
          ws.send(JSON.stringify({
            type: 'admin',
            content: chatResponses[responseIndex],
            timestamp: new Date().toISOString()
          }));
        }, 800);
      }
    } else {
      const responseIndex = chatMessageCounter % chatResponses.length;
      chatMessageCounter++;
      
      setTimeout(() => {
        ws.send(JSON.stringify({
          type: 'admin',
          content: chatResponses[responseIndex],
          timestamp: new Date().toISOString()
        }));
      }, 800);
    }
  });
  
  ws.on('close', () => {
    console.log('[WEBSOCKET] Client disconnected');
  });
  
  ws.on('error', (error) => {
    console.error('[WEBSOCKET ERROR]', error);
  });
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});