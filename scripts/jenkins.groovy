// --- public
def init() {
    buildDockerImage()
    setupEnvironment()
    resolveProjectId()
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

def getGitLabApiEndPoint() {
    def url = env.gitlabSourceRepoHomepage
    url = url.substring(0, url.lastIndexOf('/'))
    url = url.substring(0, url.lastIndexOf('/'))
    return "${url}/api/v4"
}

def changeGitLabStatusToPending() {
    // 時間のかかるツールのビルド前にGitLabのステータスを変更するため`curl`コマンドで実施する
    sh """
        ${env.PROXY_SETTING}
        curl -X POST -H PRIVATE-TOKEN:${env.GITLAB_TOKEN} \
            ${getGitLabApiEndPoint()}/projects/${env.GITLAB_PROJECT_ID}/statuses/${env.COMMIT_HASH_END} \
            -F 'state=pending' \
            -F 'ref=${env.GITLAB_BRANCH}' \
            -F 'name=jenkins' \
            -F 'target_url=${env.BUILD_URL}' \
            -F 'description=ジョブを受け付けました'
    """
}

def changeGitLabStatus(status, description=null, coverage=null) {
    docker.image('seig/analysis-tool:latest').inside("${env.DOCKER_RUN_OPTION}") {
        sh """
            ${env.PROXY_SETTING}
            cd node-tool
            yarn run gitlab-commit-status ${status} ${description} ${coverage}
        """
    }
}

def commentToGitLab(commentFilePath) {
    docker.image('seig/analysis-tool:latest').inside("${env.DOCKER_RUN_OPTION}") {
        sh """
            ${env.PROXY_SETTING}
            cd node-tool
            yarn run gitlab-comment ${commentFilePath}
        """
    }
}

def resolveDiffFiles() {
    docker.image('seig/analysis-tool:latest').inside {
        sh """
            ${env.PROXY_SETTING}
            cd node-tool
            yarn run git-change-files \"${env.WORKSPACE}/source\" \"${env.WORKSPACE}\"
        """
    }
}

def debugEnvironment() {
    echo "DEBUG: ${env.DEBUG}"
    if (env.DEBUG == 'true') {
        echo "GITLAB_CREDENTIAL_TOOL: ${env.GITLAB_CREDENTIAL_TOOL}"
        echo "GITLAB_TOKEN: ${env.GITLAB_TOKEN}"
        echo "GITLAB_URL: ${env.GITLAB_URL}"
        echo "GITLAB_PROJECT_ID: ${env.GITLAB_PROJECT_ID}"
        echo "GITLAB_BRANCH: ${env.GITLAB_BRANCH}"
        echo "COMMIT_HASH_BEGIN: ${env.COMMIT_HASH_BEGIN}"
        echo "COMMIT_HASH_END: ${env.COMMIT_HASH_END}"
        echo "BUILD_URL: ${env.BUILD_URL}"
    }
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

def buildDockerImage() {
    dir('node-tool') {
        docker.build('seig/analysis-tool:latest', "${env.DOCKER_BUILD_OPTION} .")
    }
}

def initTool() {
    dir('node-tool') {
        docker.image('seig/analysis-tool:latest').inside("${env.DOCKER_RUN_OPTION}") {
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
            env.COMMIT_HASH_BEGIN = env.gitLabBefore
        }
    }
}

def resolveProjectId() {
    dir('source') {
        docker.image('seig/analysis-tool:latest').inside {
            def project_name= "${env.gitlabSourceNamespace}/${env.gitlabSourceRepoName}"
            def stdout = sh returnStdout: true, script: 
            """
                ${env.PROXY_SETTING}
                curl -H PRIVATE-TOKEN:${env.GITLAB_TOKEN} \
                    ${getGitLabApiEndPoint()}/projects?simple=true \
                    | jq 'map(select(.["path_with_namespace"] == \"${project_name}\")) | .[].id'
            """
            env.GITLAB_PROJECT_ID = stdout.trim()
        }
    }
}

return this
