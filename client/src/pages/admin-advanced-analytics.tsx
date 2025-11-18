import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Activity, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EngagementScore {
  clientId: string;
  clientName: string;
  clientEmail: string;
  overallScore: number;
  activityScore: number;
  sessionScore: number;
  workoutScore: number;
  videoScore: number;
  achievementScore: number;
  churnRisk: 'low' | 'medium' | 'high';
  lastActivity: string | null;
  daysSinceLastActivity: number;
  computedAt: string;
  insights: string[];
}

interface AnalyticsReport {
  totalClients: number;
  activeClients: number;
  atRiskClients: number;
  topEngagedClients: EngagementScore[];
  lowEngagedClients: EngagementScore[];
  churnRiskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  averageEngagementScore: number;
  generatedAt: string;
}

export default function AdminAdvancedAnalytics() {
  const [selectedClient, setSelectedClient] = useState<EngagementScore | null>(null);

  const { data: report, isLoading, refetch } = useQuery<AnalyticsReport>({
    queryKey: ['/api/admin/analytics/engagement-report'],
    refetchInterval: false,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/admin/analytics/refresh-engagement', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics/engagement-report'] });
      refetch();
    },
  });

  const getChurnBadgeVariant = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'high':
        return 'destructive';
    }
  };

  const getChurnIcon = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <TrendingDown className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" data-testid="loader-analytics" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Activity className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground" data-testid="text-no-data">No analytics data available</p>
        <Button onClick={() => refetch()} data-testid="button-generate-report">
          Generate Report
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-page-title">Advanced Analytics</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Engagement scoring and predictive churn indicators
          </p>
        </div>
        <Button
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          data-testid="button-refresh-analytics"
        >
          {refreshMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Analytics
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-clients">{report.totalClients}</div>
            <p className="text-xs text-muted-foreground">Analyzed in latest report</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-active-clients">
              {report.activeClients}
            </div>
            <p className="text-xs text-muted-foreground">
              {report.totalClients > 0 ? Math.round((report.activeClients / report.totalClients) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk Clients</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-at-risk-clients">
              {report.atRiskClients}
            </div>
            <p className="text-xs text-muted-foreground">High churn risk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(report.averageEngagementScore)}`} data-testid="text-avg-engagement">
              {report.averageEngagementScore}
            </div>
            <p className="text-xs text-muted-foreground">Out of 100</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Churn Risk Distribution</CardTitle>
          <CardDescription>Distribution of clients by predicted churn risk level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium">Low Risk</span>
              </div>
              <Badge variant="default" data-testid="badge-low-risk">{report.churnRiskDistribution.low}</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="font-medium">Medium Risk</span>
              </div>
              <Badge variant="secondary" data-testid="badge-medium-risk">{report.churnRiskDistribution.medium}</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="font-medium">High Risk</span>
              </div>
              <Badge variant="destructive" data-testid="badge-high-risk">{report.churnRiskDistribution.high}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="top" className="space-y-4">
        <TabsList>
          <TabsTrigger value="top" data-testid="tab-top-engaged">Top Engaged</TabsTrigger>
          <TabsTrigger value="low" data-testid="tab-low-engaged">Low Engaged</TabsTrigger>
          <TabsTrigger value="at-risk" data-testid="tab-at-risk">At Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="top" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Engaged Clients</CardTitle>
              <CardDescription>Clients with the highest engagement scores</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Churn Risk</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.topEngagedClients.map((client) => (
                    <TableRow key={client.clientId} data-testid={`row-client-${client.clientId}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium" data-testid={`text-client-name-${client.clientId}`}>{client.clientName}</div>
                          <div className="text-sm text-muted-foreground">{client.clientEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${getScoreColor(client.overallScore)}`} data-testid={`text-score-${client.clientId}`}>
                          {client.overallScore}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getChurnBadgeVariant(client.churnRisk)} data-testid={`badge-churn-${client.clientId}`}>
                          {getChurnIcon(client.churnRisk)}
                          <span className="ml-1">{client.churnRisk}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm" data-testid={`text-last-activity-${client.clientId}`}>
                          {client.daysSinceLastActivity === 0 
                            ? 'Today' 
                            : client.daysSinceLastActivity === 1 
                            ? 'Yesterday' 
                            : `${client.daysSinceLastActivity} days ago`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedClient(client)}
                          data-testid={`button-view-details-${client.clientId}`}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Low Engaged Clients</CardTitle>
              <CardDescription>Clients with the lowest engagement scores requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Churn Risk</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.lowEngagedClients.map((client) => (
                    <TableRow key={client.clientId} data-testid={`row-low-client-${client.clientId}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{client.clientName}</div>
                          <div className="text-sm text-muted-foreground">{client.clientEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${getScoreColor(client.overallScore)}`}>
                          {client.overallScore}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getChurnBadgeVariant(client.churnRisk)}>
                          {getChurnIcon(client.churnRisk)}
                          <span className="ml-1">{client.churnRisk}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {client.daysSinceLastActivity === 0 
                            ? 'Today' 
                            : client.daysSinceLastActivity === 1 
                            ? 'Yesterday' 
                            : `${client.daysSinceLastActivity} days ago`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedClient(client)}
                          data-testid={`button-view-low-details-${client.clientId}`}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="at-risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>At Risk Clients</CardTitle>
              <CardDescription>Clients with high churn risk needing immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Key Insights</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...report.topEngagedClients, ...report.lowEngagedClients]
                    .filter(c => c.churnRisk === 'high')
                    .map((client) => (
                      <TableRow key={client.clientId} data-testid={`row-risk-client-${client.clientId}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{client.clientName}</div>
                            <div className="text-sm text-muted-foreground">{client.clientEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${getScoreColor(client.overallScore)}`}>
                            {client.overallScore}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-red-600 dark:text-red-400">
                            {client.daysSinceLastActivity} days ago
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-xs">
                            {client.insights.slice(0, 2).map((insight, idx) => (
                              <div key={idx} className="text-muted-foreground">• {insight}</div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedClient(client)}
                            data-testid={`button-view-risk-details-${client.clientId}`}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedClient && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Client Details: {selectedClient.clientName}</CardTitle>
            <CardDescription>Comprehensive engagement breakdown and insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-5">
              <div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
                <div className={`text-2xl font-bold ${getScoreColor(selectedClient.overallScore)}`}>
                  {selectedClient.overallScore}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Activity</div>
                <div className="text-2xl font-bold">{selectedClient.activityScore}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Sessions</div>
                <div className="text-2xl font-bold">{selectedClient.sessionScore}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Workouts</div>
                <div className="text-2xl font-bold">{selectedClient.workoutScore}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Videos</div>
                <div className="text-2xl font-bold">{selectedClient.videoScore}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Insights & Recommendations</h3>
              <div className="space-y-2">
                {selectedClient.insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span className="text-sm">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSelectedClient(null)} data-testid="button-close-details">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-muted-foreground text-center">
        Last updated: {new Date(report.generatedAt).toLocaleString()}
      </div>
    </div>
  );
}
