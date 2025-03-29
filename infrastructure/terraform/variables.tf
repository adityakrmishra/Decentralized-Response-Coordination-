variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Deployment environment (prod/stage/dev)"
  type        = string
  default     = "prod"
}

variable "db_username" {
  description = "Database administrator username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database administrator password"
  type        = string
  sensitive   = true
}

variable "container_image" {
  description = "ECR container image for backend service"
  type        = string
  default     = "123456789012.dkr.ecr.us-west-2.amazonaws.com/disaster-response:latest"
}
