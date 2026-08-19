import email
from email.header import decode_header
from email.utils import parseaddr
import hashlib
import os
from typing import Dict, Any, List, Tuple

def decode_mime_header(header_value: str) -> str:
    """Decodes MIME encoded header strings (RFC 2047)."""
    if not header_value:
        return ""
    decoded_parts = []
    for bytes_or_str, encoding in decode_header(header_value):
        if isinstance(bytes_or_str, bytes):
            charset = encoding or "utf-8"
            try:
                decoded_parts.append(bytes_or_str.decode(charset, errors="replace"))
            except (LookupError, UnicodeDecodeError):
                decoded_parts.append(bytes_or_str.decode("utf-8", errors="replace"))
        else:
            decoded_parts.append(str(bytes_or_str))
    return "".join(decoded_parts)

def parse_raw_mime(raw_bytes: bytes) -> Dict[str, Any]:
    """Parses raw RFC 5322 MIME email payload into structured metadata and attachments."""
    msg = email.message_from_bytes(raw_bytes)

    subject = decode_mime_header(msg.get("Subject", ""))
    sender = decode_mime_header(msg.get("From", ""))
    recipient_to = decode_mime_header(msg.get("To", ""))
    recipient_cc = decode_mime_header(msg.get("Cc", ""))
    recipient_bcc = decode_mime_header(msg.get("Bcc", ""))
    message_id = msg.get("Message-ID", "")
    in_reply_to = msg.get("In-Reply-To", "")
    references = msg.get("References", "")

    body_plain = ""
    body_html = ""
    attachments: List[Dict[str, Any]] = []

    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))

            if "attachment" in content_disposition or part.get_filename():
                filename = decode_mime_header(part.get_filename() or "unnamed_attachment")
                payload_data = part.get_payload(decode=True) or b""
                checksum = hashlib.sha256(payload_data).hexdigest()
                content_id = part.get("Content-ID", "").strip("<>")

                attachments.append({
                    "filename": filename,
                    "content_type": content_type,
                    "size_bytes": len(payload_data),
                    "checksum_sha256": checksum,
                    "payload": payload_data,
                    "is_inline": "inline" in content_disposition or bool(content_id),
                    "content_id": content_id
                })
            else:
                if content_type == "text/plain" and not body_plain:
                    payload = part.get_payload(decode=True)
                    if payload:
                        body_plain = payload.decode(part.get_content_charset() or "utf-8", errors="replace")
                elif content_type == "text/html" and not body_html:
                    payload = part.get_payload(decode=True)
                    if payload:
                        body_html = payload.decode(part.get_content_charset() or "utf-8", errors="replace")
    else:
        content_type = msg.get_content_type()
        payload = msg.get_payload(decode=True) or b""
        decoded_text = payload.decode(msg.get_content_charset() or "utf-8", errors="replace")
        if content_type == "text/html":
            body_html = decoded_text
        else:
            body_plain = decoded_text

    # Parse sender display name & clean email
    real_name, clean_addr = parseaddr(sender)
    sender_name = real_name or clean_addr.split("@")[0] or "Unknown"

    # Clean text extraction for snippet (strip HTML, CSS, Scripts)
    import re
    import html as html_lib

    if body_plain and body_plain.strip():
        raw_text = body_plain.strip()
    else:
        # Strip HTML and styles
        clean = re.sub(r'<style[^>]*>.*?</style>', '', body_html or '', flags=re.DOTALL | re.IGNORECASE)
        clean = re.sub(r'<script[^>]*>.*?</script>', '', clean, flags=re.DOTALL | re.IGNORECASE)
        clean = re.sub(r'<head[^>]*>.*?</head>', '', clean, flags=re.DOTALL | re.IGNORECASE)
        clean = re.sub(r'<(br|p|div|tr)[^>]*>', ' ', clean, flags=re.IGNORECASE)
        clean = re.sub(r'<[^>]+>', ' ', clean)
        raw_text = html_lib.unescape(clean)

    snippet = ' '.join(raw_text.split())[:150].strip()

    return {
        "subject": subject,
        "sender_name": sender_name,
        "sender_address": clean_addr or sender,
        "recipient_to": recipient_to,
        "recipient_cc": recipient_cc,
        "recipient_bcc": recipient_bcc,
        "message_id_header": message_id,
        "in_reply_to_header": in_reply_to,
        "references_header": references,
        "body_plain": body_plain,
        "body_html": body_html,
        "snippet": snippet,
        "attachments": attachments
    }
