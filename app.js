const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const START_TIME = new Date();

app.get('/', (req, res) => {
  const uptime = Math.floor((new Date() - START_TIME) / 1000);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jenkins CI/CD Lab Demonstration</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #0b0f19;
      --bg-card: rgba(18, 24, 38, 0.85);
      --border-color: rgba(255, 255, 255, 0.08);
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --accent-blue: #3b82f6;
      --accent-cyan: #06b6d4;
      --accent-green: #10b981;
      --accent-purple: #8b5cf6;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg-primary);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background-image: 
        radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.15) 0px, transparent 50%);
    }

    .container {
      max-width: 800px;
      width: 100%;
    }

    .badge-container {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--accent-green);
      padding: 0.4rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.025em;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background: var(--accent-green);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--accent-green);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .main-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      backdrop-filter: blur(16px);
      padding: 2.5rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      text-align: center;
    }

    h1 {
      font-size: 2.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, #ffffff 30%, #93c5fd 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.75rem;
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    .pipeline-visual {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin: 2rem 0;
      text-align: left;
    }

    @media (max-width: 640px) {
      .pipeline-visual {
        grid-template-columns: 1fr;
      }
    }

    .step-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.25rem;
      transition: transform 0.2s, border-color 0.2s;
    }

    .step-card:hover {
      transform: translateY(-2px);
      border-color: rgba(59, 130, 246, 0.4);
    }

    .step-num {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--accent-cyan);
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    }

    .step-title {
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }

    .step-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .system-info {
      background: rgba(0, 0, 0, 0.25);
      border-radius: 12px;
      border: 1px solid var(--border-color);
      padding: 1.25rem;
      margin-top: 1.5rem;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.825rem;
      text-align: left;
    }

    .info-label {
      color: var(--text-muted);
    }

    .info-val {
      color: #e5e7eb;
      font-weight: 600;
    }

    .actions {
      margin-top: 2rem;
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    .btn {
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
      color: white;
      padding: 0.65rem 1.4rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
      transition: opacity 0.2s;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .footer {
      margin-top: 2rem;
      color: var(--text-muted);
      font-size: 0.85rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge-container">
      <div class="badge">
        <span class="status-dot"></span>
        CI/CD Pipeline: Live & Deployed
      </div>
    </div>

    <div class="main-card">
      <h1>University Lab CI/CD Demo - Version 2</h1>
      <p class="subtitle">Automated Continuous Integration & Deployment powered by Jenkins</p>

      <div class="pipeline-visual">
        <div class="step-card">
          <span class="step-num">Stage 1</span>
          <div class="step-title">📥 Git Checkout</div>
          <p class="step-desc">Jenkins fetches the latest code commit automatically from GitHub.</p>
        </div>
        <div class="step-card">
          <span class="step-num">Stage 2</span>
          <div class="step-title">🔨 Docker Build</div>
          <p class="step-desc">Builds a clean, reproducible container image package.</p>
        </div>
        <div class="step-card">
          <span class="step-num">Stage 3</span>
          <div class="step-title">🚀 Container Deploy</div>
          <p class="step-desc">Stops previous container and runs the new version on port ${PORT}.</p>
        </div>
      </div>

      <div class="system-info">
        <div><span class="info-label">Host / Container:</span> <span class="info-val">${os.hostname()}</span></div>
        <div><span class="info-label">Platform:</span> <span class="info-val">${os.platform()} (${os.arch()})</span></div>
        <div><span class="info-label">Node Runtime:</span> <span class="info-val">${process.version}</span></div>
        <div><span class="info-label">Uptime:</span> <span class="info-val">${uptime}s</span></div>
      </div>

      <div class="actions">
        <a class="btn" href="/health" target="_blank">View JSON Health Check →</a>
      </div>
    </div>

    <div class="footer">
      Jenkins Freestyle Job Lab Showcase • Ready for Demonstration
    </div>
  </div>
</body>
</html>
  `;
  res.send(html);
});

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    message: 'CI/CD pipeline test successful',
    timestamp: new Date().toISOString(),
    service: 'simple-jenkins-cicd-demo',
    uptimeSeconds: Math.floor((new Date() - START_TIME) / 1000)
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
