FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY . .

# Use go modules
ENV GO111MODULE=on

RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -a -installsuffix cgo -o generate-2fa .

FROM ghcr.io/openfaas/classic-watchdog:0.2.1 as watchdog

FROM alpine:3.18

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=builder /app/generate-2fa /app/generate-2fa
COPY --from=watchdog /fwatchdog /usr/bin/fwatchdog
RUN chmod +x /app/generate-2fa
RUN chmod +x /usr/bin/fwatchdog

# Add non root user
RUN addgroup -S app && adduser -S -g app app
RUN chown -R app /app

USER app

# Set process to run
ENV fprocess="/app/generate-2fa"
ENV write_debug="true"

EXPOSE 8080

HEALTHCHECK --interval=3s CMD [ -e /tmp/.lock ] || exit 1

CMD ["fwatchdog"] 