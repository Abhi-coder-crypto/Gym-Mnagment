import {
  Client,
  ClientActivity,
  SessionClient,
  WorkoutSession,
  VideoProgress,
  Achievement,
  LiveSession,
} from './models';

export interface EngagementScore {
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
  lastActivity: Date | null;
  daysSinceLastActivity: number;
  computedAt: Date;
  insights: string[];
}

export interface AnalyticsReport {
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
  generatedAt: Date;
}

const WEIGHTS = {
  activity: 0.15,
  sessions: 0.30,
  workouts: 0.25,
  videos: 0.20,
  achievements: 0.10,
};

const THRESHOLDS = {
  highEngagement: 70,
  lowEngagement: 40,
  recentActivityDays: 7,
  churnRiskDays: 14,
};

export class AnalyticsEngine {
  private scoresCache: Map<string, EngagementScore> = new Map();
  private lastComputed: Date | null = null;

  async calculateEngagementScores(): Promise<EngagementScore[]> {
    console.log('[Analytics] Starting engagement score calculation...');
    const startTime = Date.now();

    const clients = await Client.find().select('_id name email').lean();
    console.log(`[Analytics] Found ${clients.length} clients to analyze`);

    const scores: EngagementScore[] = [];

    for (const client of clients) {
      try {
        const score = await this.calculateClientScore(client._id.toString());
        scores.push(score);
      } catch (error) {
        console.error(`[Analytics] Error calculating score for client ${client._id}:`, error);
      }
    }

    this.scoresCache.clear();
    scores.forEach(score => {
      this.scoresCache.set(score.clientId, score);
    });

    this.lastComputed = new Date();
    const duration = Date.now() - startTime;
    console.log(`[Analytics] Completed analysis in ${duration}ms. Processed ${scores.length} clients.`);

    return scores;
  }

