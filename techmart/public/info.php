<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Information - TechMart</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background: #1e1e1e;
            color: #00ff00;
            padding: 2rem;
            line-height: 1.8;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: #2d2d2d;
            padding: 2rem;
            border-radius: 8px;
            border: 2px solid #00ff00;
        }
        h1 {
            color: #00ff00;
            border-bottom: 2px solid #00ff00;
            padding-bottom: 0.5rem;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #444;
        }
        .label {
            color: #888;
        }
        .value {
            color: #00ff00;
            font-weight: bold;
        }
        .warning {
            background: #442200;
            border-left: 4px solid #ff9800;
            padding: 1rem;
            margin-top: 1rem;
            color: #ffcc80;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚙️ TechMart Server Information</h1>
        
        <div class="info-row">
            <span class="label">Server Software:</span>
            <span class="value">Apache/2.4.52 (Ubuntu)</span>
        </div>
        
        <div class="info-row">
            <span class="label">PHP Version:</span>
            <span class="value">7.4.33</span>
        </div>
        
        <div class="info-row">
            <span class="label">PHP Extensions:</span>
            <span class="value">mysqli, gd, curl, fileinfo, mbstring</span>
        </div>
        
        <div class="info-row">
            <span class="label">Upload Support:</span>
            <span class="value">Enabled (Authenticated Users Only)</span>
        </div>
        
        <div class="info-row">
            <span class="label">Max Upload Size:</span>
            <span class="value">5MB</span>
        </div>
        
        <div class="info-row">
            <span class="label">Allowed Extensions:</span>
            <span class="value">.jpg, .jpeg, .png, .gif</span>
        </div>
        
        <div class="info-row">
            <span class="label">Server Status:</span>
            <span class="value">🟢 Online</span>
        </div>
        
        <div class="info-row">
            <span class="label">Database:</span>
            <span class="value">MySQL 8.0.31</span>
        </div>
        
        <div class="warning">
            ⚠️ <strong>Note:</strong> This server executes PHP scripts. Ensure uploaded files are properly validated.
            <br><br>
            🔒 <strong>Security:</strong> File upload validation is in place to prevent malicious uploads.
            <br><br>
            📝 <strong>For Developers:</strong> User profile data is available via <code>/api/user-profile</code> endpoint.
        </div>
        
        <div style="margin-top: 2rem; text-align: center; color: #666;">
            <p>Last Updated: October 2025</p>
            <p><a href="index.html" style="color: #00ff00;">← Back to Store</a></p>
        </div>
    </div>
</body>
</html>