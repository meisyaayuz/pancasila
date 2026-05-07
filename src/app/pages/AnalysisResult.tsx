import { useLocation, useNavigate, Link } from 'react-router';
import { AlertCircle, TrendingUp, Brain, ArrowLeft, CheckCircle2, Download, Share2, Eye } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { motion } from 'motion/react';
import { useState } from 'react';

export function AnalysisResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { content, categories, mood, riskLevel, keywords, positiveKeywords } = location.state || {};
  const [showFullText, setShowFullText] = useState(false);

  if (!content) {
    navigate('/student-report');
    return null;
  }

  const detectedWords = keywords || [];
  const detectedPositiveWords = positiveKeywords || [];
  const keywordCount = detectedWords.length;
  const posCount = detectedPositiveWords.length;
  const isPositive = posCount > keywordCount || posCount > 0 && keywordCount === 0;
  const isHighRisk = !isPositive && (riskLevel === 'critical' || riskLevel === 'high');

  // Compute sentiment score first — used by emotion suppression logic
  const sentimentScore = isPositive ? 0.7 : (isHighRisk ? -0.85 : (keywordCount > 0 ? -0.4 : 0.1));
  const severityScore = isPositive ? 2.0 : (isHighRisk ? 8.5 : (keywordCount > 0 ? 5.0 : 2.0));

  // Emotion suppression: if sentiment is positive OR positive keywords exist, cap ALL negative emotions at 8%
  const suppressEmotions = isPositive || sentimentScore > 0;

  const marahWords = ['paksa', 'maksa', 'pukul', 'tendang', 'ancam', 'palak', 'malak', 'uang jajan', 'narik tas'];
  const sedihWords = ['ngetawain', 'sindir', 'ejek', 'ledek', 'kucil', 'asingkan', 'bodoh', 'jelek'];

  // Baseline values — aggressively low when positive
  let sedihScore = suppressEmotions ? 5 : (mood === 'sad' ? 85 : (isHighRisk ? 60 : 30));
  let marahScore = suppressEmotions ? 4 : (isHighRisk ? 65 : 35);
  let takutScore = suppressEmotions ? 3 : (isHighRisk ? 75 : 40);
  let jijikScore = suppressEmotions ? 2 : (isHighRisk ? 40 : 20);

  // Boost negative emotions only if NOT suppressed
  if (!suppressEmotions) {
    detectedWords.forEach((word: string) => {
      if (sedihWords.includes(word.toLowerCase())) {
        sedihScore = Math.min(100, sedihScore + 25);
      }
      if (marahWords.includes(word.toLowerCase())) {
        marahScore = Math.min(100, marahScore + 25);
      }
    });
  }

  // Hard cap: if suppressed, ensure nothing exceeds 8% (double-safety)
  if (suppressEmotions) {
    sedihScore = Math.min(8, sedihScore);
    marahScore = Math.min(8, marahScore);
    takutScore = Math.min(8, takutScore);
    jijikScore = Math.min(8, jijikScore);
  }

  const stopwords = ['dan', 'di', 'ke', 'dari', 'yang', 'untuk', 'dengan', 'ini', 'itu', 'pada', 'dalam'];

  // Dynamic intensity based on severity score
  const intensityLabel = severityScore <= 3 ? 'Rendah' : severityScore <= 6 ? 'Sedang' : 'Tinggi';
  const intensityWidth = severityScore <= 3 ? '25%' : severityScore <= 6 ? '60%' : '90%';
  const intensityColor = severityScore <= 3 ? 'bg-green-400' : severityScore <= 6 ? 'bg-yellow-400' : 'bg-red-500';
  const intensityTextColor = severityScore <= 3 ? 'text-green-700' : severityScore <= 6 ? 'text-yellow-700' : 'text-red-700';

  // Dynamic radar chart domain — positive uses full [0,100]; negative low uses tight scale
  const maxNegativeEmotionValue = Math.max(sedihScore, marahScore, takutScore, jijikScore);
  const radarDomain: [number, number] = [0, suppressEmotions ? 100 : Math.max(20, maxNegativeEmotionValue)];

  // Dynamic analysis based on user input
  const analysis = {
    riskLevel: riskLevel || 'low',
    confidence: isPositive ? 90 : Math.min(95, 70 + (keywordCount * 5)),
    sentiment: sentimentScore,
    detectedWords: detectedWords,
    summary: isPositive
      ? 'Senang mendengar kabarmu yang lebih baik! Terima kasih sudah mau berbagi cerita positif. Tetap semangat dan jangan ragu untuk melaporkan lagi jika ada yang mengganggu.'
      : (isHighRisk 
          ? 'Sistem mendeteksi adanya indikasi perundungan serius berdasarkan kata kunci yang kamu gunakan. Jangan ragu, kamu tidak sendirian. Guru BK akan segera menindaklanjuti laporan ini secara rahasia.'
          : (keywordCount > 0 
              ? 'Sistem menemukan beberapa kata yang menunjukkan pengalaman tidak menyenangkan. Terima kasih telah berani bercerita. Laporanmu sudah aman bersama kami.'
              : 'Laporanmu telah berhasil direkam. Setiap ceritamu sangat berarti dan Guru BK akan membacanya dengan saksama.')),
    emotionBreakdown: suppressEmotions ? [
      { name: 'Lega', value: 85, color: '#22c55e' },
      { name: 'Senang', value: 75, color: '#3b82f6' },
      { name: 'Percaya Diri', value: 65, color: '#8b5cf6' },
      { name: 'Damai', value: 70, color: '#06b6d4' }
    ] : [
      { name: 'Sedih', value: sedihScore, color: '#f59e0b' },
      { name: 'Takut', value: takutScore, color: '#ef4444' },
      { name: 'Marah', value: marahScore, color: '#f97316' },
      { name: 'Jijik', value: jijikScore, color: '#84cc16' }
    ],
    wordFrequency: detectedWords
      .filter((word: string) => !stopwords.includes(word.toLowerCase()))
      .map((word: string) => ({
        word,
        count: (content.toLowerCase().match(new RegExp(`\\b${word.toLowerCase()}\\b`, 'g')) || []).length
      })).sort((a: any, b: any) => b.count - a.count).slice(0, 5),
    recommendations: isPositive ? [
      {
        title: 'Pertahankan Semangat!',
        description: 'Bagus sekali! Teruslah bersikap positif dan jaga hubungan baik dengan teman-temanmu.',
        priority: 'medium',
        icon: '🌟'
      },
      {
        title: 'Cerita Lagi Kalau Ada Masalah',
        description: 'Ingat, kamu selalu bisa kembali ke sini jika ada yang mengganggu pikiranmu.',
        priority: 'medium',
        icon: '💬'
      }
    ] : [
      {
        title: 'Tarik Napas & Tenangkan Diri',
        description: 'Tarik napas dalam-dalam. Ingat bahwa kejadian ini bukanlah salahmu. Kamu berhak merasa aman.',
        priority: 'urgent',
        icon: '🧘‍♀️'
      },
      {
        title: 'Simpan Bukti Kejadian',
        description: 'Jika ada bukti berupa chat, foto, atau postingan, segera screenshot dan simpan dengan aman.',
        priority: 'high',
        icon: '📱'
      },
      {
        title: 'Bicara dengan Orang Terpercaya',
        description: 'Ceritakan apa yang kamu alami kepada orang tua, guru lain, atau teman terdekatmu. Jangan pendam sendiri.',
        priority: 'high',
        icon: '🗣️'
      },
      {
        title: 'Jaga Jarak Aman',
        description: 'Untuk sementara, hindari interaksi dengan pihak yang membuatmu tidak nyaman sampai situasi membaik.',
        priority: 'medium',
        icon: '🛡️'
      }
    ],
    similarCases: Math.floor(Math.random() * 5),
    severityScore
  };

  const highlightText = (text: string) => {
    let highlightedText = text;
    analysis.detectedWords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-red-100 text-red-800 px-1 rounded font-medium">$1</mark>'
      );
    });
    return highlightedText;
  };

  const emotionRadarData = analysis.emotionBreakdown.map(e => ({
    emotion: e.name,
    value: e.value
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-20 md:pt-8 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          to="/student-report"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Kembali</span>
        </Link>

        {/* Header */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00158b]/10 text-[#00158b] mb-4">
            <Brain className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hasil Analisis Laporan
          </h1>
          <p className="text-gray-600">
            Laporan telah dianalisis dan diteruskan ke Guru BK
          </p>
        </motion.div>

        {/* Success Message */}
        <motion.div 
          className="bg-green-50 rounded-2xl p-5 mb-8 shadow-sm"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 mt-1.5">
              <h3 className="font-semibold text-green-900 mb-1">
                Laporan Berhasil Dikirim
              </h3>
              <p className="text-sm text-green-700 leading-relaxed">
                Terima kasih telah berani bercerita. Guru BK akan segera menindaklanjuti laporan ini secara rahasia.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Risk Level - Large Card */}
          <motion.div 
            className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-sm p-4 md:p-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-semibold text-gray-900 mb-6 text-lg">Analisis Risiko</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center ${
                  analysis.riskLevel === 'critical' ? 'bg-red-50' :
                  analysis.riskLevel === 'high' ? 'bg-orange-50' :
                  analysis.riskLevel === 'medium' ? 'bg-yellow-50' : 
                  'bg-green-50'
                }`}>
                  <AlertCircle className={`w-12 h-12 mb-4 ${
                    analysis.riskLevel === 'critical' ? 'text-red-500' :
                    analysis.riskLevel === 'high' ? 'text-orange-500' :
                    analysis.riskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`} />
                  <RiskBadge level={analysis.riskLevel} />
                  <p className="text-sm text-gray-500 mt-4">Severity Score</p>
                  <p className={`text-2xl font-bold ${
                    analysis.riskLevel === 'critical' ? 'text-red-700' :
                    analysis.riskLevel === 'high' ? 'text-orange-700' :
                    analysis.riskLevel === 'medium' ? 'text-yellow-700' : 'text-green-700'
                  }`}>{analysis.severityScore}/10</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Confidence Score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#00158b] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${analysis.confidence}%` }}
                          transition={{ delay: 0.5, duration: 1 }}
                        />
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{analysis.confidence}%</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Kasus Serupa</p>
                  <p className="text-xl font-bold text-gray-900">{analysis.similarCases} kasus</p>
                  <p className="text-xs text-gray-500 mt-1">Terdeteksi bulan ini</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                   <p className="text-xs text-gray-500 mb-1">Sentiment Score</p>
                   <p className={`text-xl font-bold ${
                     analysis.sentiment > 0 ? 'text-green-600' : 
                     analysis.sentiment < -0.5 ? 'text-red-600' : 'text-yellow-600'
                   }`}>{analysis.sentiment.toFixed(2)}</p>
                   <p className={`text-xs mt-1 ${
                     analysis.sentiment > 0 ? 'text-green-500' : 
                     analysis.sentiment < -0.5 ? 'text-red-500' : 'text-yellow-500'
                   }`}>{analysis.sentiment > 0 ? 'Positif' : analysis.sentiment < -0.5 ? 'Sangat negatif' : 'Negatif'}</p>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Statistik Laporan</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Kata Terdeteksi</span>
                    <span className="text-base font-semibold text-gray-900">{analysis.detectedWords.length}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Panjang Teks</span>
                    <span className="text-base font-semibold text-gray-900">{content.split(' ').length} kata</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
                <div>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm text-gray-500">Intensitas Emosi</span>
                     <span className={`text-base font-semibold ${intensityTextColor}`}>{intensityLabel}</span>
                   </div>
                   <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                     <div className={`h-full ${intensityColor} rounded-full`} style={{ width: intensityWidth }} />
                   </div>
                 </div>
              </div>
            </div>

            <div className="bg-[#00158b] rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <Eye className="w-6 h-6 mb-3 text-white/80" />
                <p className="text-xs text-white/70 mb-1 uppercase tracking-wider">Status</p>
                <p className="font-bold text-lg mb-2">Menunggu Tindak Lanjut</p>
                <p className="text-sm text-white/80">Estimasi respon: 2-4 jam</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Emotion & Word Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <motion.div
            className="bg-white rounded-2xl shadow-sm p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              Profil Emosi
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={emotionRadarData} outerRadius="80%">
                <PolarGrid stroke="#f3f4f6" />
                <PolarAngleAxis dataKey="emotion" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <PolarRadiusAxis domain={radarDomain} tick={false} axisLine={false} />
                <Radar 
                  name="Intensitas" 
                  dataKey="value" 
                  stroke="#00158b" 
                  fill="#00158b" 
                  fillOpacity={0.2} 
                  strokeWidth={1}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-2 justify-center">
              {analysis.emotionBreakdown.map((emotion, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: emotion.color }} />
                  <span className="text-xs text-gray-600">{emotion.name} {emotion.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-sm p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-gray-400" />
              Frekuensi Kata Kunci
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analysis.wordFrequency} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="word" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563' }} width={60} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="#00158b" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Detected Content */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm p-8 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-lg">Isi Laporan & Deteksi Kata</h2>
            <button
              onClick={() => setShowFullText(!showFullText)}
              className="text-sm text-[#00158b] hover:underline font-medium"
            >
              {showFullText ? 'Sembunyikan' : 'Tampilkan'} Detail
            </button>
          </div>
          <div className={`bg-gray-50 rounded-xl p-6 mb-4 ${showFullText ? '' : 'max-h-32 overflow-hidden relative'}`}>
            <p
              className="text-gray-700 leading-relaxed text-sm"
              dangerouslySetInnerHTML={{ __html: highlightText(content) }}
            />
            {!showFullText && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 mr-2">Kata terdeteksi:</span>
            {analysis.detectedWords.map((word, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-50 text-gray-700 rounded text-xs font-medium"
              >
                {word}
              </span>
            ))}
          </div>
        </motion.div>

        {/* AI Summary & Recommendations */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="font-semibold text-gray-900 mb-3 text-lg">
              Ringkasan Analisis
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {analysis.summary}
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-sm p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="font-semibold text-gray-900 mb-4 text-lg">Rekomendasi Tindakan</h2>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <span className="text-xl opacity-80">{rec.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{rec.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <motion.div
            className="bg-white rounded-2xl shadow-sm p-6 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">Kategori yang Dipilih</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium"
                >
                  {category}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Link
            to="/my-reports"
            className="flex-1 py-3 rounded-xl bg-[#00158b] hover:bg-[#00158b]/90 text-white font-semibold transition-colors text-center flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            <Eye className="w-4 h-4" />
            Lihat Semua Laporan Saya
          </Link>
          <Link
            to="/student-report"
            className="flex-1 py-3 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors text-center shadow-sm border border-gray-200 text-sm"
          >
            Kirim Laporan Lain
          </Link>
        </motion.div>
      </div>
    </div>
  );
}