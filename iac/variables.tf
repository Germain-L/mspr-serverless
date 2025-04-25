variable "namespace" {
  type = string
}

variable "postgresql_password" {
  description = "Password for PostgreSQL admin user"
  type        = string
  sensitive   = true
}

variable "postgresql_database" {
  description = "Name of the default database to create"
  type        = string
  default     = "mspr_db"
}

variable "postgresql_username" {
  description = "Username for PostgreSQL admin user"
  type        = string
  default     = "mspr_user"
}