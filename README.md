# choreo-build-failure-alert-send

This action will publish an alert when a build fails.

## Example

```yaml
steps:
  - name: Send build failure alert
    uses: choreo-templates/choreo-build-failure-alert-send@v1.0.0
    with:
      workflowSteps: ${{ toJson(steps) }}
      baseURL: ${{ BASE_URL }}
      orgId: ${{ ORG_ID }}
      envId: ${{ ENV_ID }}
      componentName: ${{ COMPONENT_NAME }}
      componentVersion: ${{ COMPONENT_VERSION }}
      orgName: ${{ ORG_NAME }}
      commitId: ${{ COMMIT_ID }}
      runId: ${{ RUN_ID }}
      appId: ${{ APP_ID }}
      stsEndpoint: ${{ STS_ENDPOINT }}
      alertingClientID: ${{ ALERTING_CLIENT_ID }}
      alertingClientSecret: ${{ ALERTING_CLIENT_SECRET }}
```
