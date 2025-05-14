FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY . .

# Use go modules
ENV GO111MODULE=on

RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o generate-2fa .

FROM alpine:3.18

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=builder /app/generate-2fa /app/generate-2fa
RUN chmod +x /app/generate-2fa

# Add non root user
RUN addgroup -S app && adduser -S -g app app
RUN chown -R app /app

USER app

EXPOSE 8080

CMD ["/app/generate-2fa"] 