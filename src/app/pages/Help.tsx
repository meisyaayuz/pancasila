import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, BookOpen, Shield, MessageCircle, FileText, AlertTriangle, ArrowLeft, Lock, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';

interface FAQItem {
  question: string;
  answer: string;
  category: 'umum' | 'pelaporan' | 'privasi' | 'teknis';
}

const studentFAQs: FAQItem[] = [
  {
    question: 'Apa itu SpeakUp?',
    answer: 'SpeakUp adalah platform pelaporan bullying anonim yang memungkinkan siswa melaporkan kasus perundungan secara rahasia dan aman. Laporan akan ditinjau oleh Guru BK yang berwenang.',
    category: 'umum',
  },
  {
    question: 'Apakah identitas saya benar-benar aman?',
    answer: 'Ya! SpeakUp dirancang dengan prinsip anonimitas penuh. Identitas pelapor dilindungi dengan enkripsi end-to-end. Guru BK hanya melihat inisial dan kelas Anda, bukan nama lengkap. Data Anda tidak akan dibagikan ke pihak manapun tanpa persetujuan Anda.',
    category: 'privasi',
  },
  {
    question: 'Bagaimana cara membuat laporan?',
    answer: 'Klik menu "Buat Laporan" di sidebar, lalu: (1) Pilih kategori bullying yang terjadi (verbal, fisik, sosial, cyber), (2) Ceritakan kronologi kejadian secara detail, (3) Pilih emoji yang menggambarkan perasaan Anda, (4) Klik "Kirim Laporan". Laporan Anda akan langsung terkirim ke Guru BK.',
    category: 'pelaporan',
  },
  {
    question: 'Bisakah saya melihat status laporan saya?',
    answer: 'Tentu! Kunjungi menu "Laporan Saya" untuk melihat semua laporan yang pernah Anda kirim. Anda bisa melihat status terbaru: Baru (menunggu ditinjau), Ditinjau (sedang diproses Guru BK), atau Selesai (sudah ditangani).',
    category: 'pelaporan',
  },
  {
    question: 'Bagaimana cara chat dengan Guru BK?',
    answer: 'Di halaman "Laporan Saya", klik tombol "Chat Guru BK" pada laporan yang ingin Anda diskusikan. Chat bersifat pribadi dan aman. Guru BK tidak akan mengetahui nama asli Anda kecuali Anda memilih untuk memberitahunya.',
    category: 'pelaporan',
  },
  {
    question: 'Apa yang terjadi jika Guru BK meminta pertemuan?',
    answer: 'Guru BK mungkin mengirim permintaan pertemuan untuk membahas laporan Anda lebih lanjut. Anda bisa menerima atau menolak permintaan tersebut. Pertemuan bersifat rahasia dan bertujuan untuk membantu menyelesaikan masalah yang Anda hadapi.',
    category: 'pelaporan',
  },
  {
    question: 'Apakah saya bisa menghapus laporan?',
    answer: 'Demi keamanan dan integritas data, laporan yang sudah dikirim tidak bisa dihapus. Namun, Anda bisa menghubungi Guru BK melalui fitur chat jika ingin menambahkan atau mengubah informasi.',
    category: 'teknis',
  },
  {
    question: 'Data apa saja yang disimpan oleh SpeakUp?',
    answer: 'SpeakUp menyimpan: isi laporan, kategori, mood/perasaan, waktu pelaporan, riwayat chat, dan inisial pelapor. Semua data dienkripsi dan hanya bisa diakses oleh Guru BK yang berwenang. Kami tidak menyimpan data browsing atau lokasi GPS Anda.',
    category: 'privasi',
  },
  {
    question: 'Bagaimana jika saya mengalami bullying darurat?',
    answer: 'Jika Anda berada dalam situasi darurat atau merasa terancam keselamatannya, segera hubungi: (1) Guru BK langsung, (2) Orang tua/wali, (3) Hotline perlindungan anak: 129, (4) Polisi: 110. SpeakUp adalah alat pelaporan, bukan pengganti bantuan darurat.',
    category: 'umum',
  },
];