  private async calculateClientScore(clientId: string): Promise<EngagementScore> {
    const client = await Client.findById(clientId).select('name email').lean();
    if (!client) {
      throw new Error(`Client ${clientId} not found`);
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [activities, sessions, workouts, videos, achievements] = await Promise.all([
      ClientActivity.find({ clientId, timestamp: { $gte: thirtyDaysAgo } }).lean(),
      SessionClient.find({ clientId }).populate('sessionId').lean(),
      WorkoutSession.find({ clientId, completedAt: { $gte: thirtyDaysAgo } }).lean(),
      VideoProgress.find({ clientId, lastWatchedAt: { $gte: thirtyDaysAgo } }).lean(),
      Achievement.find({ clientId, unlockedAt: { $gte: thirtyDaysAgo } }).lean(),
    ]);

    const activityScore = this.calculateActivityScore(activities);
    const sessionScore = await this.calculateSessionScore(sessions, clientId, thirtyDaysAgo);
    const workoutScore = this.calculateWorkoutScore(workouts);
    const videoScore = this.calculateVideoScore(videos);
    const achievementScore = this.calculateAchievementScore(achievements);

    const overallScore = Math.round(
      activityScore * WEIGHTS.activity +
      sessionScore * WEIGHTS.sessions +
      workoutScore * WEIGHTS.workouts +
      videoScore * WEIGHTS.videos +
      achievementScore * WEIGHTS.achievements
    );

    const lastActivity = this.getLastActivityDate(activities, sessions, workouts, videos);
    const daysSinceLastActivity = lastActivity 
      ? Math.floor((now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000))
      : 999;

    const churnRisk = this.calculateChurnRisk(overallScore, daysSinceLastActivity);
    const insights = this.generateInsights(overallScore, daysSinceLastActivity, {
      activities: activities.length,
      sessions: sessions.length,
      workouts: workouts.length,
      videos: videos.length,
      achievements: achievements.length,
    });

    return {
      clientId: clientId,
      clientName: client.name,
      clientEmail: client.email,
      overallScore,
      activityScore,
      sessionScore,
      workoutScore,
      videoScore,
      achievementScore,
      churnRisk,
      lastActivity,
      daysSinceLastActivity,
      computedAt: now,
      insights,
    };
  }

  private calculateActivityScore(activities: any[]): number {
    if (activities.length === 0) return 0;
    const maxActivities = 50;
    return Math.min((activities.length / maxActivities) * 100, 100);
  }

  private async calculateSessionScore(sessions: any[], clientId: string, thirtyDaysAgo: Date): Promise<number> {
    if (sessions.length === 0) return 0;

    const recentSessions = sessions.filter((s: any) => {
      const session = s.sessionId;
      return session && new Date(session.scheduledAt) >= thirtyDaysAgo;
    });

    const attendedSessions = recentSessions.filter((s: any) => s.attended);
    
    const bookedCount = recentSessions.length;
    const attendedCount = attendedSessions.length;
    
    if (bookedCount === 0) return 0;

    const attendanceRate = (attendedCount / bookedCount) * 100;
    const bookingScore = Math.min((bookedCount / 10) * 50, 50);
    const attendanceScore = attendanceRate * 0.5;

    return Math.min(bookingScore + attendanceScore, 100);
  }

  private calculateWorkoutScore(workouts: any[]): number {
    if (workouts.length === 0) return 0;
    const maxWorkouts = 20;
    return Math.min((workouts.length / maxWorkouts) * 100, 100);
  }

  private calculateVideoScore(videos: any[]): number {
    if (videos.length === 0) return 0;

    const completedVideos = videos.filter(v => v.completed).length;
    const totalWatchTime = videos.reduce((sum, v) => sum + v.watchedDuration, 0);
    
    const completionScore = Math.min((completedVideos / 10) * 50, 50);
    const watchTimeScore = Math.min((totalWatchTime / 3600) * 50, 50);

    return completionScore + watchTimeScore;
  }

  private calculateAchievementScore(achievements: any[]): number {
    if (achievements.length === 0) return 0;
    const maxAchievements = 5;
    return Math.min((achievements.length / maxAchievements) * 100, 100);
  }

  private getLastActivityDate(activities: any[], sessions: any[], workouts: any[], videos: any[]): Date | null {
    const dates: Date[] = [];

    if (activities.length > 0) {
      dates.push(new Date(Math.max(...activities.map(a => new Date(a.timestamp).getTime()))));
    }
    if (sessions.length > 0) {
      dates.push(new Date(Math.max(...sessions.map(s => new Date(s.bookedAt).getTime()))));
    }
    if (workouts.length > 0) {
      dates.push(new Date(Math.max(...workouts.map(w => new Date(w.completedAt).getTime()))));
    }
    if (videos.length > 0) {
      dates.push(new Date(Math.max(...videos.map(v => new Date(v.lastWatchedAt).getTime()))));
    }

    if (dates.length === 0) return null;
    return new Date(Math.max(...dates.map(d => d.getTime())));
  }

  private calculateChurnRisk(overallScore: number, daysSinceLastActivity: number): 'low' | 'medium' | 'high' {
    if (overallScore >= THRESHOLDS.highEngagement && daysSinceLastActivity <= THRESHOLDS.recentActivityDays) {
      return 'low';
    }
    
    if (overallScore < THRESHOLDS.lowEngagement || daysSinceLastActivity > THRESHOLDS.churnRiskDays) {
      return 'high';
    }

    return 'medium';
  }

  private generateInsights(score: number, daysSinceLastActivity: number, counts: any): string[] {
    const insights: string[] = [];

    if (score >= THRESHOLDS.highEngagement) {
      insights.push('Highly engaged user - excellent retention');
    } else if (score >= THRESHOLDS.lowEngagement) {
      insights.push('Moderately engaged - could benefit from re-engagement');
    } else {
      insights.push('Low engagement - at risk of churning');
    }

    if (daysSinceLastActivity > THRESHOLDS.churnRiskDays) {
      insights.push(`No activity for ${daysSinceLastActivity} days - immediate attention needed`);
    } else if (daysSinceLastActivity > THRESHOLDS.recentActivityDays) {
      insights.push(`${daysSinceLastActivity} days since last activity`);
    } else {
      insights.push('Recently active user');
    }

    if (counts.sessions === 0) {
      insights.push('Not attending any sessions - recommend personal outreach');
    } else if (counts.sessions >= 5) {
      insights.push('Frequent session attendee');
    }

    if (counts.workouts === 0) {
      insights.push('No workouts completed - may need workout plan review');
    } else if (counts.workouts >= 10) {
      insights.push('Consistent workout completion');
    }

    if (counts.videos > 0) {
      insights.push('Engaged with video content');
    }

    if (counts.achievements > 0) {
      insights.push(`Unlocked ${counts.achievements} achievements`);
    }

    return insights;
  }

  async generateReport(): Promise<AnalyticsReport> {
    console.log('[Analytics] Generating analytics report...');
    
    const scores = await this.calculateEngagementScores();
    
    const activeClients = scores.filter(s => s.daysSinceLastActivity <= 30).length;
    const atRiskClients = scores.filter(s => s.churnRisk === 'high').length;
    
    const sortedByScore = [...scores].sort((a, b) => b.overallScore - a.overallScore);
    const topEngagedClients = sortedByScore.slice(0, 10);
    const lowEngagedClients = sortedByScore.slice(-10).reverse();

    const churnRiskDistribution = {
      low: scores.filter(s => s.churnRisk === 'low').length,
      medium: scores.filter(s => s.churnRisk === 'medium').length,
      high: scores.filter(s => s.churnRisk === 'high').length,
    };

    const averageEngagementScore = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length)
      : 0;

    const report: AnalyticsReport = {
      totalClients: scores.length,
      activeClients,
      atRiskClients,
      topEngagedClients,
      lowEngagedClients,
      churnRiskDistribution,
      averageEngagementScore,
      generatedAt: new Date(),
    };

    console.log('[Analytics] Report generated:', {
      totalClients: report.totalClients,
      activeClients: report.activeClients,
      atRiskClients: report.atRiskClients,
      averageScore: report.averageEngagementScore,
    });

    return report;
  }

  getScoresFromCache(): EngagementScore[] {
    return Array.from(this.scoresCache.values());
  }

  getCacheInfo() {
    return {
      cachedScores: this.scoresCache.size,
      lastComputed: this.lastComputed,
    };
  }
}

export const analyticsEngine = new AnalyticsEngine();
