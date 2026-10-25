# 🚀 Simple Jenkins CI/CD Pipeline Lab Project

A lightweight, zero-test Node.js & Express web application designed specifically for **University Lab Demonstrations** of a Jenkins CI/CD pipeline.

---

## 📋 Architecture Overview

```
[ Developer ] 
      │ git push
      ▼
 [ GitHub ]
      │ webhook / poll
      ▼
 [ Jenkins ]  ─── (CI: Git Checkout & Docker Build)
      │
      ▼
  [ Docker ]  ─── (CD: Stop old container & Run new container)
      │
      ▼
[ Live App ]  ─── http://localhost:3000
```

- **Application:** Node.js + Express (renders a modern status dashboard and `/health` JSON endpoint).
- **CI (Continuous Integration):** Jenkins pulls code and builds the Docker image.
- **CD (Continuous Deployment):** Jenkins stops any older container and launches the updated container on port 3000.
- **Job Type:** Jenkins **Freestyle Project** (with an optional `Jenkinsfile` included for pipeline demonstrations).

---

## 📁 Repository Structure

```
.
├── app.js             # Express application & dashboard UI
├── package.json       # App configuration & dependencies
├── Dockerfile         # Container definition (Node 20 Alpine)
├── deploy.sh          # Deployment script used by Jenkins
├── Jenkinsfile        # Declarative pipeline (optional alternative)
├── .dockerignore      # Files excluded from Docker builds
├── .gitignore         # Files excluded from Git tracking
└── README.md          # Step-by-step setup guide & viva notes
```

---

## 🛠️ Step 1: Push this Project to GitHub

Jenkins needs a Git repository to pull code from.

1. Create a new repository on [GitHub](https://github.com) (e.g., `jenkins-cicd-demo`).
2. Run the following commands in this directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Jenkins CI/CD lab"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git push -u origin main
   ```

---

## ⚙️ Step 2: Configure Jenkins Freestyle Project

1. Open Jenkins in your browser (usually `http://localhost:8080`).
2. Click **"New Item"** from the left sidebar:
   - **Enter an item name:** `node-cicd-lab`
   - **Select:** `Freestyle project`
   - Click **OK**.

### A. General & Source Code Management (SCM)
1. Under **Source Code Management**, select **Git**.
2. **Repository URL:** Paste your GitHub repository URL (e.g., `https://github.com/<username>/<repo>.git`).
3. **Credentials:** Leave as `none` if the repo is public. If private, add your GitHub Personal Access Token (PAT).
4. **Branches to build:** Set `*/main` (or `*/master` depending on your default branch).

### B. Build Triggers (Optional for auto-trigger)
- **Manual Trigger:** Leave unselected (you will click **"Build Now"** manually).
- **Automated Poll SCM:** Check **Poll SCM** and enter `* * * * *` (checks GitHub every minute for new commits).
- **GitHub hook trigger:** Check **GitHub hook trigger for GITScm polling** (if using GitHub webhooks).

### C. Build Steps
1. Scroll down to the **Build Steps** section.
2. Click **Add build step** ➔ select **Execute shell**.
3. Paste the following commands into the **Command** text area:

```bash
#!/bin/bash
# Make deploy script executable and run it
chmod +x deploy.sh
./deploy.sh
```

*(Alternatively, you can paste the contents of `deploy.sh` directly into the Execute shell box).*

4. Click **Save**.

---

## 🧪 Step 3: Run & Demonstrate the Pipeline

1. In your project dashboard on Jenkins, click **"Build Now"**.
2. Under **Build History** on the left, click the latest build number (e.g., `#1`).
3. Click **Console Output** to watch the real-time execution logs.
4. You should see:
   - Git checkout succeeding
   - Docker building the image `node-cicd-app:latest`
   - Docker starting the container on port `3000`
   - `Finished: SUCCESS`
5. Open your browser and navigate to:
   - **Dashboard:** [http://localhost:3000](http://localhost:3000)
   - **Health Check:** [http://localhost:3000/health](http://localhost:3000/health)

---

## 🔄 Step 4: Demonstrate Continuous Deployment (CD)

To impress your lab instructor:
1. Open [app.js](file:///home/yash/college/ci-cd/app.js).
2. Change the title or text (e.g., change `University Lab CI/CD Demo` to `University Lab CI/CD Demo - Version 2`).
3. Commit and push:
   ```bash
   git add app.js
   git commit -m "Update app version to v2"
   git push origin main
   ```
4. Click **"Build Now"** in Jenkins (or wait for the Poll SCM trigger).
5. Refresh [http://localhost:3000](http://localhost:3000) — the new version is live instantly with zero manual server restart!

---

## ⚠️ Common Troubleshooting

### 1. `docker: command not found` or `permission denied while trying to connect to Docker daemon`
Jenkins runs as user `jenkins`. By default, it might not have rights to run Docker commands:
```bash
# Add jenkins user to the docker group
sudo usermod -aG docker jenkins

# Restart Jenkins service
sudo systemctl restart jenkins
```

### 2. Testing Locally Without Jenkins
You can test the application and deployment script directly on your terminal:
```bash
# Direct run with Node:
npm install
npm start

# Or test Docker build manually:
chmod +x deploy.sh
./deploy.sh
```

---

## 🎓 University Lab Viva / Oral Exam Quick Reference

| Question | Answer |
| :--- | :--- |
| **What is CI (Continuous Integration)?** | The practice of automatically building and validating code every time a team member pushes changes to version control. |
| **What is CD (Continuous Deployment)?** | Automatically deploying every valid build directly into the production/target environment without manual intervention. |
| **Why use Docker in CI/CD?** | Docker packages the application with all its dependencies into an isolated container, ensuring the app runs identically in development, Jenkins, and production. |
| **Freestyle vs. Pipeline in Jenkins?** | **Freestyle:** Configured via Jenkins GUI form fields (great for simple jobs).<br>**Pipeline:** Defined as code (`Jenkinsfile`) versioned alongside application code (industry standard). |
