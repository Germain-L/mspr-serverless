import { json } from '@sveltejs/kit';

export async function GET() {
    // Basic application metrics in Prometheus format
    const metrics = [
        '# HELP nodejs_version_info Node.js version info',
        '# TYPE nodejs_version_info gauge',
        `nodejs_version_info{version="${process.version}"} 1`,
        '',
        '# HELP process_start_time_seconds Start time of the process since unix epoch in seconds',
        '# TYPE process_start_time_seconds gauge',
        `process_start_time_seconds ${Math.floor(Date.now() / 1000)}`,
        '',
        '# HELP process_uptime_seconds Process uptime in seconds',
        '# TYPE process_uptime_seconds gauge',
        `process_uptime_seconds ${process.uptime()}`,
        '',
        '# HELP process_memory_usage_bytes Process memory usage in bytes',
        '# TYPE process_memory_usage_bytes gauge',
        `process_memory_usage_bytes{type="rss"} ${process.memoryUsage().rss}`,
        `process_memory_usage_bytes{type="heapTotal"} ${process.memoryUsage().heapTotal}`,
        `process_memory_usage_bytes{type="heapUsed"} ${process.memoryUsage().heapUsed}`,
        `process_memory_usage_bytes{type="external"} ${process.memoryUsage().external}`,
        '',
        '# HELP http_requests_total Total number of HTTP requests',
        '# TYPE http_requests_total counter',
        'http_requests_total{method="GET",status="200"} 1',
        '',
        '# HELP app_health Application health status',
        '# TYPE app_health gauge',
        'app_health{service="frontend"} 1',
    ];

    return new Response(metrics.join('\n'), {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8'
        }
    });
}
