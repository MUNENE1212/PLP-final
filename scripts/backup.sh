#!/bin/bash

# =============================================================================
# Dumuwaks Backup Script
# =============================================================================
# This script handles automated backups for Dumuwaks, including:
# - Database backups (MongoDB)
# - Application configuration
# - User uploads
# - Environment files
#
# Usage:
#   ./scripts/backup.sh [options]
#
# Options:
#   -t, --type        Backup type: full, db, config, uploads (default: full)
#   -o, --output      Output directory (default: /var/backups/dumuwaks)
#   -u, --upload      Upload to cloud storage (requires rclone or aws cli)
#   -r, --retention   Retention days (default: 30)
#   -h, --help        Show this help message
#
# Cron example (daily backup at 2 AM):
#   0 2 * * * /var/www/dumuwaks/scripts/backup.sh -u >> /var/log/dumuwaks-backup.log 2>&1
#
# Exit codes:
#   0 - Success
#   1 - General error
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/dumuwaks}"
BACKUP_PATH="${BACKUP_PATH:-/var/backups/dumuwaks}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_DIR=$(date +%Y/%m)
BACKUP_TYPE="full"
UPLOAD_TO_CLOUD=false
RETENTION_DAYS=30

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -t|--type)
      BACKUP_TYPE="$2"
      shift 2
      ;;
    -o|--output)
      BACKUP_PATH="$2"
      shift 2
      ;;
    -u|--upload)
      UPLOAD_TO_CLOUD=true
      shift
      ;;
    -r|--retention)
      RETENTION_DAYS="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  -t, --type        Backup type: full, db, config, uploads"
      echo "  -o, --output      Output directory"
      echo "  -u, --upload      Upload to cloud storage"
      echo "  -r, --retention   Retention days (default: 30)"
      echo "  -h, --help        Show this help message"
      echo ""
      echo "Cron example:"
      echo "  0 2 * * * /var/www/dumuwaks/scripts/backup.sh -u"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Helper functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Load environment variables
if [ -f "${DEPLOY_PATH}/shared/.env" ]; then
  set -a
  source "${DEPLOY_PATH}/shared/.env"
  set +a
fi

# Create backup directories
BACKUP_DIR="${BACKUP_PATH}/${DATE_DIR}"
mkdir -p "${BACKUP_DIR}"

BACKUP_FILE="${BACKUP_DIR}/dumuwaks_${BACKUP_TYPE}_${TIMESTAMP}"
BACKUP_LOG="${BACKUP_PATH}/backup.log"

# Start backup
echo ""
echo "=========================================="
echo -e "${BLUE}Dumuwaks Backup Script${NC}"
echo "=========================================="
echo "Type: $BACKUP_TYPE"
echo "Timestamp: $TIMESTAMP"
echo "Output: $BACKUP_DIR"
echo "Upload: $UPLOAD_TO_CLOUD"
echo "=========================================="
echo ""

log_info "Starting ${BACKUP_TYPE} backup..."

# Track backup size
TOTAL_SIZE=0

# ========================================
# Database Backup
# ========================================
backup_database() {
  log_info "Backing up MongoDB database..."

  if [ -z "$MONGODB_URI" ]; then
    log_warning "MONGODB_URI not set, skipping database backup"
    return 0
  fi

  DB_BACKUP_FILE="${BACKUP_FILE}_db"

  # Use mongodump to create backup
  if command -v mongodump &> /dev/null; then
    mongodump --uri="$MONGODB_URI" --out="${DB_BACKUP_FILE}_tmp" --quiet

    # Compress the backup
    tar -czf "${DB_BACKUP_FILE}.tar.gz" -C "${DB_BACKUP_FILE}_tmp" .

    # Cleanup temp directory
    rm -rf "${DB_BACKUP_FILE}_tmp"

    BACKUP_SIZE=$(du -b "${DB_BACKUP_FILE}.tar.gz" | cut -f1)
    TOTAL_SIZE=$((TOTAL_SIZE + BACKUP_SIZE))

    log_success "Database backup created: ${DB_BACKUP_FILE}.tar.gz ($(numfmt --to=iec $BACKUP_SIZE))"
  else
    log_warning "mongodump not found, skipping database backup"
  fi
}

# ========================================
# Configuration Backup
# ========================================
backup_config() {
  log_info "Backing up configuration files..."

  CONFIG_BACKUP_FILE="${BACKUP_FILE}_config.tar.gz"

  # Create temp directory for config files
  CONFIG_TMP=$(mktemp -d)

  # Copy configuration files
  mkdir -p "${CONFIG_TMP}/config"

  # Environment files
  if [ -f "${DEPLOY_PATH}/shared/.env" ]; then
    cp "${DEPLOY_PATH}/shared/.env" "${CONFIG_TMP}/config/"
  fi

  if [ -f "${DEPLOY_PATH}/shared/.env.frontend" ]; then
    cp "${DEPLOY_PATH}/shared/.env.frontend" "${CONFIG_TMP}/config/"
  fi

  # PM2 configuration
  if [ -f "${DEPLOY_PATH}/current/ecosystem.config.js" ]; then
    cp "${DEPLOY_PATH}/current/ecosystem.config.js" "${CONFIG_TMP}/config/"
  fi

  # Nginx configuration
  if [ -f "/etc/nginx/sites-available/dumuwaks" ]; then
    cp "/etc/nginx/sites-available/dumuwaks" "${CONFIG_TMP}/config/nginx.conf"
  fi

  # SSL certificate paths (don't copy the actual certs, just paths)
  echo "# SSL Certificates are managed by certbot" > "${CONFIG_TMP}/config/ssl-info.txt"
  certbot certificates 2>/dev/null >> "${CONFIG_TMP}/config/ssl-info.txt" || true

  # Create archive
  tar -czf "$CONFIG_BACKUP_FILE" -C "$CONFIG_TMP" .

  # Cleanup
  rm -rf "$CONFIG_TMP"

  BACKUP_SIZE=$(du -b "$CONFIG_BACKUP_FILE" | cut -f1)
  TOTAL_SIZE=$((TOTAL_SIZE + BACKUP_SIZE))

  log_success "Configuration backup created: ${CONFIG_BACKUP_FILE} ($(numfmt --to=iec $BACKUP_SIZE))"
}

