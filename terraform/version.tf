terraform {
  required_version = "= 1.3.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "= 4.53.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "= 2.3.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "= 2.3.0"
    }
  }
}