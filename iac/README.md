# MSPR Serverless IaC

This directory contains the Terraform configuration to provision and manage the Kubernetes resources for the MSPR Serverless project.

## Prerequisites

- Terraform (version >= 1.0)
- kubectl installed and configured (~/.kube/config)
- Access to a Kubernetes cluster

## Setup

1. Review and set variables in `terraform.tfvars`:
   - `namespace`: the Kubernetes namespace to create (default: "mspr")
2. (Optional) Customize the Kubernetes provider configuration in `providers.tf` if your kubeconfig is in a non-default location.

## Usage

- Initialize Terraform:
  ```bash
  terraform init
  ```
- Review the plan:
  ```bash
  terraform plan
  ```
- Apply the configuration:
  ```bash
  terraform apply
  ```
- Destroy the resources:
  ```bash
  terraform destroy
  ```

## File Structure

- `providers.tf`: Terraform and Kubernetes provider configuration
- `variables.tf`: Definition of input variables
- `terraform.tfvars`: Values for input variables
- `main.tf`: Resource definitions (namespace, roles, etc.)
- `outputs.tf`: Output values after apply
- `.terraform.lock.hcl`: Provider dependency lock file
- `.gitignore`: Ignored files

## Outputs

After applying, Terraform outputs the defined values from `outputs.tf`.