const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios').default;

try {
    const baseURL = core.getInput('baseURL');
    const orgId = core.getInput('orgId');
    const envId = core.getInput('envId');
    const componentName = core.getInput('componentName');
    const componentVersion = core.getInput('componentVersion');
    const orgName = core.getInput('orgName');
    const commitId = core.getInput('commitId');
    const runId = core.getInput('runId');
    const appId = core.getInput('appId');
    const stsEndpoint = core.getInput('stsEndpoint');
    const alertingClientID = core.getInput('alertingClientID');
    const alertingClientSecret = core.getInput('alertingClientSecret');

    const ALERT_SEVERITY = "High";
    const ALERT_TYPE = "ApplicationAutoBuildFailure";
    const ALERT_PUBLISHER = "ChoreoCICD";
    const WORKFLOW_RUNNER = "github";
    const ENV_NAME = "Dev";
    const tokenEndpoint = '/oauth2/token';

    const steps = github.context.steps;
    if (!steps || Object.keys(steps).length === 0) {
        console.log("choreo-build-failure-alert-send", "No steps found");
        return;
    }

    if (isBuildFailure(steps)) {
        (async () => {
            try {
                const accessToken = await getAccessToken();
                await sendAlert(accessToken);
            } catch (error) {
                console.error('Error', error);
                console.log("choreo-build-failure-alert-send", "failed");
            }
        })();
    }

    const isBuildFailure = (steps) => {
        for (const [stepId, stepInfo] of Object.entries(steps)) {
            if (stepInfo.outcome === 'failure') {
                console.log("choreo-build-failure-alert-send", "Build failed at step: ", stepId);
                return true;
            }
        }
        console.log("choreo-build-failure-alert-send", "Build success");
        return false;
    }

    const getAccessToken = async () => {
        const tokenURL = `${stsEndpoint}${tokenEndpoint}`;    
        const client_credentials = `${alertingClientID}:${alertingClientSecret}`;
        const auth_header = `Basic ${Buffer.from(client_credentials).toString('base64')}`;

        try {
            const response = await axios.post(tokenURL, {grant_type: 'client_credentials'}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth_header
                }
            });
            const accessToken = response.data.access_token;
            return accessToken;
        } catch (error) {
            console.log("choreo-build-failure-alert-send", "failed");
            console.log("choreo-build-failure-alert-send", error.message);
        }
    }

    const sendAlert = async (accessToken) => {    
        const url = `${baseURL}/publishAlerts`;
        const payload = {
            orgId: orgId,
            envId: envId,
            publisher: ALERT_PUBLISHER,
            time: new Date().toISOString(),
            severity: ALERT_SEVERITY,
            metaData: {
              componentName: componentName,
              componentVersion: componentVersion,
              orgName: orgName,
              envName: ENV_NAME,
              commitId: commitId,
              alertType: ALERT_TYPE
            },
            properties: {
              workdlowRunner: WORKFLOW_RUNNER,
              runId: runId,
              appId: appId,
            }
        }
        console.log("Payload : ", payload);
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }

        try {
            await axios.post(url, payload, {
                headers: headers
            });
            console.log("choreo-build-failure-alert-send", "sent");
        } catch (error) {
            console.error('Error', error);
            if (error.response) {
                console.log("choreo-alert", error.response.data);
                console.log(error.response.status);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
                console.log("choreo-alert", "failed");
            }
        }
    }
} catch (e) {
    console.log("choreo-build-failure-alert-send", "failed");
    console.log("choreo-build-failure-alert-send", e.message);
}
