FROM ghcr.io/openfaas/of-watchdog:0.9.11 as watchdog

FROM golang:1.24-alpine as builder

WORKDIR /go/src/handler
COPY . .

# Use go modules
ENV GO111MODULE=on

RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o handler .

FROM alpine:3.18

RUN apk --no-cache add ca-certificates file

COPY --from=watchdog /fwatchdog /usr/bin/fwatchdog
RUN chmod +x /usr/bin/fwatchdog && ls -la /usr/bin/fwatchdog

COPY --from=builder /go/src/handler/handler /usr/bin/handler
RUN chmod +x /usr/bin/handler && \
    ls -la /usr/bin/handler && \
    file /usr/bin/handler && \
    echo "Handler exists and is executable"

# Add non root user
RUN addgroup -S app && adduser -S -g app app
RUN chown -R app /home/app

WORKDIR /home/app

USER app

# Set up OpenFaaS watchdog mode
ENV mode="http"
ENV upstream_url="http://127.0.0.1:8080"

# Define how the function is executed
ENV fprocess="handler"

# Set to true to see request in function logs
ENV write_debug="true"

EXPOSE 8080

HEALTHCHECK --interval=5s CMD [ -e /tmp/.lock ] || exit 1

CMD ["fwatchdog"] 