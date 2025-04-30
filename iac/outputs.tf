output "namespace" {
  description = "The Kubernetes namespace where resources are deployed"
  value       = kubernetes_namespace.mspr.metadata[0].name
}

output "postgresql_service" {
  description = "PostgreSQL service hostname"
  value       = "${helm_release.postgresql.name}-postgresql.${kubernetes_namespace.mspr.metadata[0].name}.svc.cluster.local"
}

output "postgresql_port" {
  description = "PostgreSQL service port"
  value       = "5432"
}

output "postgresql_database" {
  description = "PostgreSQL database name"
  value       = var.postgresql_database
}

output "postgresql_username" {
  description = "PostgreSQL username"
  value       = var.postgresql_username
}

output "postgresql_password" {
  description = "PostgreSQL password (sensitive)"
  value       = var.postgresql_password
  sensitive   = true
}