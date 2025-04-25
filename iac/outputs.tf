output "namespace" {
  value = kubernetes_namespace.mspr.metadata[0].name
}