# 🚀 CCA 2: CI/CD Pipeline Implementation & Deployment Guide
**Course:** TYCSE · Cloud Computing and DevOps (CCD)  
**Total Marks:** 10 Marks  
**Target Project:** `node-cicd-app` (Node.js & Express)  
**Repository:** `https://github.com/maanyarao/node-cicd-app`

---

## 📑 Table of Contents
1. [Assignment Objectives & Rubric Mapping](#1-assignment-objectives--rubric-mapping)
2. [End-to-End Architecture Overview](#2-end-to-end-architecture-overview)
3. [Prerequisites & Repository Structure](#3-prerequisites--repository-structure)
4. [Phase 1: AWS EC2 Server Provisioning](#4-phase-1-aws-ec2-server-provisioning)
5. [Phase 2: Automated Server Setup (Docker, Jenkins, Minikube, kubectl)](#5-phase-2-automated-server-setup)
6. [Phase 3: Jenkins Initial Configuration & Credentials Setup](#6-phase-3-jenkins-initial-configuration--credentials-setup)
7. [Phase 4: Setting Up the Jenkins Pipeline Job](#7-phase-4-setting-up-the-jenkins-pipeline-job)
8. [Phase 5: First Pipeline Execution & Verification (Run 1)](#8-phase-5-first-pipeline-execution--verification-run-1)
9. [Phase 6: Source Code Change Demonstration (Run 2)](#9-phase-6-source-code-change-demonstration-run-2)
10. [Submission & Screenshot Checklist (For 10/10 Marks)](#10-submission--screenshot-checklist-for-1010-marks)
11. [Troubleshooting Common Issues](#11-troubleshooting-common-issues)
12. [Comprehensive Viva Voce / Oral Exam Preparation](#12-comprehensive-viva-voce--oral-exam-preparation)

---

## 1. Assignment Objectives & Rubric Mapping

According to the official **CCA 2 Student Guide**, your automated CI/CD pipeline must automatically perform:
1. **Pull the latest code** from GitHub (`checkout scm`).
2. **Build the application and run available tests** (`node --check app.js`).
3. **Create a Docker image** (`docker build`).
4. **Push the image** to Docker Hub (`docker push`).
5. **Deploy the application on Minikube** using Kubernetes manifests (`kubectl apply`).
6. **Verify that the application is running** (`kubectl rollout status`, `kubectl get pods,svc`).
7. **Demonstrate a code change:** Push an update to GitHub, trigger the pipeline again, and show the updated version deployed.

### Evaluation Rubric Breakdown (10 Marks)

| Criterion | Marks | What Evaluators Expect |
| :--- | :---: | :--- |
| **Project & GitHub Readiness** | **1.0** | Clean, well-organized GitHub repository that builds without manual fixes. |
| **AWS & Jenkins Configuration** | **1.5** | Jenkins running on AWS EC2, accessible via browser, plugins & credentials configured. |
| **Dockerfile & Image Build** | **1.5** | Working Dockerfile building a lightweight, production-ready container image. |
| **Jenkinsfile Automated Pipeline** | **2.0** | Declarative pipeline with clear, distinct stages that run automatically without manual intervention. |
| **Container Registry Integration** | **1.0** | Image published to Docker Hub with meaningful tags (`:${BUILD_NUMBER}` & `:latest`) using secure credentials. |
| **Kubernetes on Minikube** | **1.5** | Valid Deployment & Service YAMLs; pods running on Minikube pulling the pushed image. |
| **Verification, Demo & Viva** | **1.5** | Live demo of app running, code-change redeployment demonstrated, clear answers to viva questions. |
| **Total** | **10.0** | |

---

## 2. End-to-End Architecture Overview

```
                                      AWS EC2 INSTANCE (Ubuntu)
                                 ┌────────────────────────────────────────────────────────┐
                                 │                                                        │
[Developer]                      │   [Jenkins Server] (Port 8080)                         │
     │                           │         │                                              │
     │ 1. git push               │         │ 2. Automated SCM Poll / Webhook              │
     ▼                           │         ▼                                              │
[GitHub Repo] ───────────────────┼──► [Jenkinsfile Pipeline]                              │
                                 │         │                                              │
                                 │         ├─ Stage 1: Jenkins Checkout                   │
                                 │         ├─ Stage 2: Build & Test (Syntax check)        │
                                 │         ├─ Stage 3: Docker Build                       │
                                 │         │                                              │
[Docker Hub] ◄───────────────────┼─────────┴─ Stage 4: Push Image                         │
(maanyarao/node-cicd-app)        │                                                        │
     │                           │         ┌─ Stage 5: Minikube Deployment                │
     │ 5. Pull Image             │         │                                              │
     └───────────────────────────┼─────────► [Minikube Local K8s Cluster]                 │
                                 │                 │                                      │
                                 │                 ├─ Deployment (node-cicd-app pod)      │
                                 │                 └─ Service (NodePort: 30080)           │
                                 │                                                        │
                                 │   [Verification & Live App] (Port 30080)               │
                                 └───────────────────────────▲────────────────────────────┘
                                                             │
                                                   6. View Live in Browser
                                                             │
                                                        [Evaluator]
```

---

## 3. Prerequisites & Repository Structure

Make sure your repository has the required layout:

```
ci-cd/
├── app.js                   # Node.js Express web application & status UI
├── package.json             # App dependencies & npm scripts
├── package-lock.json        # Dependency lockfile
├── Dockerfile               # Multi-stage/alpine container recipe
├── Jenkinsfile              # Declarative CI/CD pipeline definition
├── deploy.sh                # Local backup deployment script
├── .dockerignore            # Excludes node_modules and .git from image
├── .gitignore               # Excludes node_modules from git
└── k8s/
    ├── deployment.yaml      # Kubernetes Deployment manifest
    └── service.yaml         # Kubernetes NodePort Service manifest
```

---

## 4. Phase 1: AWS EC2 Server Provisioning

### Step 1.1: Launch EC2 Instance
1. Log in to the [AWS Management Console](https://console.aws.amazon.com/ec2/).
2. Click **Launch Instance**.
3. Configure the following:
   - **Name:** `jenkins-minikube-cicd-server`
   - **AMI:** `Ubuntu Server 22.04 LTS (HVM), SSD Volume Type` (64-bit x86)
   - **Instance Type:** `t2.medium` or `t3.medium`  
     > ⚠️ **Important:** Do NOT use `t2.micro` (1 vCPU, 1 GB RAM). Minikube requires at least **2 vCPUs and 2 GB RAM** plus memory for Jenkins and Docker. A `t2.medium` (2 vCPU, 4 GB RAM) is required for smooth operation.
   - **Key Pair:** Select an existing key pair or create a new one (e.g., `cicd-key.pem`) and download it.
   - **Storage:** Increase Root volume to **30 GiB** (gp3) to comfortably accommodate Docker images and Minikube.

### Step 1.2: Configure Security Group Inbound Rules
Under **Network settings** -> **Security group rules**, ensure these ports are open:

| Type | Port Range | Source | Purpose |
| :--- | :--- | :--- | :--- |
| **SSH** | `22` | My IP (or `0.0.0.0/0`) | Remote terminal access |
| **Custom TCP** | `8080` | `0.0.0.0/0` | Jenkins Web Dashboard |
| **Custom TCP** | `30080` | `0.0.0.0/0` | NodePort for Kubernetes App |
| **Custom TCP** | `3000` | `0.0.0.0/0` | Direct Container testing |

Click **Launch Instance**.

### Step 1.3: SSH into Your Instance
From your local terminal:
```bash
chmod 400 cicd-key.pem
ssh -i "cicd-key.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```

---

## 5. Phase 2: Automated Server Setup

Once connected to your Ubuntu EC2 instance, execute the following commands to install and configure all components.

### Step 2.1: System Updates & Essential Tools
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget apt-transport-https ca-certificates gnupg lsb-release git conntrack
```

### Step 2.2: Install Java (OpenJDK 17) & Node.js
```bash
# Install Java 17 for Jenkins
sudo apt install -y openjdk-17-jdk openjdk-17-jre
java -version

# Install Node.js 20 LTS for Build & Test stage
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

### Step 2.3: Install Docker CE
```bash
# Add Docker GPG key & repository
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable & start Docker
sudo systemctl enable docker
sudo systemctl start docker

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu
```

### Step 2.4: Install Jenkins LTS
```bash
# Add Jenkins GPG key & repository
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /etc/apt/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install -y jenkins

# Enable & start Jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins
```

### Step 2.5: Install kubectl & Minikube
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
kubectl version --client

# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
minikube version
```

### Step 2.6: Start Minikube
Run this as the `ubuntu` user (Minikube uses Docker driver):
```bash
# Start Minikube using Docker driver
minikube start --driver=docker --listen-address=0.0.0.0

# Verify Minikube cluster status
minikube status
kubectl get nodes
```

### Step 2.7: ⚠️ CRITICAL STEP: Grant Jenkins Access to Docker & Minikube
By default, the `jenkins` system user does not have permission to execute Docker or access Minikube's `kubeconfig`. Configure permissions as follows:

```bash
# 1. Add jenkins user to docker group
sudo usermod -aG docker jenkins

# 2. Copy Minikube & Kubernetes configs to Jenkins home directory
sudo mkdir -p /var/lib/jenkins/.kube
sudo mkdir -p /var/lib/jenkins/.minikube

# Copy credentials and certificates
sudo cp -r /home/ubuntu/.kube/config /var/lib/jenkins/.kube/config
sudo cp -r /home/ubuntu/.minikube/client.crt /var/lib/jenkins/.minikube/ 2>/dev/null || true
sudo cp -r /home/ubuntu/.minikube/client.key /var/lib/jenkins/.minikube/ 2>/dev/null || true
sudo cp -r /home/ubuntu/.minikube/ca.crt /var/lib/jenkins/.minikube/ 2>/dev/null || true

# 3. Grant jenkins full ownership of its .kube & .minikube
sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube
sudo chown -R jenkins:jenkins /var/lib/jenkins/.minikube
sudo chmod 600 /var/lib/jenkins/.kube/config

# 4. Restart Jenkins to apply group and config permissions
sudo systemctl restart jenkins

# 5. Verify Jenkins user can run docker and kubectl
sudo -u jenkins docker ps
sudo -u jenkins kubectl get nodes
```
*(Both commands above should output table headers with NO errors).*

---

## 6. Phase 3: Jenkins Initial Configuration & Credentials Setup

### Step 3.1: Unlock Jenkins
1. Open your web browser and navigate to:  
   `http://<YOUR-EC2-PUBLIC-IP>:8080`
2. Fetch the administrator password from the server:
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
3. Paste the password into Jenkins and click **Continue**.
4. Click **Install suggested plugins** and wait for the installer to finish.
5. Create your Admin user (e.g., username: `admin`, password: `Password@123`, name: `Maanya Rao`).
6. Confirm the Jenkins URL and click **Save and Finish**.

### Step 3.2: Verify Required Plugins
Navigate to **Manage Jenkins** ➔ **Plugins** ➔ **Installed Plugins**. Ensure the following are active (they are typically installed by default):
- **Git plugin**
- **Pipeline**
- **Credentials Binding Plugin**
- *(Optional)* **Docker Pipeline**

### Step 3.3: Configure Docker Hub Credentials in Jenkins
Your `Jenkinsfile` securely loads Docker Hub credentials using the credential ID `dockerhub-credentials`.

1. Go to **Manage Jenkins** ➔ **Credentials** ➔ **System** ➔ **Global credentials (unrestricted)**.
2. Click **+ Add Credentials**.
3. Fill in the fields:
   - **Kind:** `Username with password`
   - **Scope:** `Global (Jenkins, nodes, items, all child items, etc)`
   - **Username:** `maanyarao` *(Your Docker Hub username)*
   - **Password:** *Your Docker Hub Password or Personal Access Token*
   - **ID:** `dockerhub-credentials`  *(⚠️ Must match the ID in Jenkinsfile exactly)*
   - **Description:** `Docker Hub Login for node-cicd-app`
4. Click **Create**.

---

## 7. Phase 4: Setting Up the Jenkins Pipeline Job

### Step 4.1: Create a New Pipeline Job
1. In the Jenkins dashboard, click **New Item** on the left menu.
2. Enter the name: `node-cicd-pipeline`.
3. Select **Pipeline** and click **OK**.

### Step 4.2: Configure the Pipeline from SCM
1. In the **General** tab:
   - Description: `Automated CI/CD Pipeline for CCA 2 Lab (GitHub -> Docker Hub -> Minikube)`
   - *(Optional)* Check **GitHub project** and paste: `https://github.com/maanyarao/node-cicd-app/`
2. In the **Build Triggers** section:
   - Check **Poll SCM** and enter schedule: `H/2 * * * *` *(polls every 2 minutes for new commits)*, OR
   - Check **GitHub hook trigger for GITScm polling** (if you configure GitHub Webhook).
3. Scroll to the **Pipeline** section at the bottom:
   - **Definition:** Select `Pipeline script from SCM`.
   - **SCM:** Select `Git`.
   - **Repository URL:** `https://github.com/maanyarao/node-cicd-app.git`
   - **Credentials:** `- none -` (since the repository is public).
   - **Branch Specifier:** `*/main`
   - **Script Path:** `Jenkinsfile`
   - **Lightweight checkout:** Keep checked.
4. Click **Save**.

---

## 8. Phase 5: First Pipeline Execution & Verification (Run 1)

### Step 5.1: Trigger Build #1
1. On the `node-cicd-pipeline` dashboard, click **Build Now**.
2. Under **Build History**, click `#1` ➔ **Console Output**.
3. Watch each stage execute:
   - ✅ **Jenkins Checkout:** Fetches the repository from GitHub.
   - ✅ **Build and Test:** Runs `node --check app.js` to ensure zero syntax errors.
   - ✅ **Docker Build:** Builds `maanyarao/node-cicd-app:1` and tags it `:latest`.
   - ✅ **Push Image:** Authenticates with Docker Hub and pushes both tags.
   - ✅ **Minikube Deployment:** Applies manifests to Minikube cluster via `kubectl apply`.
   - ✅ **Verification:** Awaits rollout completion and displays pod and service status.
   - 🏁 **Result:** `Finished: SUCCESS`.

### Step 5.2: Check Kubernetes Status on the Server
Open your EC2 terminal and run:
```bash
kubectl get deployments
kubectl get pods -l app=node-cicd-app -o wide
kubectl get service node-cicd-app-service
```
You should see:
- 1 Replica Ready: `1/1`
- Pod Status: `Running`
- Service Port: `3000:30080/TCP`

### Step 5.3: Access the Application in Browser
Because Minikube runs inside a container network on AWS, route traffic to the external port:

**Method A: Port Forwarding (Recommended & Easiest)**
```bash
# Run in background or in a tmux/screen session:
kubectl port-forward --address 0.0.0.0 service/node-cicd-app-service 30080:3000 &
```
*(Now open `http://<YOUR-EC2-PUBLIC-IP>:30080` in your web browser!)*

**Method B: Minikube Service URL**
```bash
minikube service node-cicd-app-service --url
```

Verify two endpoints:
1. **Web Dashboard:** `http://<YOUR-EC2-PUBLIC-IP>:30080/`
2. **Health Check API:** `http://<YOUR-EC2-PUBLIC-IP>:30080/health`

---

## 9. Phase 6: Source Code Change Demonstration (Run 2)

**Mandatory Requirement (PDF Section 1 & 4):**  
*"After the first successful run, you must change the source code, push it, and run the pipeline again to show the new version being deployed."*

### Step 6.1: Make a Visual Code Change
Open `app.js` locally or in the editor and edit line 234:

```diff
- <h1>University Lab CI/CD Demo - Version 2</h1>
+ <h1>University Lab CI/CD Demo - Version 2.0 (Redeployed via Jenkins)</h1>
```
Or update the version badge / banner text to visibly show the update.

### Step 6.2: Commit & Push to GitHub
```bash
git add app.js
git commit -m "feat: release version 2.0 with updated UI header"
git push origin main
```

### Step 6.3: Run Pipeline Build #2
1. Go back to Jenkins and click **Build Now** (or wait for the SCM Poller to trigger automatically).
2. Jenkins will initiate Build `#2`.
3. Watch the pipeline build image tag `maanyarao/node-cicd-app:2`, push it to Docker Hub, and execute a rolling update on Minikube.
4. Kubernetes replaces the old pod with the new container image with zero downtime.

### Step 6.4: Verify the New Version Live
1. Refresh your browser at `http://<YOUR-EC2-PUBLIC-IP>:30080/`.
2. Notice the new header: **"University Lab CI/CD Demo - Version 2.0 (Redeployed via Jenkins)"**.
3. Check the rollout history in terminal:
   ```bash
   kubectl rollout history deployment/node-cicd-app
   kubectl get pods -l app=node-cicd-app
   ```

---

## 10. Submission & Screenshot Checklist (For 10/10 Marks)

To secure full marks as outlined in Section 5 and the Rubric of the student guide, prepare and submit the following:

### 1. Deliverables Checklist
- [ ] **GitHub Repository URL:** `https://github.com/maanyarao/node-cicd-app`
- [ ] **Jenkinsfile:** Declarative pipeline stored at root of repository
- [ ] **Dockerfile:** Multi-platform Node.js Alpine container definition
- [ ] **Kubernetes Manifests:** `k8s/deployment.yaml` and `k8s/service.yaml`
- [ ] **README / Lab Report:** Explanation of stages, setup, and changes
- [ ] **Screenshots Document:** Complete visual proof

### 2. Required Screenshots Checklist
Capture and include these 8 screenshots in your report:

| # | Screenshot Name | What to Capture |
| :-: | :--- | :--- |
| **1** | **AWS EC2 Console** | Running EC2 instance showing Public IP, Instance Type (`t2.medium`), and Security Group rules. |
| **2** | **GitHub Repository** | GitHub repo landing page showing `Jenkinsfile`, `Dockerfile`, `app.js`, and `k8s/` folder. |
| **3** | **Jenkins Credentials** | Global Credentials screen showing `dockerhub-credentials` configured. |
| **4** | **Jenkins Stage View** | Successful pipeline execution showing all 6 stages green (Checkout ➔ Build & Test ➔ Docker Build ➔ Push Image ➔ Minikube Deployment ➔ Verification). |
| **5** | **Jenkins Console Log** | Bottom of build output showing `Finished: SUCCESS` and `kubectl rollout status`. |
| **6** | **Docker Hub Repository** | Docker Hub web UI showing uploaded tags `:1`, `:2`, and `:latest`. |
| **7** | **Kubernetes CLI Output** | Terminal running `kubectl get pods,svc -o wide` and `kubectl rollout history`. |
| **8** | **Live Browser App (Before & After)** | Side-by-side or before/after screenshots of the running web application showing Version 1 and Version 2 after code push. |

---

## 11. Troubleshooting Common Issues

### Issue 1: `Got permission denied while trying to connect to the Docker daemon socket`
- **Cause:** User `jenkins` is not in the `docker` group.
- **Fix:**
  ```bash
  sudo usermod -aG docker jenkins
  sudo systemctl restart jenkins
  ```

### Issue 2: `kubectl: error loading config file /var/lib/jenkins/.kube/config`
- **Cause:** Jenkins cannot read Minikube's kubeconfig or certificates.
- **Fix:**
  ```bash
  sudo mkdir -p /var/lib/jenkins/.kube
  sudo cp -f /home/ubuntu/.kube/config /var/lib/jenkins/.kube/config
  sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube
  sudo chmod 600 /var/lib/jenkins/.kube/config
  ```

### Issue 3: `Minikube: Exiting due to GUEST_PROVISION: Failed to start host: ... out of memory`
- **Cause:** EC2 instance is too small (`t2.micro` with only 1 GB RAM).
- **Fix:** Upgrade instance type to `t2.medium` (4 GB RAM) or create a 4 GB Linux swap file:
  ```bash
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```

### Issue 4: Cannot open app at `http://<EC2-IP>:30080` in browser
- **Cause 1:** EC2 Security Group is blocking port 30080. Check AWS SG Inbound Rules and allow TCP port `30080` from `0.0.0.0/0`.
- **Cause 2:** Minikube runs on its own internal Docker bridge network.
- **Fix:** Run kubectl port-forwarding on the EC2 server:
  ```bash
  kubectl port-forward --address 0.0.0.0 service/node-cicd-app-service 30080:3000 &
  ```

---

## 12. Comprehensive Viva Voce / Oral Exam Preparation

During the lab evaluation, the professor or external evaluator will ask questions regarding the tools, architecture, and pipeline stages. Be prepared with the following answers:

### Q1: What is the core difference between Continuous Integration (CI) and Continuous Deployment (CD)?
- **CI (Continuous Integration):** The automated process of continuously pulling newly committed code from version control, verifying syntax, running unit tests, and packaging artifacts (Docker image) to catch bugs as early as possible.
- **CD (Continuous Deployment):** The practice where every build that passes all testing stages is automatically deployed directly to the production/target environment (Minikube cluster) without human approval.

### Q2: Why did you choose a Declarative Pipeline (`Jenkinsfile`) over a Freestyle Job?
- Declarative pipelines represent **Pipeline as Code (PaC)**.
- The pipeline definition is version-controlled alongside application code in Git.
- It is reproducible, auditable, supports branching, and allows easy stage management, error handling, and parallel execution.

### Q3: How does the pipeline push and deploy specific versions instead of just `latest`?
- In `Jenkinsfile`, we use the environment variable `${BUILD_NUMBER}` provided by Jenkins.
- The Docker image is tagged with both `${IMAGE_NAME}:${BUILD_NUMBER}` (e.g. `:1`, `:2`) and `${IMAGE_NAME}:latest`.
- In the Minikube Deployment stage, we dynamically substitute the image tag using `sed`:
  ```bash
  sed "s|maanyarao/node-cicd-app:latest|${IMAGE_NAME}:${BUILD_NUMBER}|g" k8s/deployment.yaml | kubectl apply -f -
  ```
- This guarantees Kubernetes detects a container image change and triggers a rolling update.

### Q4: What is the purpose of Kubernetes Deployment vs. Service?
- **Deployment:** Manages the lifecycle of the application Pods, ensuring the specified number of replicas (`replicas: 1`) are running, self-healing failed pods, and orchestrating zero-downtime rolling updates.
- **Service (`NodePort`):** Exposes the Pods across the cluster and maps an external port (`30080`) to the container's internal port (`3000`), providing stable networking and internal load balancing.

### Q5: How did you handle secrets in Jenkins? Why is hardcoding Docker Hub credentials a bad practice?
- Credentials must never be hardcoded in Git or `Jenkinsfile` for security and compliance reasons.
- We used the **Jenkins Credentials Store** with ID `dockerhub-credentials`.
- In the pipeline, `withCredentials([usernamePassword(...)])` binds the credentials to temporary environment variables that are masked (`****`) in console logs and automatically purged after execution.

### Q6: If a project does not have automated unit tests, how do you handle the "Build and Test" stage?
- We implement a syntax validation and static check step: `node --check app.js`.
- This ensures the Node.js engine verifies all syntax, imports, and grammatical validity before any Docker build occurs, fulfilling the CI verification requirement.
