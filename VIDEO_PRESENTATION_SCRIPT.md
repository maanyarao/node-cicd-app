# 🎬 10-Minute Video Presentation Script
**Assignment:** CCA 2 – Automated CI/CD Pipeline Implementation & Deployment  
**Subject:** Cloud Computing and DevOps (TYCSE)  
**Student:** Maanya Rao  
**Target Duration:** ~10 Minutes  
**Application:** `node-cicd-app` (Node.js & Express)  

---

## ⏱️ Video Timeline Overview

| Time Range | Section | Screen Display | Key Rubric Covered |
| :---: | :--- | :--- | :--- |
| **00:00 – 01:15** | **1. Introduction & Architecture** | Slide / Architecture Diagram | Objective & System Overview |
| **01:15 – 02:45** | **2. Repository & Code Walkthrough** | GitHub / VS Code | GitHub, Dockerfile, K8s manifests |
| **02:45 – 04:15** | **3. Jenkinsfile Pipeline as Code** | VS Code / Jenkins | Declarative Pipeline (6 Stages) |
| **04:15 – 05:30** | **4. AWS Infrastructure & Jenkins Setup** | AWS Console & Jenkins UI | EC2 Setup, Plugins, Credentials |
| **05:30 – 07:00** | **5. Live Pipeline Run #1 (Build #1)** | Jenkins Stage View & Logs | Automated Build, Test, Push, Deploy |
| **07:00 – 08:00** | **6. Kubernetes & App Verification** | Terminal (`kubectl`) & Browser | Pods, Services, Live Web App |
| **08:00 – 09:15** | **7. Code Change Demonstration (Build #2)** | Code edit, Git Push, Jenkins | Continuous Deployment & Rolling Update |
| **09:15 – 10:00** | **8. Conclusion & Summary** | Browser showing new version | Wrap-up & Rubric Summary |

---

## 📜 Detailed Word-for-Word Script & Screen Directions

---

### Part 1: Introduction & Architecture (00:00 – 01:15)

**🖥️ Screen to Display:**  
Show your architecture diagram (from the README or guide) or the assignment title slide.

**🎙️ Spoken Words:**  
> *"Hello everyone and respected evaluator. My name is Maanya Rao, and today I am demonstrating my Cloud Computing and DevOps Continuous Assessment 2 project: the design and implementation of a completely automated CI/CD pipeline deploying a containerized application onto a Kubernetes cluster on AWS.*
> 
> *The goal of this assignment is zero-touch delivery. Whenever a developer pushes code to GitHub, Jenkins automatically checks out the code, executes syntax tests, builds a lightweight Docker image, securely authenticates and pushes the image to Docker Hub with dynamic build tags, and deploys it onto a Kubernetes cluster running on Minikube using rolling updates.*
> 
> *In this 10-minute demonstration, I will walk you through the code, our AWS infrastructure, trigger the complete pipeline live, verify the running application, and then demonstrate an automated redeployment triggered by a source code update."*

---

### Part 2: Repository & Code Walkthrough (01:15 – 02:45)

**🖥️ Screen to Display:**  
Switch to your GitHub repository: `https://github.com/maanyarao/node-cicd-app` and your editor.

**🎙️ Spoken Words:**  
> *"Let's look at the project repository on GitHub. The application is a Node.js Express service featuring a status dashboard and an automated `/health` endpoint.*
> 
> *Our repository adheres strictly to standard DevOps structure:*
> 1. *`app.js` and `package.json`: Represent our core application and dependencies.*
> 2. *`Dockerfile`: We use `node:20-alpine` as a base to keep the image secure and lightweight (under 150MB). We follow Docker layer caching by copying `package.json` first, installing only production dependencies, and then copying the application code.*
> 3. *`k8s/` folder: Contains our Kubernetes manifests:*
>    - *`deployment.yaml`: Defines our Kubernetes Deployment with 1 replica, pulling our Docker Hub image dynamically.*
>    - *`service.yaml`: Defines a `NodePort` service mapping container port 3000 to NodePort 30080 so external traffic can reach our pods.*
> 4. *`Jenkinsfile`: Contains our declarative pipeline definition, keeping our pipeline as versioned code alongside our application."*

---

### Part 3: Jenkinsfile Pipeline as Code (02:45 – 04:15)

**🖥️ Screen to Display:**  
Open `Jenkinsfile` in VS Code or GitHub. Highlight the stages.

**🎙️ Spoken Words:**  
> *"Here is our Declarative Jenkinsfile. It is structured into 6 automated stages matching the assignment specification:*
> 
> 1. *Stage 1 – Jenkins Checkout: Checks out the latest commit from our GitHub repository using `checkout scm`.*
> 2. *Stage 2 – Build and Test: Validates code integrity before packaging by executing `node --check app.js`, which parses syntax and validates the script.*
> 3. *Stage 3 – Docker Build: Packages the application into a Docker image, tagged dynamically with both the unique build number `${IMAGE_NAME}:${BUILD_NUMBER}` and `:latest` for traceability.*
> 4. *Stage 4 – Push Image: Uses Jenkins's `withCredentials` block to securely bind our Docker Hub credentials without exposing passwords in logs, logs into Docker Hub, and publishes both image tags.*
> 5. *Stage 5 – Minikube Deployment: Dynamically injects the current build tag into `k8s/deployment.yaml` using a stream editor command and applies both Deployment and Service manifests via `kubectl apply`.*
> 6. *Stage 6 – Verification: Executes `kubectl rollout status` with a timeout to verify the rolling update completes successfully, followed by `kubectl get pods` and `kubectl get services`.*
> 
> *Finally, the `post` block provides immediate notifications on build success or failure."*

---

### Part 4: AWS Infrastructure & Jenkins Setup (04:15 – 05:30)

**🖥️ Screen to Display:**  
1. AWS EC2 Console showing your running instance and Security Group rules.  
2. Jenkins dashboard (`http://<EC2-IP>:8080`) showing the configured credentials.

**🎙️ Spoken Words:**  
> *"Now let's examine the infrastructure hosting our CI/CD pipeline.*
> 
> *In the AWS EC2 Management Console, you can see our Ubuntu 24.04 instance. In our Security Group inbound rules, we have opened:*
> - *Port 22 for SSH management,*
> - *Port 8080 for the Jenkins Web Dashboard,*
> - *Port 30080 for our Kubernetes NodePort web service.*
> 
> *On the server, we have installed OpenJDK 21, Docker CE, Jenkins LTS, and Minikube. Crucially, we added the `jenkins` system user to the `docker` group and flattened our Kubernetes cluster certificates into `/var/lib/jenkins/.kube/config`, allowing Jenkins to execute Docker and kubectl commands autonomously without requiring root privileges.*
> 
> *Under Jenkins Global Credentials, we have securely registered `dockerhub-credentials` using our Docker Hub access token."*

---

### Part 5: Live Pipeline Run #1 (05:30 – 07:00)

**🖥️ Screen to Display:**  
In Jenkins, navigate to `node-cicd-pipeline` and click **Build Now**. Click on the build number and open **Console Output** or **Stage View**.

**🎙️ Spoken Words:**  
> *"Now let's run our pipeline live. I will click 'Build Now'.*
> 
> *Looking at the live console logs:*
> - *First, Jenkins checks out the repository from GitHub.*
> - *Next, it runs the syntax verification test — it passes.*
> - *Now Docker builds our image using layer caching and tags it with build number 1 and latest.*
> - *In the Push stage, Jenkins authenticates securely with Docker Hub using masked environment variables and uploads the image layers.*
> - *Next, in the Minikube Deployment stage, `kubectl apply` deploys our manifests.*
> - *Finally, the Verification stage waits for the Kubernetes rollout to be confirmed.*
> 
> *And as you can see: `Finished: SUCCESS`. All 6 stages in the Stage View are completely green."*

---

### Part 6: Kubernetes & Live App Verification (07:00 – 08:00)

**🖥️ Screen to Display:**  
1. Open your terminal connected to EC2 and run verification commands.  
2. Open your browser and navigate to `http://<EC2-PUBLIC-IP>:30080`.

**🎙️ Spoken Words:**  
> *"Let's verify our deployment directly in the cluster.*
> 
> *In the terminal, I will run:*
> ```bash
> kubectl get pods -l app=node-cicd-app -o wide
> kubectl get service node-cicd-app-service
> ```
> *The pod is in `Running` state and the service is actively exposed on NodePort 30080.*
> 
> *Now, switching over to Docker Hub in my browser, you can see that `maanyarao/node-cicd-app` has been published with tag `:1` and `:latest` just moments ago.*
> 
> *Next, let's open the live application in the web browser at `http://<EC2-IP>:30080`. The dashboard is live, showing container uptime, runtime info, and when we click `/health`, it returns our JSON health check with status UP."*

---

### Part 7: Code Change Demonstration (Run 2) (08:00 – 09:15)

**🖥️ Screen to Display:**  
1. Open `app.js` in your editor.  
2. Make a visible change (e.g., `"University Lab CI/CD Demo - Version 3"`).  
3. Git commit and push in terminal.  
4. Show Jenkins triggering Build #2.

**🎙️ Spoken Words:**  
> *"As required by Section 1 and Section 4 of the CCA 2 guide, we must now demonstrate continuous deployment by making a source code change, pushing it to GitHub, and showing the updated version automatically deployed.*
> 
> *In `app.js`, I am updating the main heading from 'Version 2' to 'Version 3 - Redeployed via Automated Pipeline'.*
> 
> *Now in my terminal, I commit and push the change to GitHub:*
> ```bash
> git add app.js
> git commit -m "feat: release version 3 with updated title"
> git push origin main
> ```
> *Now let's switch back to Jenkins. Build #2 starts automatically. Notice how Build #2 creates image tag `:2`, pushes tag `:2` to Docker Hub, and executes a zero-downtime rolling update on Minikube.*
> 
> *Let's check the rollout history on Kubernetes:*
> ```bash
> kubectl rollout history deployment/node-cicd-app
> ```
> *Kubernetes cleanly terminated the old container and launched the new replica.*
> 
> *Now, I refresh our live browser tab at port 30080 — and as you can see, the header now displays 'Version 3 - Redeployed via Automated Pipeline' instantly, without any manual server intervention!"*

---

### Part 8: Conclusion & Summary (09:15 – 10:00)

**🖥️ Screen to Display:**  
Show your GitHub repo, Jenkins Stage View with both successful builds, and the running app.

**🎙️ Spoken Words:**  
> *"To conclude, we have successfully met all evaluation criteria for this lab:*
> 1. *Maintained a clean, production-grade GitHub repository.*
> 2. *Configured an AWS EC2 instance running Jenkins, Docker, and Minikube.*
> 3. *Built an optimized Dockerfile and container image.*
> 4. *Implemented a Declarative Jenkinsfile covering Checkout, Build & Test, Docker Build, Push, Deploy, and Verification.*
> 5. *Integrated securely with Docker Hub using masked credentials.*
> 6. *Deployed onto Kubernetes using native Deployment and Service manifests.*
> 7. *Demonstrated end-to-end continuous deployment with a live code update.*
> 
> *Thank you very much for your time and evaluation."*

---

## 💡 Quick Tips for Recording
1. **Screen Resolution:** Record at 1080p (1920x1080).
2. **Tabs Ready:** Before hitting record, have these 4 browser tabs open in order:
   - Tab 1: GitHub Repository (`maanyarao/node-cicd-app`)
   - Tab 2: AWS EC2 Management Console
   - Tab 3: Jenkins Dashboard (`http://<EC2-IP>:8080`)
   - Tab 4: Live Application (`http://<EC2-IP>:30080`)
3. **Terminal Ready:** Have your SSH terminal connected and font sized comfortably so commands are easy to read.
