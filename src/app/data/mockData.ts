// Mock data untuk aplikasi
export interface Report {
  id: string;
  content: string;
  categories: string[];
  riskLevel: 'low' | 'medium' | 'high';
  sentiment: number;
  confidence: number;
  date: Date;
  status: 'pending' | 'reviewed' | 'resolved';
  highlightedWords: string[];
  aiSummary: string;
  emotionBreakdown: {
    fear: number;
    sadness: number;
    anger: number;
    disgust: number;
  };
  wordFrequency: { word: string; count: number }[];
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  grade?: string;
}

export interface Activity {
  id: string;
  reportId: string;
  type: 'created' | 'reviewed' | 'commented' | 'status_changed' | 'assigned';
  user: string;
  timestamp: Date;
  description: string;
}

export interface Notification {
  id: string;
  type: 'urgent' | 'new_report' | 'status_update' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  reportId?: string;
}

export const mockReports: Report[] = [
  {
    id: '1',
    content: 'Saya selalu diejek oleh teman sekelas karena nilai saya jelek. Mereka bilang saya bodoh dan tidak pantas sekolah di sini. Setiap hari saya takut masuk kelas.',
    categories: ['Verbal', 'Dikucilkan'],
    riskLevel: 'high',
    sentiment: -0.85,
    confidence: 89,
    date: new Date('2026-04-08T10:30:00'),
    status: 'pending',
    highlightedWords: ['diejek', 'bodoh', 'takut'],
    aiSummary: 'Terdapat indikasi perundungan verbal berulang dengan dampak psikologis signifikan. Korban mengalami ketakutan dan tekanan emosional.',
    emotionBreakdown: { fear: 65, sadness: 75, anger: 40, disgust: 30 },
    wordFrequency: [
      { word: 'diejek', count: 5 },
      { word: 'takut', count: 8 },
      { word: 'bodoh', count: 3 },
      { word: 'jelek', count: 2 }
    ],
    priority: 'urgent',
    location: 'Kelas 10-A',
    grade: '10'
  },
  {
    id: '2',
    content: 'Ada yang nyebarin foto saya di grup chat dan semua orang ketawa. Mereka bikin meme dari foto saya dan share ke semua kelas.',
    categories: ['Cyberbullying', 'Dikucilkan'],
    riskLevel: 'high',
    sentiment: -0.78,
    confidence: 92,
    date: new Date('2026-04-07T14:20:00'),
    status: 'reviewed',
    highlightedWords: ['nyebarin foto', 'ketawa', 'meme'],
    aiSummary: 'Cyberbullying dengan penyebaran konten pribadi tanpa izin. Memerlukan tindakan segera untuk menghentikan penyebaran konten.',
    emotionBreakdown: { fear: 55, sadness: 80, anger: 60, disgust: 70 },
    wordFrequency: [
      { word: 'foto', count: 4 },
      { word: 'ketawa', count: 6 },
      { word: 'meme', count: 3 }
    ],
    assignedTo: 'Bu Sari',
    priority: 'urgent',
    location: 'Kelas 11-B',
    grade: '11'
  },
  {
    id: '3',
    content: 'Teman saya tidak pernah mengajak saya main atau ngobrol. Rasanya saya seperti tidak ada.',
    categories: ['Dikucilkan'],
    riskLevel: 'medium',
    sentiment: -0.45,
    confidence: 72,
    date: new Date('2026-04-06T09:15:00'),
    status: 'reviewed',
    highlightedWords: ['tidak ada'],
    aiSummary: 'Indikasi pengucilan sosial dengan dampak emosional sedang. Perlu monitoring untuk mencegah eskalasi.',
    emotionBreakdown: { fear: 30, sadness: 70, anger: 20, disgust: 15 },
    wordFrequency: [
      { word: 'tidak', count: 3 },
      { word: 'main', count: 2 }
    ],
    assignedTo: 'Pak Budi',
    priority: 'medium',
    location: 'Kelas 9-C',
    grade: '9'
  },
  {
    id: '4',
    content: 'Kakak kelas sering mukul saya di kantin dan minta uang jajan. Kalau tidak kasih, dia ancam mau pukul lagi.',
    categories: ['Fisik', 'Verbal'],
    riskLevel: 'high',
    sentiment: -0.92,
    confidence: 95,
    date: new Date('2026-04-05T11:45:00'),
    status: 'resolved',
    highlightedWords: ['mukul', 'ancam', 'pukul'],
    aiSummary: 'Kekerasan fisik dan pemerasan. Kasus serius yang memerlukan eskalasi ke pihak berwenang.',
    emotionBreakdown: { fear: 85, sadness: 60, anger: 70, disgust: 50 },
    wordFrequency: [
      { word: 'mukul', count: 4 },
      { word: 'ancam', count: 3 },
      { word: 'uang', count: 2 }
    ],
    assignedTo: 'Bu Sari',
    priority: 'urgent',
    location: 'Kantin',
    grade: '8'
  },
  {
    id: '5',
    content: 'Terima kasih guru sudah membantu saya. Sekarang teman-teman sudah tidak mengganggu lagi.',
    categories: ['Verbal'],
    riskLevel: 'low',
    sentiment: 0.65,
    confidence: 58,
    date: new Date('2026-04-04T16:00:00'),
    status: 'resolved',
    highlightedWords: [],
    aiSummary: 'Laporan positif. Tidak ada indikasi bullying, kemungkinan follow-up dari kasus sebelumnya.',
    emotionBreakdown: { fear: 10, sadness: 5, anger: 5, disgust: 0 },
    wordFrequency: [
      { word: 'terima kasih', count: 1 },
      { word: 'membantu', count: 1 }
    ],
    assignedTo: 'Pak Budi',
    priority: 'low',
    location: 'Kelas 10-A',
    grade: '10'
  },
  {
    id: '6',
    content: 'Di kelas selalu ada yang lempar kertas ke saya dan tulis kata-kata kasar. Saya capek dan sedih.',
    categories: ['Verbal', 'Fisik'],
    riskLevel: 'medium',
    sentiment: -0.62,
    confidence: 78,
    date: new Date('2026-04-03T13:30:00'),
    status: 'pending',
    highlightedWords: ['lempar', 'kasar', 'capek', 'sedih'],
    aiSummary: 'Kombinasi bullying verbal dan fisik ringan. Perlu intervensi untuk mencegah eskalasi.',
    emotionBreakdown: { fear: 40, sadness: 65, anger: 45, disgust: 35 },
    wordFrequency: [
      { word: 'lempar', count: 3 },
      { word: 'kasar', count: 4 },
      { word: 'capek', count: 2 }
    ],
    priority: 'medium',
    location: 'Kelas 11-A',
    grade: '11'
  },
  {
    id: '7',
    content: 'Grup WhatsApp kelas mengejek saya terus menerus. Mereka kirim sticker yang menghina saya.',
    categories: ['Cyberbullying', 'Verbal'],
    riskLevel: 'high',
    sentiment: -0.71,
    confidence: 84,
    date: new Date('2026-04-02T16:45:00'),
    status: 'reviewed',
    highlightedWords: ['mengejek', 'menghina'],
    aiSummary: 'Cyberbullying berkelanjutan dalam grup chat. Perlu tindakan moderasi dan edukasi kelompok.',
    emotionBreakdown: { fear: 50, sadness: 70, anger: 55, disgust: 60 },
    wordFrequency: [
      { word: 'mengejek', count: 5 },
      { word: 'menghina', count: 3 }
    ],
    assignedTo: 'Bu Sari',
    priority: 'high',
    location: 'Grup WA 12-B',
    grade: '12'
  },
  {
    id: '8',
    content: 'Tidak ada yang mau duduk sebelah saya. Saat kerja kelompok, saya selalu ditolak.',
    categories: ['Dikucilkan'],
    riskLevel: 'medium',
    sentiment: -0.55,
    confidence: 70,
    date: new Date('2026-04-01T10:00:00'),
    status: 'pending',
    highlightedWords: ['ditolak'],
    aiSummary: 'Pengucilan sosial sistematis. Memerlukan intervensi untuk meningkatkan inklusi sosial.',
    emotionBreakdown: { fear: 35, sadness: 75, anger: 25, disgust: 20 },
    wordFrequency: [
      { word: 'tidak ada', count: 2 },
      { word: 'ditolak', count: 3 }
    ],
    priority: 'medium',
    location: 'Kelas 9-A',
    grade: '9'
  }
];

