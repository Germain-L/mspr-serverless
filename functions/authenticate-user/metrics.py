"""
Prometheus metrics collection for OpenFaaS functions.
This module provides metrics for monitoring function performance and usage.
"""
from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry, generate_latest
import time

# Create a registry
registry = CollectorRegistry()

# Define metrics
REQUESTS_TOTAL = Counter(
    'function_calls_total', 
    'Total number of function calls',
    ['function_name', 'status_code'],
    registry=registry
)

REQUEST_DURATION = Histogram(
    'function_duration_seconds',
    'Duration of function calls in seconds',
    ['function_name'],
    registry=registry
)

ACTIVE_REQUESTS = Gauge(
    'function_active_requests',
    'Number of currently active requests',
    ['function_name'],
    registry=registry
)

# Authentication specific metrics
AUTH_ATTEMPTS = Counter(
    'auth_attempts_total',
    'Total number of authentication attempts',
    ['status'],
    registry=registry
)

AUTH_FAILURES = Counter(
    'auth_failures_total',
    'Total number of authentication failures',
    ['reason'],
    registry=registry
)

class MetricsMiddleware:
    """Middleware to track metrics for each function call."""
    
    def __init__(self, function_name):
        self.function_name = function_name
    
    def __call__(self, handler_func):
        def wrapper(event, context=None):
            # Increase active requests
            ACTIVE_REQUESTS.labels(function_name=self.function_name).inc()
            
            # Start timer
            start_time = time.time()
            
            try:
                # Call the original handler
                result = handler_func(event, context)
                
                # Record metrics based on the result
                status_code = result.get('statusCode', 500)
                REQUESTS_TOTAL.labels(
                    function_name=self.function_name,
                    status_code=str(status_code)
                ).inc()
                
                # Record authentication metrics
                if self.function_name == 'authenticate-user':
                    response_body = result.get('body', '{}')
                    if isinstance(response_body, str) and 'success' in response_body:
                        AUTH_ATTEMPTS.labels(status='success').inc()
                    elif isinstance(response_body, str) and 'error' in response_body:
                        AUTH_ATTEMPTS.labels(status='failure').inc()
                        
                        # Record specific failure reasons
                        if 'Invalid username or password' in response_body:
                            AUTH_FAILURES.labels(reason='invalid_credentials').inc()
                        elif 'Invalid TOTP code' in response_body:
                            AUTH_FAILURES.labels(reason='invalid_totp').inc()
                        elif 'Account has expired' in response_body:
                            AUTH_FAILURES.labels(reason='expired_account').inc()
                        else:
                            AUTH_FAILURES.labels(reason='other').inc()
                
                return result
            finally:
                # Record duration
                duration = time.time() - start_time
                REQUEST_DURATION.labels(function_name=self.function_name).observe(duration)
                
                # Decrease active requests
                ACTIVE_REQUESTS.labels(function_name=self.function_name).dec()
    
        return wrapper

def get_metrics():
    """Returns the current metrics in Prometheus format."""
    return generate_latest(registry)
