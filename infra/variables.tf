# Variables
variable "subscription_id" {
  description = "The Azure subscription ID"
  type        = string
}

# Random string
resource "random_string" "unique" {
  length  = 4
  special = false
  upper   = false
}

# Variables
variable "prefix" {
  default = "tf-"
}

variable "is_windows" {
  type        = bool
  default     = true
  description = "Operating system type (windows/linux/mac)"

}

variable "openai_api_version" {
  description = "Specifies the API version of the Azure OpenAI Service"
  type        = string
  default     = "2024-10-21"

}

variable "name" {
  default = "echo-brief"
}

## This could be replaced with terraform workspaces
variable "environment" {
  default = "dev"
}
variable "storage_container_name" {
  default = "recordingcontainer"

}

variable "resource_group_name" {
  default = "accelerator-rg"
}

variable "location" {
  default = "uksouth"
}


variable "custom_domain" {
  default = "echo-brief"
}

variable "openai_service_name" {
  default = "az-openai-service"
}

variable "public_network_access_enabled" {
  default = true
}

variable "openai_sku" {
  default = "S0"
}

variable "speech_sku" {
  default = "S0"
}


variable "openai_location" {
  default = "swedencentral"
}

variable "voice_location" {
  default = "northeurope"
}

variable "log_analytics_sku" {
  default = "PerGB2018"
}

variable "log_analytics_workspace_name" {
  description = "Specifies the name of the log analytics workspace"
  default     = "Workspace"
  type        = string
}

variable "log_analytics_retention_days" {
  description = "Specifies the number of days of the retention policy"
  type        = number
  default     = 30
}
variable "static_web_location" {
  default = "westeurope"

}
