terraform {
  backend "azurerm" {
    resource_group_name  = "terraform"
    storage_account_name = "terraformb270" #replace with the name of your storage account
    container_name       = "tfstate"
    key                  = "echo-brief.tfstate"
    # use_azuread_auth     = true
  }
}
