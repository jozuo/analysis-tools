// --- public
def init() {
    setupEnvironment()
    debugEnvironment()
    changeGitLabStatusToPending()
    initTool()
    changeGitLabStatus('running', 'ジョブ実行中') 
}

def preProcess() {
    cloneSource()
    resolveCommitHashBegin()
    debugEnvironment()
    resolveDiffFiles()
}

def postProcess(commentFilePath) {
    commentToGitLab(commentFilePath)
    changeGitLabStatus('success', 'ジョブが正常に終了しました') 
}

def errorProcess() {
    changeGitLabStatus('failed', 'ジョブが失敗しました') 
}


// --- private

def changeGitLabStatusToPending() {
    // 時間のかかるツールのビルド前にGitLabのステータスを変更するため`curl`コマンドで実施する
    def base = env.gitlabSourceRepoHomepage
    base = base.substring(0, base.lastIndexOf('/'))
    base = base.substring(0, base.lastIndexOf('/'))

    def url = "${base}/api/v4/projects/${env.GITLAB_PROJECT_ID}"
    sh """
        ${env.PROXY_SETTING}
        curl -X POST -H PRIVATE-TOKEN:${env.GITLAB_TOKEN} \
            ${url}/statuses/${env.COMMIT_HASH_END} \
            -F 'state=pending' \
            -F 'ref=${env.GITLAB_BRANCH}' \
            -F 'name=ジョブ受付'
    """
}

def changeGitLabStatus(status, description=null, coverage=null) {
    docker.image('seig/analysys-tool:latest').inside("${env.DOCKER_HOST_OPTION}") {
        sh """
            ${env.PROXY_SETTING}
            cd node-tool
            yarn run gitlab-commit-status ${status} ${description} ${coverage}
        """
    }
}

def commentToGitLab(commentFilePath) {
    docker.image('seig/analysys-tool:latest').inside("${env.DOCKER_HOST_OPTION}") {
        sh """
            ${env.PROXY_SETTING}
            cd node-tool
            yarn run gitlab-comment ${commentFilePath}
        """
    }
}

def resolveDiffFiles() {
    docker.image('seig/analysys-tool:latest').inside {
        sh """
            ${env.PROXY_SETTING}
            cd node-tool
            yarn run git-change-files \"${env.WORKSPACE}/source\" \"${env.WORKSPACE}\"
        """
    }
}

def debugEnvironment() {
    echo "GITLAB_CREDENTIAL_TOOL: ${env.GITLAB_CREDENTIAL_TOOL}"
    echo "GITLAB_TOKEN: ${env.GITLAB_TOKEN}"
    echo "GITLAB_URL: ${env.GITLAB_URL}"
    echo "GITLAB_PROJECT_ID: ${env.GITLAB_PROJECT_ID}"
    echo "GITLAB_BRANCH: ${env.GITLAB_BRANCH}"
    echo "COMMIT_HASH_BEGIN: ${env.COMMIT_HASH_BEGIN}"
    echo "COMMIT_HASH_END: ${env.COMMIT_HASH_END}"
    echo "BUILD_URL: ${env.BUILD_URL}"
    echo "DEBUG: ${env.DEBUG}"
}

def setupEnvironment() {
    withCredentials([
        usernamePassword(
            credentialsId: "${env.GITLAB_CREDENTIAL_PROJECT}",
            passwordVariable: 'API_TOKEN',
            usernameVariable: 'API_USER')]) {

        env.GITLAB_URL = env.gitlabSourceRepoHomepage
        env.GITLAB_TOKEN = API_TOKEN
        env.GITLAB_BRANCH = env.gitlabTargetBranch
        env.COMMIT_HASH_END = env.gitlabAfter
    }
}

def cloneSource() {
    dir('source') {
        git url: "${env.gitlabSourceRepoHomepage}.git",
            branch: "${env.gitlabTargetBranch}",
            credentialsId: "${env.GITLAB_CREDENTIAL_PROJECT}"
    }
}

def initTool() {
    dir('node-tool') {
        def image = docker.build('seig/analysys-tool:latest', "${env.DOCKER_BUILD_OPTION} .");
        image.inside {
            sh """
                ${env.PROXY_SETTING}
                yarn && tsc || true
            """
        }
    }
}

def resolveCommitHashBegin() {
    dir('source') {
        if  ("${env.gitLabBefore}" ==~ /^0+$/)  {
            def stdout = sh returnStdout: true, script:
                '''
                    git show-branch -a | \
                        grep \'*\' | \
                        grep -v "$(git rev-parse --abbrev-ref HEAD)" | \
                        head -1 | \
                        awk -F\'[]~^[]\' \'{print $2}\'
                '''
            env.COMMIT_HASH_BEGIN = stdout.trim()
        } else { 
            env.COMMIT_HASH_BEGIN = env.gitLabBefore;
        }
    }
}

return this
