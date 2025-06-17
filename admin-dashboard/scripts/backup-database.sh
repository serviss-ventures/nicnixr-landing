#!/bin/bash

# NixR Database Backup Script
# This script creates automated backups of the Supabase database
# Run via cron for daily backups: 0 2 * * * /path/to/backup-database.sh

# Configuration
BACKUP_DIR="/var/backups/nixr"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="nixr_backup_${TIMESTAMP}"

# Database credentials (use environment variables for security)
DB_HOST="${SUPABASE_DB_HOST:-db.ymvrcfltcvmhytdcsrxv.supabase.co}"
DB_PORT="${SUPABASE_DB_PORT:-5432}"
DB_NAME="${SUPABASE_DB_NAME:-postgres}"
DB_USER="${SUPABASE_DB_USER:-postgres}"
DB_PASS="${SUPABASE_DB_PASS}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo -e "${GREEN}Starting NixR database backup...${NC}"
echo "Timestamp: ${TIMESTAMP}"

# Perform the backup
export PGPASSWORD="${DB_PASS}"
pg_dump -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        -f "${BACKUP_DIR}/${BACKUP_NAME}.sql" \
        --verbose \
        --no-owner \
        --no-privileges

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backup completed successfully${NC}"
    
    # Compress the backup
    gzip "${BACKUP_DIR}/${BACKUP_NAME}.sql"
    echo -e "${GREEN}Backup compressed: ${BACKUP_NAME}.sql.gz${NC}"
    
    # Calculate backup size
    BACKUP_SIZE=$(ls -lh "${BACKUP_DIR}/${BACKUP_NAME}.sql.gz" | awk '{print $5}')
    echo "Backup size: ${BACKUP_SIZE}"
    
    # Upload to cloud storage (optional)
    # aws s3 cp "${BACKUP_DIR}/${BACKUP_NAME}.sql.gz" s3://nixr-backups/database/
    
    # Clean up old backups
    echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
    find "${BACKUP_DIR}" -name "nixr_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
    
    # Log success
    echo "${TIMESTAMP}: Backup successful - ${BACKUP_NAME}.sql.gz (${BACKUP_SIZE})" >> "${BACKUP_DIR}/backup.log"
else
    echo -e "${RED}Backup failed!${NC}"
    echo "${TIMESTAMP}: Backup failed" >> "${BACKUP_DIR}/backup.log"
    exit 1
fi

# List recent backups
echo -e "\n${GREEN}Recent backups:${NC}"
ls -lht "${BACKUP_DIR}"/nixr_backup_*.sql.gz | head -5

echo -e "\n${GREEN}Backup process completed${NC}" 