#!/usr/bin/env bash 

org_name='lextego'
prj_name='tdaly-test'
branch_name='main'

# Make an initial request to the CircleCI API to retrieve the pipeline information for the specified branch.
pip=$(curl -s -H "Circle-Token: ${CIRCLECI_PERSONAL_TOKEN}" "https://circleci.com/api/v2/project/gh/${org_name}/${prj_name}/pipeline?branch=${branch_name}")
echo "pip is : $PIP" 

# Extract the pipeline IDs and their corresponding commit revisions
pipeline_ids=$(echo $pip | jq -r '.items[] | {"id": .id, "revision": .vcs.revision}' )

echo ${pipeline_ids} | jq -c '.' | while read pip; do
 pip_id=$(echo $pip | jq -r '.id')
 pip_sha=$(echo $pip | jq -r '.revision')
 workflow=$(curl -H "Circle-Token: ${CIRCLECI_PERSONAL_TOKEN}" https://circleci.com/api/v2/pipeline/$pip_id/workflow)

 # Check if any workflow item has a status of "success" 
 result=$(echo $workflow | jq -r '.items[] | select(.status == "success")')

 # If a successful status is found, print the commit SHA and exit the loop. Otherwise, indicate that a successful status was not found.
 if [[ -n "$result" ]]; then
   echo "Successful status found. commit sha: $pip_sha"
   break
 else
   echo "Successful status not found."
 fi
done