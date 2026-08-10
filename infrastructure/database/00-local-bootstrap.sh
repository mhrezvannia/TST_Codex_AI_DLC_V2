#!/usr/bin/env bash
set -euo pipefail

create_owner() {
  local database_name="$1"
  local owner_name="$2"
  local owner_password="$3"

  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${owner_name}') THEN
    CREATE ROLE "${owner_name}" LOGIN PASSWORD '${owner_password}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE "${database_name}" OWNER "${owner_name}"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${database_name}')\\gexec
GRANT ALL PRIVILEGES ON DATABASE "${database_name}" TO "${owner_name}";
EOSQL
}

create_owner "linercore_identity" "linercore_identity" "${IDENTITY_DB_PASSWORD:-identity_local}"
create_owner "linercore_reference_data" "linercore_reference_data" "${REFERENCE_DATA_DB_PASSWORD:-reference_data_local}"
create_owner "linercore_pricing" "linercore_pricing" "${PRICING_DB_PASSWORD:-pricing_local}"
create_owner "linercore_booking" "linercore_booking" "${BOOKING_DB_PASSWORD:-booking_local}"
create_owner "linercore_container_movement" "linercore_container_movement" "${CONTAINER_MOVEMENT_DB_PASSWORD:-container_movement_local}"
create_owner "linercore_keycloak" "linercore_keycloak" "${KEYCLOAK_DB_PASSWORD:-keycloak_local}"
create_owner "linercore_tools" "linercore_tools" "${TOOLS_DB_PASSWORD:-tools_local}"