const teacherFAQs: FAQItem[] = [
  {
    question: 'Bagaimana cara mengelola laporan yang masuk?',
    answer: 'Di Dashboard, Anda bisa melihat semua laporan yang masuk beserta tingkat risiko, kategori, dan status. Klik laporan untuk melihat detail, mengubah status, menambahkan catatan internal, atau memulai chat dengan siswa pelapor.',
    category: 'umum',
  },
  {
    question: 'Apa arti tingkat risiko pada laporan?',
    answer: 'Sistem AI SpeakUp menganalisis setiap laporan dan memberikan tingkat risiko: (1) Rendah - monitoring biasa, (2) Sedang - perlu perhatian, (3) Tinggi - perlu penanganan prioritas, (4) Kritis - memerlukan tindakan segera. Skor ini berdasarkan kata kunci dan analisis sentimen.',
    category: 'teknis',
  },
  {
    question: 'Bagaimana cara mengajukan pertemuan dengan siswa?',
    answer: 'Di halaman detail laporan, klik "Hubungi Siswa" pada panel aksi cepat. Isi formulir dengan tanggal, waktu, lokasi, dan pesan. Siswa akan menerima notifikasi dan bisa menerima/menolak permintaan.',
    category: 'pelaporan',
  },
  {
    question: 'Apakah identitas siswa pelapor terlindungi?',
    answer: 'Ya. Anda hanya melihat inisial dan kelas siswa pelapor. Identitas lengkap dilindungi oleh sistem. Pendekatan ini mendorong siswa untuk melapor tanpa takut mendapat perlakuan tidak menyenangkan.',
    category: 'privasi',
  },
  {
    question: 'Bagaimana cara mengekspor data laporan?',
    answer: 'Di Dashboard, klik tombol "Export Data" di pojok kanan atas. Anda bisa mengekspor data dalam format PDF atau Excel dengan filter berdasarkan tanggal, status, dan tingkat risiko.',
    category: 'teknis',
  },
  {
    question: 'Bagaimana sistem AI menganalisis laporan?',
    answer: 'Sistem AI SpeakUp menggunakan Natural Language Processing untuk: (1) Mendeteksi kata kunci terkait bullying, (2) Menganalisis sentimen emosional pelapor, (3) Menentukan tingkat risiko berdasarkan konten, (4) Menghasilkan skor confidence. AI membantu prioritisasi, namun keputusan akhir tetap ada di tangan Guru BK.',
    category: 'teknis',
  },
  {
    question: 'Bagaimana jika ada laporan kritis?',
    answer: 'Laporan dengan tingkat risiko "Kritis" atau "Tinggi" akan muncul di alert mendesak di Dashboard. Anda harus segera meninjau laporan ini, memulai komunikasi dengan siswa, dan jika perlu, mengkoordinasikan dengan pihak sekolah yang lebih tinggi.',
    category: 'pelaporan',
  },
];

const categoryLabels: Record<string, string> = {
  umum: 'Umum',
  pelaporan: 'Pelaporan',
  privasi: 'Privasi & Keamanan',
  teknis: 'Teknis',
};

const categoryIcons: Record<string, React.ReactNode> = {
  umum: <HelpCircle className="w-4 h-4" />,
  pelaporan: <FileText className="w-4 h-4" />,
  privasi: <Shield className="w-4 h-4" />,
  teknis: <BookOpen className="w-4 h-4" />,
};

export function Help() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const faqs = user?.role === 'teacher' ? teacherFAQs : studentFAQs;

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(faqs.map((f) => f.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-20 md:pt-8 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Pusat Bantuan</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Temukan jawaban dan panduan penggunaan SpeakUp
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pertanyaan atau topik..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm shadow-sm"
          />
        </div>

        {/* Privacy & Anonymity Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 mb-6 text-white shadow-lg shadow-purple-500/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg mb-2">🔒 Kerahasiaan & Anonimitas Terjamin</h2>
              <p className="text-sm text-white/90 leading-relaxed mb-3">
                SpeakUp dirancang dengan prinsip <strong>anonimitas penuh</strong> untuk melindungi identitas pelapor.
                Semua data dienkripsi end-to-end dan hanya bisa diakses oleh Guru BK yang berwenang.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium">Enkripsi End-to-End</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  <Eye className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium">Identitas Tersembunyi</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium">Data Tidak Dibagikan</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-[#00158b] text-white shadow-md shadow-[#00158b]/20'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {cat !== 'all' && categoryIcons[cat]}
              {cat === 'all' ? 'Semua' : categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3 mb-8">
          {filteredFAQs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ditemukan</h3>
              <p className="text-gray-600 text-sm">
                Coba cari dengan kata kunci yang berbeda
              </p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-start gap-3 text-left"
                >
                  <span className={`mt-0.5 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                    faq.category === 'privasi' ? 'bg-green-100 text-green-700' :
                    faq.category === 'pelaporan' ? 'bg-blue-100 text-blue-700' :
                    faq.category === 'teknis' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {categoryLabels[faq.category]}
                  </span>
                  <span className="flex-1 font-medium text-gray-900 text-sm">
                    {faq.question}
                  </span>
                  {expandedIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 pt-0 ml-[4.5rem]">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        {/* Emergency Contact */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border-2 border-red-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-900 mb-2">⚠️ Dalam Situasi Darurat?</h3>
              <p className="text-sm text-red-700 mb-3">
                Jika Anda atau seseorang dalam bahaya segera, jangan hanya mengandalkan aplikasi ini. Hubungi:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-red-200">
                  <span className="text-lg">📞</span>
                  <div>
                    <p className="text-xs text-gray-500">Hotline Perlindungan Anak</p>
                    <p className="font-bold text-red-700">129</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-red-200">
                  <span className="text-lg">🚔</span>
                  <div>
                    <p className="text-xs text-gray-500">Kepolisian</p>
                    <p className="font-bold text-red-700">110</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Masih Butuh Bantuan?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Jika Anda tidak menemukan jawaban yang dicari, hubungi tim support kami:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>📧</span>
                  <span>support@speakup.sch.id</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>📱</span>
                  <span>Hubungi Guru BK secara langsung di sekolah</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
