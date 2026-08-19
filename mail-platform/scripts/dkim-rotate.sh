#!/bin/bash
set -euo pipefail

# -----------------------------------------------------------------------------
# DKIM Key Generation and Rotation Script for ivanaffriandi.com
# -----------------------------------------------------------------------------

SELECTOR=$(date +"%Y%m")mail
KEY_DIR="config/rspamd/dkim"

mkdir -p "${KEY_DIR}"

echo "[DKIM] Generating 2048-bit RSA Private Key for selector ${SELECTOR}..."
openssl genrsa -out "${KEY_DIR}/ivanaffriandi.com.${SELECTOR}.key" 2048

echo "[DKIM] Extracting Public Key for DNS TXT Record..."
openssl rsa -in "${KEY_DIR}/ivanaffriandi.com.${SELECTOR}.key" -pubout -outform DER | openssl base64 -A > "${KEY_DIR}/ivanaffriandi.com.${SELECTOR}.pub"

PUB_KEY=$(cat "${KEY_DIR}/ivanaffriandi.com.${SELECTOR}.pub")

echo "============================================================================="
echo "Add the following TXT record to your DNS provider (e.g. Cloudflare):"
echo "============================================================================="
echo "Host / Name:  ${SELECTOR}._domainkey.ivanaffriandi.com"
echo "Record Type:  TXT"
echo "Value:        v=DKIM1; k=rsa; p=${PUB_KEY}"
echo "============================================================================="
