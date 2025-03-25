# Generate a random complex password
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "azurerm_cosmosdb_account" "voice_account" {
  name                = "${local.name_prefix}-voice-${random_string.unique.result}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  identity {
    type = "SystemAssigned"
  }
  consistency_policy {
    consistency_level       = "BoundedStaleness"
    max_interval_in_seconds = 5
    max_staleness_prefix    = 100
  }

  geo_location {
    location          = azurerm_resource_group.rg.location
    failover_priority = 0
    zone_redundant    = false
  }



  is_virtual_network_filter_enabled = false
  public_network_access_enabled     = true
  analytical_storage_enabled        = false
  minimal_tls_version               = "Tls12"

  multiple_write_locations_enabled   = false
  automatic_failover_enabled         = false
  free_tier_enabled                  = false
  access_key_metadata_writes_enabled = false



  backup {
    type                = "Periodic"
    storage_redundancy  = "Geo"
    interval_in_minutes = 240
    retention_in_hours  = 8
  }
  capabilities {
    name = "EnableServerless"
  }

  capacity {
    total_throughput_limit = 4000
  }
  tags = local.default_tags

}

resource "azurerm_cosmosdb_sql_database" "voice_db" {
  name                = "VoiceDB"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.voice_account.name
}

resource "azurerm_cosmosdb_sql_container" "voice_auth_container" {
  name                = "voice_auth"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.voice_account.name
  database_name       = azurerm_cosmosdb_sql_database.voice_db.name

  partition_key_paths   = ["/id"]
  partition_key_version = 2

  # Unique key block: enforce uniqueness on the email field.
  unique_key {
    paths = ["/email"]
  }

  conflict_resolution_policy {
    mode                     = "LastWriterWins"
    conflict_resolution_path = "/_ts"
  }

  indexing_policy {
    indexing_mode = "consistent"

    # Index the email property.
    included_path {
      path = "/email/?"
    }

    # Catch-all path to index any other properties.
    included_path {
      path = "/*"
    }

    # Exclude the _etag system property.
    excluded_path {
      path = "/_etag/?"
    }
  }
}

resource "azurerm_cosmosdb_sql_container" "voice_jobs_container" {
  name                = "voice_jobs"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.voice_account.name
  database_name       = azurerm_cosmosdb_sql_database.voice_db.name

  partition_key_paths   = ["/id"]
  partition_key_version = 2

  # Unique key block: enforce uniqueness on the combination of user_id and created_at.
  unique_key {
    paths = ["/user_id", "/created_at"]
  }

  conflict_resolution_policy {
    mode                     = "LastWriterWins"
    conflict_resolution_path = "/_ts"
  }

  indexing_policy {
    indexing_mode = "consistent"

    # Index the user_id property.
    included_path {
      path = "/user_id/?"
    }

    # Index the prompt_category_id property.
    included_path {
      path = "/prompt_category_id/?"
    }

    # Index the prompt_subcategory_id property.
    included_path {
      path = "/prompt_subcategory_id/?"
    }

    # Index the status property.
    included_path {
      path = "/status/?"
    }

    # Index the created_at property.
    included_path {
      path = "/created_at/?"
    }

    # Catch-all path to index any other properties.
    included_path {
      path = "/*"
    }

    # Exclude the _etag system property.
    excluded_path {
      path = "/_etag/?"
    }
  }
}

resource "azurerm_cosmosdb_sql_container" "voice_prompts_container" {
  name                = "voice_prompts"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.voice_account.name
  database_name       = azurerm_cosmosdb_sql_database.voice_db.name

  partition_key_paths   = ["/id"]
  partition_key_version = 2

  # Unique key block: enforce uniqueness on the name field.
  unique_key {
    paths = ["/name"]
  }

  conflict_resolution_policy {
    mode                     = "LastWriterWins"
    conflict_resolution_path = "/_ts"
  }

  indexing_policy {
    indexing_mode = "consistent"

    # Index the type property (to differentiate between categories and subcategories).
    included_path {
      path = "/type/?"
    }

    # Index the category_id property (used in subcategories).
    included_path {
      path = "/category_id/?"
    }

    # Index the name property.
    included_path {
      path = "/name/?"
    }

    # Catch-all path to index any other properties.
    included_path {
      path = "/*"
    }

    # Exclude the _etag system property.
    excluded_path {
      path = "/_etag/?"
    }
  }
}



resource "azurerm_cosmosdb_sql_role_definition" "data_reader" {
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.voice_account.name
  name                = "${local.name_prefix}-voice-reader-role"
  type                = "BuiltInRole"
  assignable_scopes   = [azurerm_cosmosdb_account.voice_account.id]



  permissions {
    data_actions = ["Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/read",
      "Microsoft.DocumentDB/databaseAccounts/readMetadata",
      "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/executeQuery",
      "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/readChangeFeed",
      "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/read"
    ]
  }
}

resource "azurerm_cosmosdb_sql_role_definition" "data_contributor" {
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.voice_account.name
  name                = "${local.name_prefix}-voice-contributer-role"
  type                = "BuiltInRole"
  assignable_scopes   = [azurerm_cosmosdb_account.voice_account.id]


  permissions {
    data_actions = [
      "Microsoft.DocumentDB/databaseAccounts/readMetadata",
      "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/*",
      "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/*"
    ]
  }
}