export const mockActivities: Activity[] = [
  {
    id: 'a1',
    reportId: '2',
    type: 'reviewed',
    user: 'Bu Sari',
    timestamp: new Date('2026-04-07T15:00:00'),
    description: 'Meninjau laporan dan mengidentifikasi pelaku'
  },
  {
    id: 'a2',
    reportId: '2',
    type: 'commented',
    user: 'Bu Sari',
    timestamp: new Date('2026-04-07T15:30:00'),
    description: 'Menambahkan catatan: Sudah berbicara dengan wali kelas'
  },
  {
    id: 'a3',
    reportId: '4',
    type: 'status_changed',
    user: 'Bu Sari',
    timestamp: new Date('2026-04-05T14:00:00'),
    description: 'Status diubah dari Pending ke Resolved'
  },
  {
    id: 'a4',
    reportId: '1',
    type: 'created',
    user: 'Sistem',
    timestamp: new Date('2026-04-08T10:30:00'),
    description: 'Laporan baru diterima dengan risiko tinggi'
  },
  {
    id: 'a5',
    reportId: '1',
    type: 'assigned',
    user: 'Sistem',
    timestamp: new Date('2026-04-08T10:31:00'),
    description: 'Kasus ditugaskan ke Bu Sari'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'urgent',
    title: 'Laporan Risiko Tinggi Baru',
    message: 'Laporan #1 memerlukan perhatian segera',
    timestamp: new Date('2026-04-08T10:30:00'),
    read: false,
    reportId: '1'
  },
  {
    id: 'n2',
    type: 'new_report',
    title: 'Laporan Baru Diterima',
    message: 'Laporan #6 telah masuk ke sistem',
    timestamp: new Date('2026-04-03T13:30:00'),
    read: false,
    reportId: '6'
  },
  {
    id: 'n3',
    type: 'status_update',
    title: 'Status Laporan Diperbarui',
    message: 'Laporan #4 telah diselesaikan',
    timestamp: new Date('2026-04-05T14:00:00'),
    read: true,
    reportId: '4'
  },
  {
    id: 'n4',
    type: 'reminder',
    title: 'Pengingat Follow-up',
    message: '3 kasus memerlukan tindak lanjut minggu ini',
    timestamp: new Date('2026-04-07T09:00:00'),
    read: false
  }
];

