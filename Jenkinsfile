pipeline {
    agent any

    stages {

        stage('Clone') {
            steps {
                echo 'Cloning GitHub repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                bat 'npm install'
                bat 'cd frontend && npm install'
                bat 'cd backend && npm install'
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building React frontend...'
                bat 'cd frontend && npm run build'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                // Ajoute ici tes tests lorsque tu en auras
                echo 'Tests completed'
            }
        }
    }

    post {
        success {
            echo 'Build SUCCESSFUL!'
        }

        failure {
            echo 'Build FAILED!'
        }
    }
}