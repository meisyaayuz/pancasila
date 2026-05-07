import { Report } from '../services/reportService';

export function getReportStats(reports: Report[]) {
  return {
    totalReports: reports.length,
    highRiskCount: reports.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length,
    newReports: reports.filter(r => r.status === 'new').length,
    resolvedCount: reports.filter(r => r.status === 'resolved').length,
  };
}

export function getCategoryDistribution(reports: Report[]) {
  const catCount: Record<string, number> = {};
  
  reports.forEach(report => {
    report.categories.forEach(cat => {
      catCount[cat] = (catCount[cat] || 0) + 1;
    });
  });
  
  return Object.entries(catCount).map(([name, value]) => ({ name, value }));
}

export function getTrendData(reports: Report[]) {
  const last7Days: Record<string, number> = {};
  const today = new Date();
  
  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    last7Days[dateStr] = 0;
  }
  
  // Count reports per day
  reports.forEach(report => {
    const reportDate = new Date(report.timestamp);
    const dateStr = reportDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    if (last7Days.hasOwnProperty(dateStr)) {
      last7Days[dateStr]++;
    }
  });
  
  return Object.entries(last7Days).map(([date, count]) => ({ date, count }));
}

export function getClassDistribution(reports: Report[]) {
  const classCount: Record<string, number> = {};
  
  reports.forEach(report => {
    const className = report.studentClass;
    classCount[className] = (classCount[className] || 0) + 1;
  });
  
  return Object.entries(classCount).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);
}

export function getLocationDistribution(reports: Report[]) {
  const locCount: Record<string, number> = {};
  
  reports.forEach(report => {
    if (report.location) {
      locCount[report.location] = (locCount[report.location] || 0) + 1;
    }
  });
  
  return Object.entries(locCount).map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getSentimentData(reports: Report[]) {
  const sentimentCount = {
    positive: 0,
    neutral: 0,
    negative: 0
  };
  
  reports.forEach(report => {
    sentimentCount[report.sentiment]++;
  });
  
  return [
    { name: 'Negative', value: sentimentCount.negative },
    { name: 'Neutral', value: sentimentCount.neutral },
    { name: 'Positive', value: sentimentCount.positive },
  ];
}

export function getTimeDistribution(reports: Report[]) {
  const timeSlots = {
    '06:00-09:00': 0,
    '09:00-12:00': 0,
    '12:00-15:00': 0,
    '15:00-18:00': 0,
    '18:00-21:00': 0,
    '21:00-24:00': 0
  };
  
  reports.forEach(report => {
    const hour = new Date(report.timestamp).getHours();
    
    if (hour >= 6 && hour < 9) timeSlots['06:00-09:00']++;
    else if (hour >= 9 && hour < 12) timeSlots['09:00-12:00']++;
    else if (hour >= 12 && hour < 15) timeSlots['12:00-15:00']++;
    else if (hour >= 15 && hour < 18) timeSlots['15:00-18:00']++;
    else if (hour >= 18 && hour < 21) timeSlots['18:00-21:00']++;
    else timeSlots['21:00-24:00']++;
  });
  
  return Object.entries(timeSlots).map(([name, value]) => ({ name, value }));
}

export function getKeywordFrequency(reports: Report[]) {
  const keywordCount: Record<string, number> = {};
  
  reports.forEach(report => {
    report.keywords.forEach(keyword => {
      keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
    });
  });
  
  return Object.entries(keywordCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}
