# Create the Linux App Service Plan
resource "azurerm_service_plan" "backend_appserviceplan" {
  name                = "${local.name_prefix}-echo-brief-backend-api-${random_string.unique.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "B3"
  tags                = local.default_tags
}



data "archive_file" "python_backend_webapp_package" {
  type        = "zip"
  source_dir  = "../backend_app"
  output_path = "./backend.zip"

  excludes = [
    ".vscode/**",
    ".venv/**",
    "**/__pycache__/**",
    "tests/**",
    "README.md",
    ".env.sample",
    ".env.test",
    ".env.test.sample",
  ]
}

resource "random_password" "jwt_secret_key" {
  length  = 32
  special = true
  upper   = true
  lower   = true
}


# Create the web app, pass in the App Service Plan ID
resource "azurerm_linux_web_app" "backend_webapp" {
  name                = "${local.name_prefix}-echo-brief-backend-api-${random_string.unique.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.backend_appserviceplan.id
  https_only          = true

  webdeploy_publish_basic_authentication_enabled = true
  ftp_publish_basic_authentication_enabled       = true


  site_config {
    minimum_tls_version = "1.2"
    cors {
      allowed_origins = ["*"]
    }
    application_stack {
      python_version = "3.11"
    }
    ftps_state       = "AllAllowed"
    app_command_line = local.api_command_line
  }


  app_settings = {
    AZURE_COSMOS_DB_PREFIX = "voice_"
    AZURE_COSMOS_ENDPOINT  = azurerm_cosmosdb_account.voice_account.endpoint

    AZURE_STORAGE_ACCOUNT_URL          = "https://${azurerm_storage_account.storage.name}.blob.core.windows.net"
    AZURE_STORAGE_RECORDINGS_CONTAINER = var.storage_container_name

    JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 3000
    JWT_ALGORITHM                   = "HS256"
    JWT_SECRET_KEY                  = random_password.jwt_secret_key.result



    WEBSITE_WEBDEPLOY_USE_SCM      = true
    SCM_DO_BUILD_DURING_DEPLOYMENT = true

  }

  identity {
    type = "SystemAssigned"
  }
  tags = local.default_tags

}

resource "time_sleep" "wait_before_start_backend" {
  depends_on      = [data.archive_file.python_backend_webapp_package]
  create_duration = "360s" # Adjust the time as needed
}

resource "null_resource" "publish_backend_app_zip" {
  #triggers = {always_run = "${timestamp()}"}
  provisioner "local-exec" {
    command = "az webapp deploy --subscription ${var.subscription_id} --resource-group ${azurerm_linux_web_app.backend_webapp.resource_group_name} --name ${azurerm_linux_web_app.backend_webapp.name} --src-path ${data.archive_file.python_backend_webapp_package.output_path} --type zip"
  }
  depends_on = [time_sleep.wait_before_start_backend]
}


#Storage Account Contributor
resource "azurerm_role_assignment" "storage_account_contributor" {
  depends_on           = [azurerm_linux_web_app.backend_webapp, azurerm_storage_account.storage]
  scope                = azurerm_storage_account.storage.id
  role_definition_name = "Storage Account Contributor"
  principal_id         = azurerm_linux_web_app.backend_webapp.identity[0].principal_id
}

#Storage Blob Data Contributor
resource "azurerm_role_assignment" "storage_blob_data_contributor" {
  depends_on           = [azurerm_linux_web_app.backend_webapp, azurerm_storage_account.storage]
  scope                = azurerm_storage_account.storage.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_linux_web_app.backend_webapp.identity[0].principal_id
}

#recordingcontainer
resource "azurerm_role_assignment" "recording_container_storage_contributor" {
  depends_on           = [azurerm_linux_web_app.backend_webapp, azurerm_storage_container.container]
  scope                = azurerm_storage_container.container.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_linux_web_app.backend_webapp.identity[0].principal_id
}

resource "azurerm_cosmosdb_sql_role_assignment" "data_operator" {
  name                = "736180af-7fbc-4c7f-9004-22735173c1c5" # You need to provide a UUID
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.voice_account.name

  # role_definition_id   = "${azurerm_cosmosdb_account.voice_account.id}/sqlRoleDefinitions/00000000-0000-0000-0000-000000000002"
  role_definition_id = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${azurerm_resource_group.rg.name}/providers/Microsoft.DocumentDB/databaseAccounts/${azurerm_cosmosdb_account.voice_account.name}/sqlRoleDefinitions/00000000-0000-0000-0000-000000000002"


  principal_id = azurerm_linux_web_app.backend_webapp.identity[0].principal_id
  scope        = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${azurerm_resource_group.rg.name}/providers/Microsoft.DocumentDB/databaseAccounts/${azurerm_cosmosdb_account.voice_account.name}"


}
resource "azurerm_cosmosdb_sql_role_assignment" "full_access" {
  name                = "736180af-7fbc-4c7f-9004-22735173c1c3"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.voice_account.name
  role_definition_id  = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${azurerm_resource_group.rg.name}/providers/Microsoft.DocumentDB/databaseAccounts/${azurerm_cosmosdb_account.voice_account.name}/sqlRoleDefinitions/00000000-0000-0000-0000-000000000001"

  principal_id = azurerm_linux_web_app.backend_webapp.identity[0].principal_id
  scope        = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${azurerm_resource_group.rg.name}/providers/Microsoft.DocumentDB/databaseAccounts/${azurerm_cosmosdb_account.voice_account.name}"
}


resource "azurerm_cosmosdb_sql_role_definition" "all_access_role" {
  name                = "AllAccessRole" # Give it a meaningful name
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.voice_account.name
  type                = "CustomRole"
  # Scope the role to this specific Cosmos DB account.

  # You can also reference the account via azurerm_cosmosdb_account.example.id
  assignable_scopes = [
    "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${azurerm_resource_group.rg.name}/providers/Microsoft.DocumentDB/databaseAccounts/${azurerm_cosmosdb_account.voice_account.name}"
  ]

  permissions {
    data_actions = [
      # Database level
      "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/*",
      "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/*"

    ]
  }
}

resource "azurerm_cosmosdb_sql_role_assignment" "app_role" {
  name                = "736180af-7fbc-4c7f-9003-2273517ad1c3"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.voice_account.name
  role_definition_id  = "${azurerm_cosmosdb_account.voice_account.id}/sqlRoleDefinitions/00000000-0000-0000-0000-000000000002" # Built-in Cosmos DB Built-in Data Contributor
  principal_id        = azurerm_linux_web_app.backend_webapp.identity[0].principal_id

  scope = azurerm_cosmosdb_account.voice_account.id
}


resource "azurerm_cosmosdb_sql_role_assignment" "all_access_role" {
  name                = "736180af-7fbc-4c7f-9003-22735173c1c3"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.voice_account.name

  role_definition_id = azurerm_cosmosdb_sql_role_definition.all_access_role.id
  principal_id       = azurerm_linux_web_app.backend_webapp.identity[0].principal_id
  scope              = azurerm_cosmosdb_account.voice_account.id

}
