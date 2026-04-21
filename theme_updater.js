const fs = require('fs');
const path = require('path');

function updateFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // First, update variable block in style.css if present
    if (file.includes('style.css')) {
        content = content.replace(/:root\s*\{[\s\S]*?\}/, `:root {
  --bg-color: #f8fafc;
  --text-color: #0f172a;
  --sidebar-bg: rgba(255, 255, 255, 0.4);
  --sidebar-text: #1e293b;
  --card-bg: rgba(255, 255, 255, 0.6);
  --border-color: rgba(255, 255, 255, 0.5);
  --btn-primary: #6366f1;
  --btn-hover: #4f46e5;
  --accent: #8b5cf6;
  --secondary: #0ea5e9;
  --muted: #64748b;
  --hero-gradient: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
  --shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}

[data-theme="dark"], .dark-mode {
  --bg-color: #020617;
  --text-color: #f8fafc;
  --sidebar-bg: rgba(15, 23, 42, 0.5);
  --sidebar-text: #f8fafc;
  --card-bg: rgba(30, 41, 59, 0.5);
  --border-color: rgba(255, 255, 255, 0.1);
  --btn-primary: #818cf8;
  --btn-hover: #6366f1;
  --accent: #c084fc;
  --secondary: #38bdf8;
  --muted: #94a3b8;
  --hero-gradient: linear-gradient(135deg, #1e1b4b, #4c1d95, #831843);
  --shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}`);

        // Add backdrops to make it glassmorphic
        content = content.replace(/(\.card\s*\{[\s\S]*?)(border:\s*[^;]+;)/, '$1$2\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  box-shadow: var(--shadow-glass);');
        content = content.replace(/(\.sidebar\s*\{[\s\S]*?)(box-shadow:\s*[^;]+;)/, '$1$2\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  border-right: 1px solid var(--border-color);');
        content = content.replace(/(\.topbar\s*\{[\s\S]*?)(box-shadow:\s*[^;]+;)/, '$1$2\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  background: var(--card-bg);\n  border: 1px solid var(--border-color);');
        content = content.replace(/body\s*\{[\s\S]*?background:\s*var\(--bg-color\);/, 'body {\n  background: var(--bg-color);\n  background-image: radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);\n  background-attachment: fixed;'); 
    }

    // Comprehensive Hardcoded Color Replacements
    // Gradients
    content = content.replace(/linear-gradient\([^)]+#2C1A0E[^)]+#5C3D2E[^)]*\)/g, 'var(--hero-gradient)');
    content = content.replace(/linear-gradient\([^)]+#0F0804[^)]+#2C1A0E[^)]*\)/g, 'var(--hero-gradient)');
    content = content.replace(/linear-gradient\([^)]+#5C3D2E[^)]+#C85A3C[^)]*\)/g, 'var(--hero-gradient)');
    content = content.replace(/linear-gradient\([^)]+#C85A3C[^)]+#E06B4A[^)]*\)/g, 'linear-gradient(135deg, var(--btn-primary), var(--accent))');
    content = content.replace(/linear-gradient\([^)]+#8B6347[^)]+#A37F63[^)]*\)/g, 'linear-gradient(135deg, var(--secondary), #0369a1)');
    content = content.replace(/linear-gradient\([^)]+#A34430[^)]+#C85A3C[^)]*\)/g, 'linear-gradient(135deg, var(--btn-hover), var(--btn-primary))');
    content = content.replace(/linear-gradient\([^)]+#FDF9F4[^)]+#FDF0E4[^)]*\)/g, 'var(--card-bg)');

    // Hex codes mapping to variables
    const colorMap = {
        '#C85A3C': 'var(--btn-primary)',
        '#A34430': 'var(--btn-hover)',
        '#E06B4A': 'var(--accent)',
        '#2C1A0E': 'var(--text-color)',
        '#5C3D2E': 'var(--sidebar-bg)', 
        'rgba\\(200, 90, 60, 0.25\\)': 'var(--btn-primary)',
        '#8B6347': 'var(--secondary)',
        '#1A120A': 'var(--bg-color)',
        '#0F0804': 'var(--bg-color)',
        '#261810': 'var(--card-bg)',
        '#3A2518': 'var(--bg-color)',
        '#FAF6F0': 'var(--bg-color)',
        '#FDF9F4': 'var(--card-bg)',
        '#F5ECD7': 'var(--sidebar-text)',
        '#FDEBD0': 'var(--text-color)',
        '#FDF0E4': 'var(--bg-color)',
        '#DDBF99': 'var(--border-color)',
        '#EEDFC8': 'var(--border-color)',
        '#C4A882': 'var(--muted)'
    };

    for (const [hex, cssVar] of Object.entries(colorMap)) {
        const regex = new RegExp(hex, 'gi');
        content = content.replace(regex, cssVar);
    }

    fs.writeFileSync(file, content, 'utf8');
}

updateFile(path.join(__dirname, 'css', 'style.css'));
updateFile(path.join(__dirname, 'css', 'profile.css'));
updateFile(path.join(__dirname, 'css', 'chatbot.css'));

console.log('Theme updated successfully.');