# ========================================
# Uploads Backup
# ========================================
backup_uploads() {
  log_info "Backing up user uploads..."

  UPLOADS_DIR="${DEPLOY_PATH}/shared/uploads"
  UPLOADS_BACKUP_FILE="${BACKUP_FILE}_uploads.tar.gz"

  if [ -d "$UPLOADS_DIR" ] && [ "$(ls -A $UPLOADS_DIR 2>/dev/null)" ]; then
    tar -czf "$UPLOADS_BACKUP_FILE" -C "${DEPLOY_PATH}/shared" uploads

    BACKUP_SIZE=$(du -b "$UPLOADS_BACKUP_FILE" | cut -f1)
    TOTAL_SIZE=$((TOTAL_SIZE + BACKUP_SIZE))

    log_success "Uploads backup created: ${UPLOADS_BACKUP_FILE} ($(numfmt --to=iec $BACKUP_SIZE))"
  else
    log_warning "No uploads to backup"
  fi
}

# ========================================
# Cloud Upload
# ========================================
upload_to_cloud() {
  log_info "Uploading backup to cloud storage..."

  # Check for rclone
  if command -v rclone &> /dev/null; then
    # Assuming you have configured rclone with a remote called "backup"
    if rclone listremotes | grep -q "backup:"; then
      rclone copy "${BACKUP_DIR}" "backup:dumuwaks-backups/${DATE_DIR}" --progress
      log_success "Backup uploaded to cloud via rclone"
      return 0
    else
      log_warning "rclone remote 'backup' not configured"
    fi
  fi

  # Check for AWS CLI
  if command -v aws &> /dev/null; then
    if [ -n "$AWS_S3_BUCKET" ]; then
      aws s3 sync "${BACKUP_DIR}" "s3://${AWS_S3_BUCKET}/dumuwaks-backups/${DATE_DIR}/" --storage-class STANDARD_IA
      log_success "Backup uploaded to S3"
      return 0
    else
      log_warning "AWS_S3_BUCKET not set"
    fi
  fi

  # Check for Backblaze B2
  if command -v b2 &> /dev/null; then
    if [ -n "$B2_BUCKET" ]; then
      b2 upload-file "$B2_BUCKET" "${BACKUP_FILE}*" "dumuwaks-backups/${DATE_DIR}/"
      log_success "Backup uploaded to Backblaze B2"
      return 0
    fi
  fi

  log_warning "No cloud storage configured. Install rclone, aws-cli, or b2 and configure credentials."
}

# ========================================
# Cleanup Old Backups
# ========================================
cleanup_old_backups() {
  log_info "Cleaning up backups older than ${RETENTION_DAYS} days..."

  # Find and delete old backups
  DELETED_COUNT=$(find "${BACKUP_PATH}" -name "dumuwaks_*.tar.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)

  if [ "$DELETED_COUNT" -gt 0 ]; then
    log_info "Deleted ${DELETED_COUNT} old backup(s)"
  else
    log_info "No old backups to delete"
  fi

  # Also clean empty directories
  find "${BACKUP_PATH}" -type d -empty -delete 2>/dev/null || true
}

# ========================================
# Execute Backup Based on Type
# ========================================
case "$BACKUP_TYPE" in
  full)
    backup_database
    backup_config
    backup_uploads
    ;;
  db)
    backup_database
    ;;
  config)
    backup_config
    ;;
  uploads)
    backup_uploads
    ;;
  *)
    log_error "Unknown backup type: $BACKUP_TYPE"
    exit 1
    ;;
esac

# ========================================
# Cloud Upload
# ========================================
if [ "$UPLOAD_TO_CLOUD" = true ]; then
  upload_to_cloud
fi

# ========================================
# Cleanup
# ========================================
cleanup_old_backups

# ========================================
# Summary
# ========================================
echo ""
echo "=========================================="
log_success "Backup completed successfully!"
echo "=========================================="
echo ""
echo "Backup Type: $BACKUP_TYPE"
echo "Backup Path: $BACKUP_DIR"
echo "Total Size: $(numfmt --to=iec $TOTAL_SIZE)"
echo "Retention: ${RETENTION_DAYS} days"
echo ""

# Log to backup log
echo "${TIMESTAMP} - ${BACKUP_TYPE} backup completed - $(numfmt --to=iec $TOTAL_SIZE)" >> "${BACKUP_PATH}/backup.log"

exit 0
