#!/bin/sh


# Backwards compatibility for docker version that run NUI as root user
# Change ownership of /db if it exists
if [ -d "/db" ]; then
  chown -R nui:nui /db
fi

ARGS="--db-path=/db ${@}"

# Switch to nui user and execute with all arguments
exec su -c "/cmd/nui-web ${ARGS}" nui