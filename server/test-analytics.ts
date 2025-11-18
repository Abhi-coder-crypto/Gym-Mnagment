import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { analyticsEngine } from './analytics-engine';

dotenv.config();

async function testAnalytics() {
  try {
    console.log('🧪 Testing Analytics Engine...\n');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitpro';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    console.log('📊 Generating Analytics Report...\n');
    const report = await analyticsEngine.generateReport();

    console.log('═══════════════════════════════════════════════════════');
    console.log('           ENGAGEMENT ANALYTICS REPORT');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📈 SUMMARY STATISTICS');
    console.log('─────────────────────────────────────────────────────');
    console.log(`Total Clients Analyzed:      ${report.totalClients}`);
    console.log(`Active Clients (30d):        ${report.activeClients}`);
    console.log(`At Risk Clients:             ${report.atRiskClients}`);
    console.log(`Average Engagement Score:    ${report.averageEngagementScore}/100`);
    console.log('');

    console.log('⚠️  CHURN RISK DISTRIBUTION');
    console.log('─────────────────────────────────────────────────────');
    console.log(`🟢 Low Risk:                 ${report.churnRiskDistribution.low} clients`);
    console.log(`🟡 Medium Risk:              ${report.churnRiskDistribution.medium} clients`);
    console.log(`🔴 High Risk:                ${report.churnRiskDistribution.high} clients`);
    console.log('');

    console.log('🏆 TOP 5 ENGAGED CLIENTS');
    console.log('─────────────────────────────────────────────────────');
    report.topEngagedClients.slice(0, 5).forEach((client, idx) => {
      console.log(`\n${idx + 1}. ${client.clientName}`);
      console.log(`   Email:              ${client.clientEmail}`);
      console.log(`   Overall Score:      ${client.overallScore}/100`);
      console.log(`   Churn Risk:         ${client.churnRisk.toUpperCase()}`);
      console.log(`   Last Activity:      ${client.daysSinceLastActivity} days ago`);
      console.log(`   Breakdown:`);
      console.log(`     - Sessions:       ${client.sessionScore}/100`);
      console.log(`     - Workouts:       ${client.workoutScore}/100`);
      console.log(`     - Videos:         ${client.videoScore}/100`);
      console.log(`     - Activity:       ${client.activityScore}/100`);
    });

    console.log('\n\n📉 TOP 5 LOW ENGAGED CLIENTS (NEED ATTENTION)');
    console.log('─────────────────────────────────────────────────────');
    report.lowEngagedClients.slice(0, 5).forEach((client, idx) => {
      console.log(`\n${idx + 1}. ${client.clientName}`);
      console.log(`   Email:              ${client.clientEmail}`);
      console.log(`   Overall Score:      ${client.overallScore}/100`);
      console.log(`   Churn Risk:         ${client.churnRisk.toUpperCase()}`);
      console.log(`   Last Activity:      ${client.daysSinceLastActivity} days ago`);
      console.log(`   Key Insights:`);
      client.insights.slice(0, 3).forEach(insight => {
        console.log(`     • ${insight}`);
      });
    });

    console.log('\n\n🚨 HIGH RISK CLIENTS (IMMEDIATE ATTENTION NEEDED)');
    console.log('─────────────────────────────────────────────────────');
    const highRiskClients = [...report.topEngagedClients, ...report.lowEngagedClients]
      .filter(c => c.churnRisk === 'high')
      .slice(0, 5);
    
    if (highRiskClients.length === 0) {
      console.log('No high-risk clients found! 🎉');
    } else {
      highRiskClients.forEach((client, idx) => {
        console.log(`\n${idx + 1}. ${client.clientName}`);
        console.log(`   Score:              ${client.overallScore}/100`);
        console.log(`   Last Activity:      ${client.daysSinceLastActivity} days ago`);
        console.log(`   Recommendations:`);
        client.insights.forEach(insight => {
          console.log(`     • ${insight}`);
        });
      });
    }

    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log(`Report generated at: ${new Date(report.generatedAt).toLocaleString()}`);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('💾 Cache Information:');
    const cacheInfo = analyticsEngine.getCacheInfo();
    console.log(`   Cached Scores:      ${cacheInfo.cachedScores}`);
    console.log(`   Last Computed:      ${cacheInfo.lastComputed?.toLocaleString()}`);
    console.log('');

    console.log('✅ Analytics Test Complete!\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAnalytics();
