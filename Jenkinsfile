pipeline {
  agent any

  environment {
    DOCKER_CREDS = credentials('dockerhub-creds')        // DockerHub username/password
    GIT_CREDENTIALS = 'github-creds'                     // optional
    AZURE_CRED = 'azure-sp-sdk-auth'                     // azure service principal JSON (secret text)
    REGISTRY = "${DOCKER_CREDS_USR}"                     // dockerhub username
    BUILD_TAG = "${env.BUILD_NUMBER}"
    BACKEND_IMAGE = "${REGISTRY}/book-backend:${BUILD_TAG}"
    FRONTEND_IMAGE = "${REGISTRY}/book-frontend:${BUILD_TAG}"
    // The service name of your backend inside k8s (used by frontend)
    BACKEND_SVC_URL = "http://backend-service:8000"
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/nagapavani23/webapp.git', credentialsId: env.GIT_CREDENTIALS
      }
    }

    stage('Build Backend Image') {
      steps {
        dir('backend') {
          sh """
            docker build -t ${BACKEND_IMAGE} .
          """
        }
      }
    }

    stage('Push Backend Image') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh """
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push ${BACKEND_IMAGE}
          """
        }
      }
    }

    stage('Prepare Frontend (inject API URL)') {
      steps {
        // Replace placeholder __API_URL__ in index.html with cluster service URL before building
        sh """
          if grep -q '__API_URL__' frontend/index.html; then
            cp -v frontend/index.html frontend/index.html.bak
            sed -i 's|__API_URL__|${BACKEND_SVC_URL}|g' frontend/index.html
          fi
        """
      }
    }

    stage('Build Frontend Image') {
      steps {
        dir('frontend') {
          sh """
            docker build -t ${FRONTEND_IMAGE} .
          """
        }
      }
    }

    stage('Push Frontend Image') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh """
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push ${FRONTEND_IMAGE}
          """
        }
      }
    }

    stage('Login to Azure & Configure AKS') {
      steps {
        withCredentials([string(credentialsId: 'azure-sp-sdk-auth', variable: 'AZURE_JSON')]) {
          sh '''
            echo "$AZURE_JSON" > azure.json
            clientId=$(jq -r .clientId azure.json)
            clientSecret=$(jq -r .clientSecret azure.json)
            tenantId=$(jq -r .tenantId azure.json)
            az login --service-principal --username "$clientId" --password "$clientSecret" --tenant "$tenantId"
            # Replace resource-group and cluster name with your values if different
            az aks get-credentials --resource-group pavani --name webapp --overwrite-existing
          '''
        }
      }
    }

    stage('Deploy: Update Images in AKS') {
      steps {
        sh """
          # Update backend image
          kubectl set image deployment/backend backend=${BACKEND_IMAGE} --record
          kubectl rollout status deployment/backend --timeout=120s

          # Update frontend image
          kubectl set image deployment/frontend frontend=${FRONTEND_IMAGE} --record
          kubectl rollout status deployment/frontend --timeout=120s
        """
      }
    }

    stage('Post-deploy: Verify') {
      steps {
        sh """
          echo "Pods after deploy:"
          kubectl get pods -o wide
          echo "Backend image in deployment:"
          kubectl get deployment backend -o jsonpath='{.spec.template.spec.containers[0].image}'
          echo
          echo "Frontend image in deployment:"
          kubectl get deployment frontend -o jsonpath='{.spec.template.spec.containers[0].image}'
          echo
        """
      }
    }
  }

  post {
    success {
      echo "✅ Deploy successful. Images: ${BACKEND_IMAGE} , ${FRONTEND_IMAGE}"
    }
    failure {
      echo "❌ Deploy failed — check logs above."
    }
  }
}
