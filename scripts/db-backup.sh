#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${ROOT}/backups"
RETENTION_DAYS="${DB_BACKUP_RETENTION_DAYS:-30}"
CONTAINER="${DB_CONTAINER:-contribution-db}"
DB_NAME="${DB_NAME:-contribution_manager}"
DB_USER="${DB_USER:-postgres}"

mkdir -p "${BACKUP_DIR}"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
FILE="${BACKUP_DIR}/${DB_NAME}-${TIMESTAMP}.sql.gz"

echo "Dumping ${DB_NAME} from container ${CONTAINER}..."
docker exec -i "${CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --format=plain --no-owner --no-privileges \
  | gzip -9 > "${FILE}"

SIZE="$(du -h "${FILE}" | cut -f1)"
echo "Saved ${FILE} (${SIZE})"

find "${BACKUP_DIR}" -name "${DB_NAME}-*.sql.gz" -type f -mtime +"${RETENTION_DAYS}" -delete
KEPT="$(find "${BACKUP_DIR}" -name "${DB_NAME}-*.sql.gz" -type f | wc -l | tr -d ' ')"
echo "Retention: kept ${KEPT} backup(s) in ${BACKUP_DIR} (<=${RETENTION_DAYS} days old)"
