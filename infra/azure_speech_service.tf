#Speech
resource "azurerm_cognitive_account" "SpeechServices" {
  resource_group_name           = azurerm_resource_group.rg.name
  custom_subdomain_name         = "echobrief${random_string.unique.result}"
  kind                          = "SpeechServices"
  local_auth_enabled            = true
  location                      = azurerm_resource_group.rg.location
  name                          = "echobrief${random_string.unique.result}"
  public_network_access_enabled = true


  sku_name = var.speech_sku
  tags     = local.default_tags
  identity {
    type = "SystemAssigned"
  }

  lifecycle {
    ignore_changes = [
      tags
    ]
  }

}


#Storage Account Contributor
resource "azurerm_role_assignment" "speech_service_account_contributor" {
  depends_on           = [azurerm_cognitive_account.SpeechServices, azurerm_storage_account.storage]
  scope                = azurerm_storage_account.storage.id
  role_definition_name = "Storage Account Contributor"
  principal_id         = azurerm_cognitive_account.SpeechServices.identity[0].principal_id
}

#Storage Blob Data Contributor
resource "azurerm_role_assignment" "speech_service_blob_data_contributor" {
  depends_on           = [azurerm_cognitive_account.SpeechServices, azurerm_storage_account.storage]
  scope                = azurerm_storage_account.storage.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_cognitive_account.SpeechServices.identity[0].principal_id
}

#recordingcontainer
resource "azurerm_role_assignment" "speech_container_storage_contributor" {
  depends_on           = [azurerm_cognitive_account.SpeechServices, azurerm_storage_container.container]
  scope                = azurerm_storage_container.container.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_cognitive_account.SpeechServices.identity[0].principal_id
}
