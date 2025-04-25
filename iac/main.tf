resource "kubernetes_namespace" "mspr" {
  metadata {
    name = var.namespace
  }
}

resource "helm_release" "postgresql" {
  name       = "postgresql"
  repository = "oci://registry-1.docker.io/bitnamicharts"
  chart      = "postgresql"
  version    = "16.6.6"
  namespace  = kubernetes_namespace.mspr.metadata[0].name

  set_sensitive = [
    {
      name  = "auth.postgresPassword"
      value = var.postgresql_password
    }
  ]

  set = [
    {
      name  = "auth.username"
      value = var.postgresql_username
    },
    {
      name  = "auth.database"
      value = var.postgresql_database
    },
    {
      name  = "primary.persistence.size"
      value = "10Gi"
    },
    {
      name  = "primary.resources.requests.memory"
      value = "256Mi"
    },
    {
      name  = "primary.resources.requests.cpu"
      value = "250m"
    },
    {
      name  = "primary.resources.limits.memory"
      value = "512Mi"
    },
    {
      name  = "primary.resources.limits.cpu"
      value = "500m"
    }
  ]
}