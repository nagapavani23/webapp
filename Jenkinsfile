pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDS = credentials('dockerhub-creds')
        BACKEND_IMAGE = "${DOCKER_HUB_CREDS_USR}/book-backend"
        FRONTEND_IMAGE = "${DOCKER_HUB_CREDS_USR}/book-frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', credentialsId: 'github-creds', url: 'https://github.com/nagapavani23/book-catalog-app.git'
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
                        az login --service-principal --sdk-auth --username $(jq -r .clientId azure.json) \
                                 --password $(jq -r .clientSecret azure.json) \
                                 --tenant $(jq -r .tenantId azure.json)

                        az aks get-credentials --resource-group <RESOURCE_GROUP_NAME> --name <AKS_CLUSTER_NAME> --overwrite-existing
                    '''
                }
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
            echo "✅ Successfully deployed to AKS!"
        }
        failure {
            echo "❌ Deployment to AKS failed."
        }
    }
}
