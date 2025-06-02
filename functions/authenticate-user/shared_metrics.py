"""
Shared metrics module for OpenFaaS functions.
This module provides common Prometheus metrics for all functions.
"""
import time
from functools import wraps
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST


# Define common metrics
REQUEST_COUNT = Counter(
    'function_requests_total',
    'Total number of function requests',
    ['function_name', 'method', 'status_code']
)

REQUEST_DURATION = Histogram(
    'function_request_duration_seconds',
    'Time spent processing function requests',
    ['function_name', 'method']
)

ACTIVE_REQUESTS = Gauge(
    'function_active_requests',
    'Number of active function requests',
    ['function_name']
)

DB_OPERATIONS = Counter(
    'function_db_operations_total',
    'Total number of database operations',
    ['function_name', 'operation', 'status']
)

DB_CONNECTION_ERRORS = Counter(
    'function_db_connection_errors_total',
    'Total number of database connection errors',
    ['function_name']
)

AUTHENTICATION_ATTEMPTS = Counter(
    'function_authentication_attempts_total',
    'Total number of authentication attempts',
    ['function_name', 'result']
)

TWO_FA_OPERATIONS = Counter(
    'function_2fa_operations_total',
    'Total number of 2FA operations',
    ['function_name', 'operation', 'status']
)


def track_request_metrics(function_name):
    """Decorator to track request metrics for a function."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            method = 'POST'  # OpenFaaS functions typically use POST
            ACTIVE_REQUESTS.labels(function_name=function_name).inc()
            
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                
                # Determine status code from result
                if isinstance(result, tuple) and len(result) >= 2:
                    status_code = str(result[1])
                elif isinstance(result, dict) and 'statusCode' in result:
                    status_code = str(result['statusCode'])
                else:
                    status_code = '200'
                
                REQUEST_COUNT.labels(
                    function_name=function_name,
                    method=method,
                    status_code=status_code
                ).inc()
                
                return result
                
            except Exception as e:
                REQUEST_COUNT.labels(
                    function_name=function_name,
                    method=method,
                    status_code='500'
                ).inc()
                raise
            finally:
                duration = time.time() - start_time
                REQUEST_DURATION.labels(
                    function_name=function_name,
                    method=method
                ).observe(duration)
                ACTIVE_REQUESTS.labels(function_name=function_name).dec()
        
        return wrapper
    return decorator


def track_db_operation(function_name, operation):
    """Context manager to track database operations."""
    class DBOperationTracker:
        def __enter__(self):
            return self
        
        def __exit__(self, exc_type, exc_val, exc_tb):
            if exc_type is None:
                DB_OPERATIONS.labels(
                    function_name=function_name,
                    operation=operation,
                    status='success'
                ).inc()
            else:
                DB_OPERATIONS.labels(
                    function_name=function_name,
                    operation=operation,
                    status='error'
                ).inc()
                if 'connection' in str(exc_val).lower():
                    DB_CONNECTION_ERRORS.labels(function_name=function_name).inc()
    
    return DBOperationTracker()


def track_authentication(function_name, success):
    """Track authentication attempts."""
    result = 'success' if success else 'failure'
    AUTHENTICATION_ATTEMPTS.labels(
        function_name=function_name,
        result=result
    ).inc()


def track_2fa_operation(function_name, operation, success):
    """Track 2FA operations."""
    status = 'success' if success else 'failure'
    TWO_FA_OPERATIONS.labels(
        function_name=function_name,
        operation=operation,
        status=status
    ).inc()


def get_metrics():
    """Return Prometheus metrics in the expected format."""
    return generate_latest()


def get_metrics_content_type():
    """Return the content type for Prometheus metrics."""
    return CONTENT_TYPE_LATEST
