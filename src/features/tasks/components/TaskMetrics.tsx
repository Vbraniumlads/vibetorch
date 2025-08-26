import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Clock, Activity, CheckCircle, XCircle, Timer } from 'lucide-react';

interface TaskMetricsProps {
  metrics: Record<string, number>;
  isLoading?: boolean;
}

export function TaskMetrics({ metrics, isLoading = false }: TaskMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-20" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Queued Tasks',
      value: metrics.queued || 0,
      icon: Clock,
      description: 'Tasks waiting to be processed',
      color: 'text-blue-600'
    },
    {
      title: 'Running Tasks',
      value: metrics.running || 0,
      icon: Activity,
      description: 'Tasks currently being processed',
      color: 'text-orange-600'
    },
    {
      title: 'Succeeded Today',
      value: metrics.succeeded_today || 0,
      icon: CheckCircle,
      description: 'Tasks completed successfully today',
      color: 'text-green-600'
    },
    {
      title: 'Failed Today',
      value: metrics.failed_today || 0,
      icon: XCircle,
      description: 'Tasks that failed today',
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Average Runtime Card */}
      {metrics.avg_runtime_minutes !== undefined && (
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Timer className="h-4 w-4 text-purple-600" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">
                  {metrics.avg_runtime_minutes ? 
                    `${metrics.avg_runtime_minutes.toFixed(1)} min` : 
                    'No data'
                  }
                </div>
                <p className="text-xs text-muted-foreground">Average runtime</p>
              </div>
              <div className="flex gap-2">
                {metrics.succeeded_today > 0 && metrics.failed_today >= 0 && (
                  <Badge variant="outline">
                    Success Rate: {
                      metrics.succeeded_today + metrics.failed_today > 0 ? 
                        Math.round((metrics.succeeded_today / (metrics.succeeded_today + metrics.failed_today)) * 100) : 
                        0
                    }%
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}