// Enhanced keyword detection for bullying
export const BULLYING_KEYWORDS = {
  verbal: [
    'ejek', 'hina', 'maki', 'kasar', 'bodoh', 'goblok', 'tolol', 'jelek', 
    'buruk', 'cacian', 'ancam', 'takut', 'cela', 'sindir', 'ledek',
    'rendah', 'miskin', 'kaya', 'sok', 'pansos', 'attention', 'norak', 'ngetawain'
  ],
  cyber: [
    'chat', 'whatsapp', 'instagram', 'medsos', 'online', 
    'posting', 'status', 'story', 'komen', 'tiktok',
    'twitter', 'facebook', 'snapchat', 'grup', 'broadcast', 'viral',
    'screenshot', 'share', 'forward', 'blast', 'spam'
  ],
  physical: [
    'pukul', 'tendang', 'tampar', 'dorong', 'sikut', 'jambak', 'ikat',
    'kunci', 'peras', 'rampas', 'ambil', 'paksa', 'maksa', 'ancam', 'intimidasi',
    'kekerasan', 'luka', 'sakit', 'bengkak', 'memar', 'berdarah', 'patah',
    'narik tas', 'uang jajan', 'palak', 'malak'
  ],
  excluded: [
    'kucil', 'asingkan', 'acuh', 'diamkan', 'sendirian', 'sendiri', 'diabaikan',
    'tidak dihiraukan', 'tidak diajak', 'tidak diterima', 'dijauhi', 'dihindari',
    'terpencil', 'terisolasi', 'tidak punya teman', 'kesepian', 'dikecualikan'
  ],
  emotional: [
    'sedih', 'trauma', 'depresi', 'stres', 'cemas', 'khawatir',
    'menangis', 'menyendiri', 'tidak mood', 'galau', 'insecure',
    'minder', 'tidak percaya diri', 'malu', 'terhina', 'tersakiti', 'sakit hati',
    'bunuh diri', 'mengakhiri', 'tidak ingin hidup', 'capek', 'lelah'
  ],
  general: [
    'bully', 'bullying', 'perundungan', 'penindasan', 'pelecehan', 'diskriminasi',
    'rasisme', 'seksisme', 'body shaming', 'tidak adil', 'tidak nyaman',
    'terintimidasi', 'terancam', 'bahaya', 'korban', 'pelaku', 'saksi'
  ]
};

export const POSITIVE_KEYWORDS = [
  'terima kasih', 'terimakasih', 'aman', 'tenang', 'senang', 'baik',
  'baikan', 'lega', 'semangat', 'mendukung', 'membantu', 'sudah baik',
  'sudah membaik', 'bangga', 'percaya diri', 'nyaman', 'berteman',
  'teman baru', 'damai', 'happy', 'bersyukur', 'harapan', 'pulih'
];

// Detect negative keywords in content using whole word matching
export function detectKeywords(content: string): string[] {
  const detectedKeywords: string[] = [];
  
  Object.values(BULLYING_KEYWORDS).forEach(categoryKeywords => {
    categoryKeywords.forEach(keyword => {
      if (keyword.length < 3) return;
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
      if (regex.test(content)) {
        detectedKeywords.push(keyword);
      }
    });
  });
  
  return [...new Set(detectedKeywords)];
}

// Detect positive keywords in content
export function detectPositiveKeywords(content: string): string[] {
  const detected: string[] = [];
  POSITIVE_KEYWORDS.forEach(keyword => {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
    if (regex.test(content)) {
      detected.push(keyword);
    }
  });
  return [...new Set(detected)];
}
