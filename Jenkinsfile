pipeline {
    agent any

    tools {
        nodejs 'NodeJS-24'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Cloning EkleClean from GitHub...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing root dependencies...'
                sh 'npm install'

                echo 'Installing frontend dependencies...'
                sh 'cd frontend && npm install'

                echo 'Installing backend dependencies...'
                sh 'cd backend && npm install'
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building React/Vite frontend...'
                sh 'cd frontend && npm run build'
            }
        }

        stage('Test') {
            steps {
                echo 'Running project checks...'
                sh 'node --version'
                sh 'npm --version'
            }
        }
    }

    post {
        success {
            echo 'EkleClean pipeline completed successfully!'
        }

        failure {
            echo 'EkleClean pipeline failed.'
        }
    }
}