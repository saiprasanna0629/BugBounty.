const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const SECRET_KEY = 'innovatech_secret_2024';

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

// Fixed bounty code for the challenge
const BOUNTY_CODE = 'Bounty: 7A3F9B2E8C1D4F6A5E7B9C0D2F4A6E8B';

// User database
const users = {
  johnson: { 
    password: 'password123', 
    role: 'user', 
    fullName: 'John Johnson', 
    email: 'j.johnson@innovatech.com', 
    department: 'Development', 
    employeeId: 'EMP-4521', 
    phone: '+1 (555) 2847' 
  },
  administrator: { 
    password: 'admin2024', 
    role: 'administrator', 
    fullName: 'System Administrator', 
    email: 'sysadmin@innovatech.com', 
    department: 'IT Operations', 
    employeeId: 'EMP-0001', 
    phone: '+1 (555) 1000' 
  }
};

let employees = [
  { 
    id: 1, 
    username: 'johnson', 
    name: 'John Johnson', 
    email: 'j.johnson@innovatech.com', 
    department: 'Development', 
    position: 'Software Engineer', 
    status: 'Active', 
    joinDate: '2022-06-10', 
    location: 'Seattle' 
  },
  { 
    id: 2, 
    username: 'anderson', 
    name: 'Sarah Anderson', 
    email: 's.anderson@innovatech.com', 
    department: 'Operations', 
    position: 'Operations Manager', 
    status: 'Active', 
    joinDate: '2021-03-18', 
    location: 'Austin' 
  },
  { 
    id: 3, 
    username: 'williams', 
    name: 'David Williams', 
    email: 'd.williams@innovatech.com', 
    department: 'Finance', 
    position: 'Financial Analyst', 
    status: 'Active', 
    joinDate: '2023-02-05', 
    location: 'Denver' 
  },
  { 
    id: 4, 
    username: 'taylor', 
    name: 'Emma Taylor', 
    email: 'e.taylor@innovatech.com', 
    department: 'Human Resources', 
    position: 'HR Coordinator', 
    status: 'Active', 
    joinDate: '2022-09-20', 
    location: 'Portland' 
  }
];

// VULNERABLE: JWT verification without signature check
const verifyJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // VULNERABILITY: Only decoding payload, not verifying signature
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch (e) {
    return null;
  }
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (users[username] && users[username].password === password) {
    const user = users[username];
    
    const payload = {
      sub: username,
      company: 'InnovaTech',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    
    const token = jwt.sign(payload, SECRET_KEY);
    
    res.cookie('session', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000
    });
    
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/my-account', (req, res) => {
  const token = req.cookies.session;
  if (!token) return res.status(401).json({ success: false });
  
  const payload = verifyJWT(token);
  if (!payload) return res.status(401).json({ success: false });
  
  const user = users[payload.sub];
  if (!user) return res.status(401).json({ success: false });
  
  res.json({
    success: true,
    user: {
      username: payload.sub,
      fullName: user.fullName,
      email: user.email,
      department: user.department,
      employeeId: user.employeeId,
      phone: user.phone,
      role: user.role
    }
  });
});

app.get('/admin', (req, res) => {
  const token = req.cookies.session;
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  
  const payload = verifyJWT(token);
  if (!payload) return res.status(401).json({ success: false });
  
  const user = users[payload.sub];
  if (!user || user.role !== 'administrator') {
    return res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
  
  res.json({ success: true, employees });
});

app.get('/admin/delete', (req, res) => {
  const token = req.cookies.session;
  const username = req.query.username;
  
  if (!token) return res.status(401).json({ success: false });
  
  const payload = verifyJWT(token);
  if (!payload) return res.status(401).json({ success: false });
  
  const user = users[payload.sub];
  if (!user || user.role !== 'administrator') {
    return res.status(403).json({ success: false, message: 'Admin privileges required' });
  }
  
  const index = employees.findIndex(e => e.username === username);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  
  const deletedEmployee = employees[index];
  employees.splice(index, 1);
  
  if (username === 'anderson') {
    res.json({ 
      success: true, 
      message: `Employee ${deletedEmployee.name} has been removed`,
      solved: true,
      bounty: BOUNTY_CODE
    });
  } else {
    res.json({ 
      success: true, 
      message: `Employee ${deletedEmployee.name} has been removed`,
      solved: false
    });
  }
});

app.get('/documents', (req, res) => {
  const token = req.cookies.session;
  if (!token) return res.status(401).json({ success: false });
  
  const payload = verifyJWT(token);
  if (!payload) return res.status(401).json({ success: false });
  
  const docs = [
    { id: 1, name: 'Company Policy 2024.pdf', size: '3.1 MB', date: '2024-01-20', category: 'HR' },
    { id: 2, name: 'Annual Budget Report.xlsx', size: '1.2 MB', date: '2024-10-05', category: 'Finance' },
    { id: 3, name: 'IT Security Guidelines.pdf', size: '2.8 MB', date: '2024-09-15', category: 'IT' },
    { id: 4, name: 'Employee Benefits Guide.pdf', size: '4.5 MB', date: '2024-03-08', category: 'HR' }
  ];
  
  res.json({ success: true, documents: docs });
});

app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 InnovaTech Portal running on http://localhost:${PORT}`);
  console.log(`📝 Test credentials: johnson:password123`);
  console.log(`🎯 Target user: anderson`);
  console.log(`💰 Fixed Bounty Code: ${BOUNTY_CODE}\n`);
});
