import base64
import httpx
import aiosmtplib
from email.message import EmailMessage
from email.utils import make_msgid
from typing import List, Optional
from app.core.config import settings

async def send_outbound_email(
    sender: str,
    recipients: List[str],
    subject: str,
    body_html: str,
    body_plain: Optional[str] = None,
    cc: Optional[List[str]] = None,
    bcc: Optional[List[str]] = None,
    in_reply_to: Optional[str] = None,
    attachments: Optional[List[dict]] = None,
) -> str:
    """
    Sends outbound email.
    Supports attachments on Resend HTTPS API, SMTP Relay, and Postfix.
    """
    generated_msg_id = make_msgid(domain=settings.PRIMARY_DOMAIN)

    # 1. Resend API Outbound Relay
    if settings.RESEND_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resend_payload = {
                    "from": f"Ivan Affriandi <{sender}>",
                    "to": recipients,
                    "subject": subject,
                    "html": body_html,
                    "text": body_plain or "",
                }
                if cc:
                    resend_payload["cc"] = cc
                if bcc:
                    resend_payload["bcc"] = bcc
                if attachments:
                    resend_payload["attachments"] = [
                        {"filename": a["filename"], "content": a["data_base64"]}
                        for a in attachments
                    ]

                response = await client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json=resend_payload
                )

                if response.status_code in (200, 201):
                    res_data = response.json()
                    print(f"[Resend Relay Success] Sent via Resend API: {res_data.get('id')}")
                    return res_data.get("id") or generated_msg_id
                else:
                    print(f"[Resend Relay Error] {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[Resend Relay Exception] {e}")

    # 2. Generic Port 587 SMTP Relay (Brevo, Resend SMTP, SendGrid, Mailgun, etc.)
    if settings.SMTP_RELAY_HOST:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = f"Ivan Affriandi <{sender}>"
        msg["To"] = ", ".join(recipients)

        if cc:
            msg["Cc"] = ", ".join(cc)

        msg["Message-ID"] = generated_msg_id

        if in_reply_to:
            msg["In-Reply-To"] = in_reply_to
            msg["References"] = in_reply_to

        if body_plain:
            msg.set_content(body_plain)
            if body_html:
                msg.add_alternative(body_html, subtype="html")
        else:
            msg.set_content(body_html, subtype="html")

        if attachments:
            for att in attachments:
                raw_data = base64.b64decode(att["data_base64"])
                c_type = att.get("content_type", "application/octet-stream")
                maintype, subtype = c_type.split("/", 1) if "/" in c_type else ("application", "octet-stream")
                msg.add_attachment(raw_data, maintype=maintype, subtype=subtype, filename=att["filename"])

        all_recipients = recipients + (cc or []) + (bcc or [])

        try:
            smtp = aiosmtplib.SMTP(
                hostname=settings.SMTP_RELAY_HOST,
                port=settings.SMTP_RELAY_PORT,
                start_tls=settings.SMTP_RELAY_STARTTLS
            )
            await smtp.connect()
            if settings.SMTP_RELAY_USER and settings.SMTP_RELAY_PASS:
                await smtp.login(settings.SMTP_RELAY_USER, settings.SMTP_RELAY_PASS)
            await smtp.send_message(msg, sender=sender, recipients=all_recipients)
            await smtp.quit()
            print(f"[SMTP Relay 587 Success] Message sent via {settings.SMTP_RELAY_HOST}: {generated_msg_id}")
            return generated_msg_id
        except Exception as e:
            print(f"[SMTP Relay 587 Error] Failed to send via relay {settings.SMTP_RELAY_HOST}: {e}")

    # 3. Local Postfix Daemon Outbound Fallback
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"Ivan Affriandi <{sender}>"
    msg["To"] = ", ".join(recipients)

    if cc:
        msg["Cc"] = ", ".join(cc)

    msg["Message-ID"] = generated_msg_id

    if in_reply_to:
        msg["In-Reply-To"] = in_reply_to
        msg["References"] = in_reply_to

    if body_plain:
        msg.set_content(body_plain)
        if body_html:
            msg.add_alternative(body_html, subtype="html")
    else:
        msg.set_content(body_html, subtype="html")

    if attachments:
        for att in attachments:
            raw_data = base64.b64decode(att["data_base64"])
            c_type = att.get("content_type", "application/octet-stream")
            maintype, subtype = c_type.split("/", 1) if "/" in c_type else ("application", "octet-stream")
            msg.add_attachment(raw_data, maintype=maintype, subtype=subtype, filename=att["filename"])

    all_recipients = recipients + (cc or []) + (bcc or [])

    try:
        smtp = aiosmtplib.SMTP(hostname=settings.POSTFIX_HOST, port=settings.POSTFIX_SMTP_PORT, start_tls=False)
        await smtp.connect()
        await smtp.send_message(msg, sender=sender, recipients=all_recipients)
        await smtp.quit()
        print(f"[Postfix Outbound Success] Message queued: {generated_msg_id}")
    except Exception as e:
        print(f"[SMTP Outbound Warning] Failed to connect to Postfix daemon: {e}")

    return generated_msg_id
