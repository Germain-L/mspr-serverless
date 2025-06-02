#!/bin/bash

# Test monitoring endpoints after deployment
echo "🧪 Testing monitoring endpoints..."

NAMESPACE="cofrap"

# Wait for pods to be ready
echo "⏳ Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=frontend -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=postgresql -n $NAMESPACE --timeout=300s

# Test frontend metrics endpoint
echo "📊 Testing frontend metrics endpoint..."
FRONTEND_POD=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/component=frontend -o jsonpath='{.items[0].metadata.name}')
if [ -n "$FRONTEND_POD" ]; then
    echo "Testing metrics endpoint in pod: $FRONTEND_POD"
    kubectl exec -n $NAMESPACE $FRONTEND_POD -- curl -s http://localhost:3000/metrics | head -10
    if [ $? -eq 0 ]; then
        echo "✅ Frontend metrics endpoint is working"
    else
        echo "❌ Frontend metrics endpoint failed"
    fi
else
    echo "❌ Frontend pod not found"
fi

# Test PostgreSQL exporter
echo "🐘 Testing PostgreSQL exporter..."
POSTGRES_POD=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/component=postgresql -o jsonpath='{.items[0].metadata.name}')
if [ -n "$POSTGRES_POD" ]; then
    echo "Testing PostgreSQL exporter in pod: $POSTGRES_POD"
    kubectl exec -n $NAMESPACE $POSTGRES_POD -c postgres-exporter -- curl -s http://localhost:9187/metrics | head -5
    if [ $? -eq 0 ]; then
        echo "✅ PostgreSQL exporter is working"
    else
        echo "❌ PostgreSQL exporter failed"
    fi
else
    echo "❌ PostgreSQL pod not found"
fi

# Check ServiceMonitor
echo "🔍 Checking ServiceMonitor..."
kubectl get servicemonitor -n monitoring | grep mspr-serverless
if [ $? -eq 0 ]; then
    echo "✅ ServiceMonitor found"
else
    echo "❌ ServiceMonitor not found"
fi

# Check PrometheusRule
echo "📋 Checking PrometheusRule..."
kubectl get prometheusrule -n monitoring | grep mspr-serverless
if [ $? -eq 0 ]; then
    echo "✅ PrometheusRule found"
else
    echo "❌ PrometheusRule not found"
fi

echo "🎉 Monitoring test completed!"
