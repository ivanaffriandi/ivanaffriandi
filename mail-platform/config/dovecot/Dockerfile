FROM alpine:3.19

RUN apk add --no-cache \
    dovecot \
    dovecot-lmtpd \
    dovecot-pgsql \
    dovecot-pigeonhole-plugin \
    ca-certificates \
    bash

EXPOSE 143 993 24 12345

CMD ["dovecot", "-F"]
