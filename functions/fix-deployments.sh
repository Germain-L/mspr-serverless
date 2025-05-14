#!/bin/bash

# Script to fix OpenFaaS deployments by adding the missing fprocess environment variable

echo "Updating OpenFaaS function deployments with missing fprocess environment variable..."

# Update each deployment 
kubectl set env deployment/hello-world -n openfaas-fn fprocess=handler
kubectl set env deployment/authenticate -n openfaas-fn fprocess=handler
kubectl set env deployment/generate-2fa -n openfaas-fn fprocess=handler
kubectl set env deployment/generate-password -n openfaas-fn fprocess=handler

echo "Waiting for deployments to restart..."
sleep 5

# Check the status of the deployments
echo "Checking deployment status:"
kubectl get deployments -n openfaas-fn

echo "Done! Your functions should now be working properly."
echo "If you still encounter issues, you may need to redeploy using:"
echo "faas-cli deploy -f stack.yaml" 