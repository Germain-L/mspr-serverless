output "namespace" {
  value = kubernetes_namespace.mspr.metadata[0].name
}

output "postgresql_service" {
  value = "${helm_release.postgresql.name}-postgresql.${kubernetes_namespace.mspr.metadata[0].name}.svc.cluster.local"
}

output "postgresql_port" {
  value = "5432"
}

output "postgresql_database" {
  value = var.postgresql_database
}

output "postgresql_username" {
  value = var.postgresql_username
}

output "postgresql_password" {
  value     = var.postgresql_password
  sensitive = true
}