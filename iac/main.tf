resource "kubernetes_namespace" "mspr" {
  metadata {
    name = "${var.namespace}"
  }
}