export const getReportById = (id: string): Report | undefined => {
  return mockReports.find(report => report.id === id);
};

export const getReportStats = () => {
  const totalReports = mockReports.length;
  const highRiskCount = mockReports.filter(r => r.riskLevel === 'high').length;
  const thisWeekCount = mockReports.filter(r => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return r.date >= weekAgo;
  }).length;

  return {
    totalReports,
    highRiskCount,
    thisWeekCount
  };
};

export const getCategoryDistribution = () => {
  const categories: Record<string, number> = {};
  
  mockReports.forEach(report => {
    report.categories.forEach(category => {
      categories[category] = (categories[category] || 0) + 1;
    });
  });

  return Object.entries(categories).map(([name, value]) => ({
    name,
    value
  }));
};

export const getTrendData = () => {
  return [
    { date: 'Sen', count: 2 },
    { date: 'Sel', count: 3 },
    { date: 'Rab', count: 1 },
    { date: 'Kam', count: 4 },
    { date: 'Jum', count: 3 },
    { date: 'Sab', count: 1 },
    { date: 'Min', count: 2 }
  ];
};

export const getActivitiesByReportId = (reportId: string): Activity[] => {
  return mockActivities.filter(activity => activity.reportId === reportId);
};

export const getUnreadNotifications = (): Notification[] => {
  return mockNotifications.filter(n => !n.read);
};

export const getHeatMapData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  
  return days.map(day => ({
    day,
    data: hours.map(hour => ({
      hour,
      value: Math.floor(Math.random() * 10)
    }))
  }));
};

export const getLocationDistribution = () => {
  const locations: Record<string, number> = {};
  
  mockReports.forEach(report => {
    if (report.location) {
      locations[report.location] = (locations[report.location] || 0) + 1;
    }
  });

  return Object.entries(locations).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);
};

export const getGradeDistribution = () => {
  const grades: Record<string, number> = {};
  
  mockReports.forEach(report => {
    if (report.grade) {
      grades[`Kelas ${report.grade}`] = (grades[`Kelas ${report.grade}`] || 0) + 1;
    }
  });

  return Object.entries(grades).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => {
    const gradeA = parseInt(a.name.split(' ')[1]);
    const gradeB = parseInt(b.name.split(' ')[1]);
    return gradeA - gradeB;
  });
};

export const getPriorityDistribution = () => {
  return [
    { name: 'Urgent', value: mockReports.filter(r => r.priority === 'urgent').length, color: '#ef4444' },
    { name: 'High', value: mockReports.filter(r => r.priority === 'high').length, color: '#f59e0b' },
    { name: 'Medium', value: mockReports.filter(r => r.priority === 'medium').length, color: '#3b82f6' },
    { name: 'Low', value: mockReports.filter(r => r.priority === 'low').length, color: '#10b981' }
  ];
};

export const getWeeklyComparison = () => {
  return [
    { week: 'Minggu 1', current: 8, previous: 5 },
    { week: 'Minggu 2', current: 12, previous: 7 },
    { week: 'Minggu 3', current: 6, previous: 9 },
    { week: 'Minggu 4', current: 10, previous: 6 }
  ];
};

export const getSentimentTrend = () => {
  return [
    { date: '1 Apr', sentiment: -0.45 },
    { date: '2 Apr', sentiment: -0.52 },
    { date: '3 Apr', sentiment: -0.60 },
    { date: '4 Apr', sentiment: -0.38 },
    { date: '5 Apr', sentiment: -0.75 },
    { date: '6 Apr', sentiment: -0.48 },
    { date: '7 Apr', sentiment: -0.68 },
    { date: '8 Apr', sentiment: -0.82 }
  ];
};