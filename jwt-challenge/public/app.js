let currentUser = null;
let currentBounty = null;

// Page management
function showPage(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageName + 'Page').classList.add('active');
}

// Login
async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('errorMessage');
  
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      await loadDashboard();
    } else {
      errorEl.textContent = data.message || 'Invalid credentials';
      errorEl.classList.remove('hidden');
    }
  } catch (error) {
    errorEl.textContent = 'Login failed. Please try again.';
    errorEl.classList.remove('hidden');
  }
}

// Load dashboard
async function loadDashboard() {
  try {
    const response = await fetch('/my-account', {
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success) {
      currentUser = data.user;
      document.getElementById('headerUsername').textContent = data.user.fullName;
      document.getElementById('headerAvatar').textContent = data.user.fullName[0];
      document.getElementById('dropdownName').textContent = data.user.fullName;
      document.getElementById('dropdownEmail').textContent = data.user.email;
      
      if (data.user.role === 'administrator') {
        document.getElementById('adminNavSection').classList.remove('hidden');
      }
      
      showPage('dashboard');
      showDashboard();
    }
  } catch (error) {
    console.error('Failed to load dashboard');
  }
}

// Show dashboard content
function showDashboard() {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.nav-link')[0].classList.add('active');
  
  document.getElementById('mainContent').innerHTML = `
    <h1 class="page-title">Dashboard</h1>
    <p class="page-subtitle">Welcome back, ${currentUser.fullName}</p>
    
    <div class="card-grid">
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Messages</span>
          <div class="metric-icon" style="background: #dbeafe; color: #1e40af;">📧</div>
        </div>
        <div class="metric-value">24</div>
        <div class="metric-change">↑ 12% from last week</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Tasks</span>
          <div class="metric-icon" style="background: #d1fae5; color: #065f46;">✓</div>
        </div>
        <div class="metric-value">12</div>
        <div class="metric-change">↓ 8% from last week</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Projects</span>
          <div class="metric-icon" style="background: #fef3c7; color: #92400e;">📁</div>
        </div>
        <div class="metric-value">8</div>
        <div class="metric-change">→ No change</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Meetings</span>
          <div class="metric-icon" style="background: #e0e7ff; color: #4338ca;">📅</div>
        </div>
        <div class="metric-value">5</div>
        <div class="metric-change">↑ 25% from last week</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Recent Activity</h3>
      </div>
      <table class="data-table">
        <tbody>
          <tr>
            <td><strong>Document Updated</strong><br><span style="font-size: 13px; color: #64748b;">Annual Budget Report.xlsx</span></td>
            <td style="text-align: right; color: #64748b;">2 hours ago</td>
          </tr>
          <tr>
            <td><strong>Meeting Scheduled</strong><br><span style="font-size: 13px; color: #64748b;">Team Sync - Tomorrow 10:00 AM</span></td>
            <td style="text-align: right; color: #64748b;">5 hours ago</td>
          </tr>
          <tr>
            <td><strong>Task Completed</strong><br><span style="font-size: 13px; color: #64748b;">Code Review for PR #456</span></td>
            <td style="text-align: right; color: #64748b;">Yesterday</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// Load my account
async function loadMyAccount() {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.nav-link')[1].classList.add('active');
  
  document.getElementById('mainContent').innerHTML = `
    <h1 class="page-title">My Account</h1>
    <p class="page-subtitle">Manage your personal information and preferences</p>
    
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Profile Information</h3>
      </div>
      <div class="profile-grid">
        <div class="profile-field">
          <span class="profile-label">Full Name</span>
          <span class="profile-value">${currentUser.fullName}</span>
        </div>
        <div class="profile-field">
          <span class="profile-label">Username</span>
          <span class="profile-value">${currentUser.username}</span>
        </div>
        <div class="profile-field">
          <span class="profile-label">Email Address</span>
          <span class="profile-value">${currentUser.email}</span>
        </div>
        <div class="profile-field">
          <span class="profile-label">Phone Number</span>
          <span class="profile-value">${currentUser.phone}</span>
        </div>
        <div class="profile-field">
          <span class="profile-label">Department</span>
          <span class="profile-value">${currentUser.department}</span>
        </div>
        <div class="profile-field">
          <span class="profile-label">Employee ID</span>
          <span class="profile-value">${currentUser.employeeId}</span>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Security</h3>
      </div>
      <button class="btn-secondary">Change Password</button>
      <button class="btn-secondary" style="margin-left: 12px;">Enable 2FA</button>
    </div>
  `;
}

// Load documents
async function loadDocuments() {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.nav-link')[2].classList.add('active');
  
  try {
    const response = await fetch('/documents', {
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success) {
      document.getElementById('mainContent').innerHTML = `
        <h1 class="page-title">Documents</h1>
        <p class="page-subtitle">Access and manage your company documents</p>
        
        <div class="card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>Size</th>
                <th>Last Modified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.documents.map(doc => `
                <tr>
                  <td><strong>${doc.name}</strong></td>
                  <td>${doc.category}</td>
                  <td>${doc.size}</td>
                  <td>${doc.date}</td>
                  <td><button class="btn-secondary">Download</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  } catch (error) {
    console.error('Failed to load documents');
  }
}

// Load team
function loadTeam() {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.nav-link')[3].classList.add('active');
  
  document.getElementById('mainContent').innerHTML = `
    <h1 class="page-title">Team</h1>
    <p class="page-subtitle">View your team members and colleagues</p>
    
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Position</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Rebecca Smith</strong></td>
            <td>r.smith@innovatech.com</td>
            <td>Development</td>
            <td>Team Lead</td>
            <td><span class="badge-status">Active</span></td>
          </tr>
          <tr>
            <td><strong>Michael Chen</strong></td>
            <td>m.chen@innovatech.com</td>
            <td>Development</td>
            <td>Senior Engineer</td>
            <td><span class="badge-status">Active</span></td>
          </tr>
          <tr>
            <td><strong>Amanda Garcia</strong></td>
            <td>a.garcia@innovatech.com</td>
            <td>Design</td>
            <td>UI/UX Designer</td>
            <td><span class="badge-status">Active</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// Load admin panel
async function loadAdminPanel() {
  try {
    const response = await fetch('/admin', {
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      document.querySelector('#adminNavSection .nav-link').classList.add('active');
      
      document.getElementById('mainContent').innerHTML = `
        <div class="alert-success">
          Administrator access granted
        </div>
        
        <h1 class="page-title">Employee Management</h1>
        <p class="page-subtitle">Manage employee accounts and permissions</p>
        
        <div class="card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Position</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.employees.map(emp => `
                <tr>
                  <td><strong>${emp.name}</strong></td>
                  <td>${emp.email}</td>
                  <td>${emp.department}</td>
                  <td>${emp.position}</td>
                  <td>${emp.location}</td>
                  <td><span class="badge-status">${emp.status}</span></td>
                  <td>
                    ${emp.username === 'johnson' 
                      ? '<button class="btn-secondary" disabled style="opacity: 0.5; cursor: not-allowed;">Protected</button>'
                      : `<button class="btn-danger" onclick="deleteEmployee('${emp.username}', '${emp.name}')">Delete</button>`
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      alert('Access Denied: ' + data.message);
    }
  } catch (error) {
    alert('Failed to load admin panel');
  }
}

// Delete employee
async function deleteEmployee(username, name) {
  if (!confirm(`Are you sure you want to delete ${name}?\n\nThis action cannot be undone.`)) return;
  
  try {
    const response = await fetch(`/admin/delete?username=${username}`, {
      method: 'GET',
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (data.solved) {
        currentBounty = data.bounty;
        document.getElementById('bountyDisplay').textContent = data.bounty;
        document.getElementById('successModal').classList.remove('hidden');
      } else {
        alert('✓ ' + data.message);
      }
      loadAdminPanel();
    } else {
      alert('❌ Error: ' + data.message);
    }
  } catch (error) {
    alert('Failed to delete employee');
  }
}

// Copy bounty code to clipboard
function copyBounty() {
  const bountyText = document.getElementById('bountyDisplay').textContent;
  navigator.clipboard.writeText(bountyText).then(() => {
    const btn = document.querySelector('.btn-copy');
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.style.background = '#15803d';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '#16a34a';
    }, 2000);
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = bountyText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    const btn = document.querySelector('.btn-copy');
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.style.background = '#15803d';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '#16a34a';
    }, 2000);
  });
}

// Toggle user menu
function toggleUserMenu() {
  document.getElementById('userDropdown').classList.toggle('hidden');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.user-menu')) {
    document.getElementById('userDropdown').classList.add('hidden');
  }
});

// Logout
async function logout() {
  try {
    await fetch('/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {}
  
  window.location.href = '/';
}

// Close success modal
function closeSuccessModal() {
  document.getElementById('successModal').classList.add('hidden');
}
