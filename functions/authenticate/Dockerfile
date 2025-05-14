FROM ghcr.io/openfaas/classic-watchdog:0.2.1 as watchdog

FROM golang:1.21-alpine

# Add the watchdog from the watchdog image
COPY --from=watchdog /fwatchdog /usr/bin/fwatchdog
RUN chmod +x /usr/bin/fwatchdog

# Create a non-root user
RUN addgroup -S app && adduser -S -g app app

# Set up the app directory
WORKDIR /home/app

# Copy the handler code
COPY . .

# Install dependencies
RUN apk --no-cache add ca-certificates
RUN go mod download
RUN go build -o authenticate .

# Change ownership and permissions
RUN chown -R app:app /home/app
RUN chmod +x /home/app/authenticate

USER app

# Set up watchdog
ENV fprocess="/home/app/authenticate"
ENV write_debug="true"

EXPOSE 8080

HEALTHCHECK --interval=3s CMD [ -e /tmp/.lock ] || exit 1

CMD ["fwatchdog"] 