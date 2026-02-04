#!/bin/sh


# Backwards compatibility for docker version that run NUI as root user
# Change ownership of /db if it exists
if [ ! -d "/db" ]; then
  mkdir -p /db
fi
chown -R nui:nui /db

ARGS="--db-path=/db --proto-schemas-path=/protoschemas/default {@}"

# Check if the current user UID is 1001 to support running as a different as non-root user
# also the entrypoint
if [ "$(id -u)" -eq 1001 ]; then
  # Start the process directly
  exec /cmd/nui-web ${ARGS}
else
  # Switch to nui user and execute with all arguments
  exec su -c "/cmd/nui-web ${ARGS}" nui
fi