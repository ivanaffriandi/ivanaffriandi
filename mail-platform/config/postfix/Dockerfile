FROM alpine:3.19

RUN apk add --no-cache \
    postfix \
    postfix-pgsql \
    cyrus-sasl \
    cyrus-sasl-login \
    ca-certificates \
    rsyslog \
    bash \
    curl \
    openssl

# Generate self-signed TLS 1.3 certificate fallback for STARTTLS
RUN mkdir -p /etc/ssl/mail && \
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout /etc/ssl/mail/key.pem \
    -out /etc/ssl/mail/cert.pem \
    -subj "/CN=mail.ivanaffriandi.com" && \
    chmod 600 /etc/ssl/mail/key.pem

COPY main.cf master.cf pgsql-virtual-mailboxes.cf /etc/postfix/

EXPOSE 25 587 465

CMD ["sh", "-c", "postfix start-fg"]
