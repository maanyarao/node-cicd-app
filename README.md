# 🚀 Automated CI/CD Pipeline & Kubernetes Deployment (CCA 2)

**Course:** TYCSE · Cloud Computing and DevOps  
**Student Name:** Maanya Rao  
**Repository:** [https://github.com/maanyarao/node-cicd-app](https://github.com/maanyarao/node-cicd-app)  
**Container Registry:** [Docker Hub: maanyarao/node-cicd-app](https://hub.docker.com/r/maanyarao/node-cicd-app)  

---

## 📌 Project Overview
This repository contains an automated end-to-end Continuous Integration and Continuous Deployment (CI/CD) pipeline for a **Node.js & Express** web application. The pipeline is orchestrated using **Jenkins** running on an **AWS EC2 instance**, containerized using **Docker**, stored in **Docker Hub**, and automatically deployed onto a local **Kubernetes cluster using Minikube**.

---

## 🏗️ Architecture & Workflow

```
                                 AWS EC2 SERVER
                         ┌─────────────────────────────────────────────────┐
[ Developer ]            │   [ Jenkins Server (Port 8080) ]                │
      │                  │         │                                       │
      │ git push         │         ▼ (Poll SCM / Webhook)                  │
      ▼                  │   [ Declarative Jenkinsfile ]                   │
 [ GitHub Repo ] ────────┼──►      ├─ Stage 1: Jenkins Checkout            │
                         │         ├─ Stage 2: Build and Test              │
                         │         ├─ Stage 3: Docker Build                │
                         │         │                                       │
 [ Docker Hub ] ◄────────┼─────────┴─ Stage 4: Push Image                  │
 (maanyarao/node-cicd-app) │                                                │
      │                  │         ┌─ Stage 5: Minikube Deployment         │
      │ kubectl pull     │         │                                       │
      └──────────────────┼─────────► [ Minikube K8s Cluster ]              │
                         │                 │                               │
                         │                 ├─ Deployment (node-cicd-app)   │
                         │                 └─ Service (NodePort: 30080)    │
                         │                                                 │
                         │   [ Live Application (Port 30080) ]             │
                         └─────────────────▲───────────────────────────────┘
                                           │
                                     View in Browser
```

---

## 📋 Pipeline Stages Explained

| Stage | Stage Name | Action & Technical Description |
| :---: | :--- | :--- |
| **1** | **Jenkins Checkout** | Clones the latest commit from the GitHub repository (`main` branch) onto the Jenkins workspace using `checkout scm`. |
| **2** | **Build and Test** | Performs code syntax validation using Node's native compiler check (`node --check app.js`), ensuring zero syntax errors before proceeding. |
| **3** | **Docker Build** | Builds an optimized container image using the `Dockerfile` with multi-tagging: dynamic build version `${IMAGE_NAME}:${BUILD_NUMBER}` and `${IMAGE_NAME}:latest`. |
| **4** | **Push Image** | Authenticates securely with Docker Hub using Jenkins credentials (`dockerhub-credentials`) and publishes both tags to the remote container registry. |
| **5** | **Minikube Deployment** | Dynamically substitutes the image tag in `k8s/deployment.yaml` with the current build number and applies the Deployment and Service manifests via `kubectl apply`. |
| **6** | **Verification** | Awaits rollout completion (`kubectl rollout status deployment/node-cicd-app`) and outputs active pod and service statuses for automated verification. |

---

## ⚙️ How Jenkins & Minikube Were Set Up on AWS

1. **AWS EC2 Provisioning:**
   - **Instance Type:** `t2.medium` (Ubuntu 22.04 LTS, 2 vCPUs, 4 GB RAM, 30 GB SSD) to ensure sufficient resources for Jenkins, Docker, and Minikube.
   - **Security Group Inbound Rules:**
     - Port `22` (SSH access)
     - Port `8080` (Jenkins Web UI)
     - Port `30080` (Kubernetes NodePort application access)
     - Port `3000` (Direct test port)

2. **Software Installation:**
   - **Java 17 (OpenJDK)** & **Node.js 20 LTS**
   - **Docker Engine (CE)** (`systemctl enable --now docker`)
   - **Jenkins LTS** (`systemctl enable --now jenkins`)
   - **kubectl** & **Minikube** (`minikube start --driver=docker`)

3. **Permissions & Integration:**
   - Added user `jenkins` to the `docker` group: `sudo usermod -aG docker jenkins`.
   - Shared Minikube cluster certificates and kubeconfig to `/var/lib/jenkins/.kube/config` and granted ownership to `jenkins:jenkins`.

---

## 🔐 Docker Hub Integration & Credentials

- Generated a secure Docker Hub Personal Access Token (PAT).
- Configured within Jenkins under **Manage Jenkins** ➔ **Credentials** as a `Username with password` credential named **`dockerhub-credentials`**.
- Utilized in `Jenkinsfile` through `withCredentials([usernamePassword(...)])`, which dynamically injects credentials without exposing them in console output or version control.

---

## ☸️ Kubernetes Deployment & Service Manifests

Located inside the [`k8s/`](file:///Users/MAANYA/Downloads/ci-cd/k8s) directory:
- **`k8s/deployment.yaml`:**
  - Deployment name: `node-cicd-app`
  - Replicas: `1`
  - Container image: dynamically injected as `maanyarao/node-cicd-app:${BUILD_NUMBER}`
  - Target container port: `3000`
- **`k8s/service.yaml`:**
  - Service type: `NodePort`
  - Internal targetPort: `3000`
  - Exposed nodePort: `30080`

---

## 🔄 Code Change & Automated Redeployment Demonstration

To demonstrate Continuous Deployment (CD):
1. **Initial Run (Build #1):**
   - Code from initial commit built and deployed as `maanyarao/node-cicd-app:1`.
   - Accessible at `http://<EC2-IP>:30080` showing the initial UI.
2. **Source Code Update (Build #2):**
   - Updated `app.js` header to announce the redeployment.
   - Committed and pushed to GitHub:
     ```bash
     git add app.js
     git commit -m "feat: release version 2.0 with updated UI header"
     git push origin main
     ```
   - Jenkins detected changes via SCM polling and triggered Build `#2`.
   - Kubernetes performed a rolling update: pulling `maanyarao/node-cicd-app:2` and replacing the older pod with zero downtime.
   - Refreshed browser to verify the new version live.

---

## 📖 Complete Step-by-Step Execution Guide
For detailed copy-paste bash scripts, AWS setup commands, and viva preparation, refer to the [Complete Assignment Execution Guide (ASSIGNMENT_EXECUTION_GUIDE.md)](./ASSIGNMENT_EXECUTION_GUIDE.md).
