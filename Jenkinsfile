
pipeline {
    agent any

    environment {
        APP_NAME = 'node-cicd-app'
        DOCKERHUB_USER = 'maanyarao'
        IMAGE_NAME = 'maanyarao/node-cicd-app'
    }

    stages {
        stage('Jenkins Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build and Test') {
            steps {
                echo 'Running build verification and syntax tests...'
                sh 'node --check app.js'
            }
        }

        stage('Docker Build') {
            steps {
                echo "Building Docker image: ${IMAGE_NAME}:${BUILD_NUMBER}"
                sh 'docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} .'
                sh 'docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${IMAGE_NAME}:latest'
            }
        }

        stage('Push Image') {
            steps {
                echo "Pushing image to Docker Hub with tag :${BUILD_NUMBER} and :latest..."
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                            -u "$DOCKER_USER" --password-stdin
                        docker push ${IMAGE_NAME}:${BUILD_NUMBER}
                        docker push ${IMAGE_NAME}:latest
                        docker logout
                    '''
                }
            }
        }

        stage('Minikube Deployment') {
            steps {
                echo 'Applying Kubernetes manifests to Minikube...'
                sh '''
                    sed "s|maanyarao/node-cicd-app:latest|${IMAGE_NAME}:${BUILD_NUMBER}|g" \
                        k8s/deployment.yaml | kubectl apply -f -
                    kubectl apply -f k8s/service.yaml
                '''
            }
        }

        stage('Verification') {
            steps {
                echo 'Verifying deployment rollout status and pod health...'
                sh '''
                    kubectl rollout status deployment/node-cicd-app --timeout=120s
                    kubectl get pods -l app=node-cicd-app
                    kubectl get service node-cicd-app-service
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the stage logs.'
        }
    }
}
