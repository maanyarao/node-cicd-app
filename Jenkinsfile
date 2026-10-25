pipeline {
    agent any

    environment {
        APP_NAME = 'node-cicd-app'
        CONTAINER_NAME = 'node-cicd-app-container'
        PORT = '3000'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🔨 Building Docker image...'
                sh "docker build -t ${APP_NAME}:latest ."
            }
        }

        stage('Deploy Container') {
            steps {
                echo '🚀 Deploying container...'
                sh """
                    if [ "\$(docker ps -aq -f name=^/${CONTAINER_NAME}\$)" ]; then
                        docker stop ${CONTAINER_NAME} || true
                        docker rm ${CONTAINER_NAME} || true
                    fi
                    docker run -d --name ${CONTAINER_NAME} -p ${PORT}:3000 --restart unless-stopped ${APP_NAME}:latest
                """
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline Succeeded! Application running at http://localhost:${PORT}"
        }
        failure {
            echo "❌ Pipeline Failed! Please check the logs."
        }
    }
}
