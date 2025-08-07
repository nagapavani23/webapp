pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDS = credentials('dockerhub-creds')
        BUILD_TAG = "${env.BUILD_NUMBER}"
        BACKEND_IMAGE = "${DOCKER_HUB_CREDS_USR}/book-backend:${BUILD_TAG}"
        FRONTEND_IMAGE = "${DOCKER_HUB_CREDS_USR}/book-frontend:${BUILD_TAG}"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', credentialsId: 'github-creds', url: 'https://github.com/nagapavani23/webapp.git'
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    sh "docker build -t ${BACKEND_IMAGE} ."
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                dir('frontend') {
                    sh "docker build -t ${FRONTEND_IMAGE} ."
                }
            }
        }

        stage('Push Docker Images to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${BACKEND_IMAGE}
                        docker push ${FRONTEND_IMAGE}
                    """
                }
            }
        }

        stage('Login to Azure & Configure AKS Access') {
            steps {
                withCredentials([string(credentialsId: 'azure-sp-sdk-auth', variable: 'AZURE_CRED')]) {
                    sh '''
                        echo "$AZURE_CRED" > azure.json

                        clientId=$(jq -r .clientId azure.json)
                        clientSecret=$(jq -r .clientSecret azure.json)
                        tenantId=$(jq -r .tenantId azure.json)

                        az login --service-principal \
                                 --username "$clientId" \
                                 --password "$clientSecret" \
                                 --tenant "$tenantId"

                        az aks get-credentials --resource-group pavani --name webapp
                    '''
                }
            }
        }

        stage('Update Image Tags in Kubernetes Manifests') {
            steps {
                sh """
                    sed -i 's|image: .*/book-backend:.*|image: ${BACKEND_IMAGE}|' k8s/backend-deployment.yaml
                    sed -i 's|image: .*/book-frontend:.*|image: ${FRONTEND_IMAGE}|' k8s/frontend-deployment.yaml
                """
            }
        }

        stage('Deploy to AKS') {
            steps {
                sh '''
                    kubectl apply -f k8s/backend-deployment.yaml
                    kubectl apply -f k8s/frontend-deployment.yaml
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Successfully deployed to AKS with Build Tag: ${BUILD_TAG}"
        }
        failure {
            echo "❌ Deployment to AKS failed."
        }
    }
}
