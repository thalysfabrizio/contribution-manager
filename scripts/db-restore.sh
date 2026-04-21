#!/usr/bin/env bash
set -euo pipefail

CONTAINER="${DB_CONTAINER:-contribution-db}"
DB_NAME="${DB_NAME:-contribution_manager}"
DB_USER="${DB_USER:-postgres}"

if [ $# -lt 1 ]; then
  echo "Uso: $0 <backup.sql.gz>" >&2
  echo "     Ex: $0 backups/contribution_manager-20260421-093000.sql.gz" >&2
  exit 1
fi

FILE="$1"
if [ ! -f "${FILE}" ]; then
  echo "Arquivo não encontrado: ${FILE}" >&2
  exit 1
fi

echo "Restore vai SOBRESCREVER o banco ${DB_NAME}."
read -p "Digite o nome do banco (${DB_NAME}) para confirmar: " CONFIRM
if [ "${CONFIRM}" != "${DB_NAME}" ]; then
  echo "Cancelado."
  exit 1
fi

echo "Recriando banco ${DB_NAME}..."
docker exec -i "${CONTAINER}" psql -U "${DB_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"
docker exec -i "${CONTAINER}" psql -U "${DB_USER}" -d postgres -c "CREATE DATABASE ${DB_NAME};"

echo "Carregando ${FILE}..."
gunzip -c "${FILE}" | docker exec -i "${CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}"

echo "Restore concluído."
