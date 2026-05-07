import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Send, Shield, Heart, CheckCircle2, AlertCircle, Smile, Frown, Meh, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { createReport } from '../services/reportService';
import { detectKeywords, detectPositiveKeywords } from '../utils/keywords';
import { showToast } from '../utils/toast';
import logoImage from '../../assets/Logo SpeakUp.png';

export function StudentReport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewAnalysis, setPreviewAnalysis] = useState<any>(null);

  const categories = [
    { 
      id: 'verbal', 
      label: 'Verbal', 
      description: 'Ejekan, hinaan, atau kata kasar',
      icon: '💬'
    },
    { 
      id: 'cyber', 
      label: 'Cyberbullying', 
      description: 'Bullying online atau di media sosial',
      icon: '📱'
    },
    { 
      id: 'excluded', 
      label: 'Dikucilkan', 
      description: 'Diabaikan atau diasingkan',
      icon: '🚫'
    },
    { 
      id: 'physical', 
      label: 'Fisik', 
      description: 'Kekerasan atau ancaman fisik',
      icon: '✊'
    },
  ];

  const moods = [
    { id: 'happy', label: 'Baik', icon: Smile, color: 'green' },
    { id: 'neutral', label: 'Biasa', icon: Meh, color: 'yellow' },
    { id: 'sad', label: 'Sedih', icon: Frown, color: 'red' },
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Real-time preview analysis with enhanced keywords
  const analyzeContent = () => {
    if (content.length > 20) {
      setIsAnalyzing(true);
      setTimeout(() => {
        const wordCount = content.split(' ').length;
        const keywords = detectKeywords(content);
        const hasNegativeWords = keywords.length > 0;
        
        setPreviewAnalysis({
          wordCount,
          sentiment: hasNegativeWords ? 'negative' : 'neutral',
          riskIndicator: keywords.length > 5 ? 'high' : keywords.length > 2 ? 'medium' : 'low',
          keywordCount: keywords.length
        });
        setIsAnalyzing(false);
      }, 500);
    } else {
      setPreviewAnalysis(null);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    analyzeContent();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    
    try {
      const report = await createReport(
        content,
        selectedCategories,
        selectedMood,
        user.name,
        user.class || 'Unknown',
        user.id
      );
      
      const frontendKeywords = detectKeywords(content);
      const frontendPositiveKeywords = detectPositiveKeywords(content);
      const negCount = frontendKeywords.length;
      const posCount = frontendPositiveKeywords.length;
      const calculatedRiskLevel = posCount > negCount
        ? 'low'
        : negCount > 5 ? 'critical' : negCount > 2 ? 'high' : negCount > 0 ? 'medium' : 'low';

      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 2500));

      navigate('/analysis-result', { 
        state: { 
          content, 
          categories: selectedCategories,
          mood: selectedMood,
          reportId: report.id,
          riskLevel: calculatedRiskLevel,
          keywords: frontendKeywords,
          positiveKeywords: frontendPositiveKeywords
        } 
      });
    } catch (error) {
      console.error('Failed to submit report', error);
      // Show an error toast or message here in a real app
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-20 md:pt-8 px-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 flex flex-col items-center">
          <img src={logoImage} alt="SpeakUp Logo" className="h-24 md:h-48 object-contain mb-2" />
          <p className="text-gray-800 font-bold text-base md:text-lg">
            Kamu aman di sini. Ceritakan pengalamanmu dengan anonim.
          </p>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">
              Langkah {currentStep} dari {totalSteps}
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"
            />
          </div>
          <div className="flex justify-between mt-3">
            {['Cerita', 'Kategori', 'Perasaan'].map((label, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  idx + 1 < currentStep 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-md' 
                    : idx + 1 === currentStep
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-md'
                    : 'bg-gray-200'
                }`}>
                  {idx + 1 < currentStep ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <span className={`text-sm font-bold ${idx + 1 === currentStep ? 'text-white' : 'text-gray-500'}`}>
                      {idx + 1}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${
                  idx + 1 <= currentStep ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <motion.div 
          className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 md:p-8"
                >
                  <div className="mb-5">
                    <label className="block text-base md:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      Bagaimana perasaanmu hari ini?
                    </label>
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                      {moods.map((mood) => {
                        const Icon = mood.icon;
                        return (
                          <button
                            key={mood.id}
                            type="button"
                            onClick={() => setSelectedMood(mood.id)}
                            className={`p-3 md:p-6 rounded-2xl border-2 transition-all ${
                              selectedMood === mood.id
                                ? `border-${mood.color}-500 bg-${mood.color}-50 shadow-md`
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <Icon className={`w-8 h-8 md:w-12 md:h-12 mx-auto mb-1.5 md:mb-3 ${
                              mood.color === 'green' ? 'text-green-500' :
                              mood.color === 'yellow' ? 'text-yellow-500' : 'text-red-500'
                            }`} />
                            <p className="font-semibold text-gray-900 text-sm md:text-base">{mood.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedMood}
                    className="w-full py-3 rounded-xl font-medium transition-all bg-[#00158b] text-white hover:bg-[#00158b]/90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    Lanjutkan
                  </button>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 md:p-8"
                >
                  {/* Text Area */}
                  <div className="mb-5">
                    <label className="block text-base md:text-lg font-semibold text-gray-900 mb-3">
                      Ceritakan apa yang kamu alami
                    </label>
                    <div className="relative">
                      <textarea
                        value={content}
                        onChange={handleContentChange}
                        placeholder="Tulis apa yang kamu alami… Identitasmu akan tetap rahasia."
                        className="w-full h-64 md:h-80 px-4 md:px-6 py-3 md:py-4 rounded-2xl border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all resize-none text-sm md:text-base"
                        required
                      />
                      {isAnalyzing && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-600">
                        {content.length} karakter • {content.split(' ').filter(w => w).length} kata
                      </p>
                      {previewAnalysis && (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            previewAnalysis.riskIndicator === 'high'
                              ? 'bg-red-100 text-red-700'
                              : previewAnalysis.riskIndicator === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {previewAnalysis.riskIndicator === 'high' ? 'Terdeteksi pola berbahaya' : previewAnalysis.riskIndicator === 'medium' ? 'Terdeteksi pola' : 'Normal'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 md:gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 md:px-6 py-2.5 md:py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
                    >
                      Kembali
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={!content.trim() || content.length < 20}
                      className="flex-1 py-2.5 md:py-3 rounded-xl font-medium transition-all bg-[#00158b] text-white hover:bg-[#00158b]/90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Lanjutkan
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 md:p-8"
                >
                  {/* Categories */}
                  <div className="mb-5 md:mb-8">
                    <label className="block text-sm md:text-lg font-semibold text-gray-900 mb-3">
                      Pilih kategori yang sesuai (opsional)
                    </label>
                    <div className="grid grid-cols-2 gap-2 md:gap-4">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          className={`p-3 md:p-6 rounded-2xl border-2 text-left transition-all ${
                            selectedCategories.includes(category.id)
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="text-xl md:text-3xl mb-1.5">{category.icon}</div>
                              <div className="font-semibold text-gray-900 text-sm md:text-lg mb-1 leading-tight">
                                {category.label}
                              </div>
                              <div className="text-xs text-gray-500 leading-snug line-clamp-2">
                                {category.description}
                              </div>
                            </div>
                            {selectedCategories.includes(category.id) && (
                              <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6 text-blue-600 flex-shrink-0 ml-2" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview Summary */}
                  <div className="mb-4 md:mb-6 p-4 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                      Ringkasan Laporan
                    </h3>
                    <div className="space-y-1.5 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">Perasaan:</span> {
                          moods.find(m => m.id === selectedMood)?.label || '-'
                        }
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Panjang cerita:</span> {content.split(' ').filter(w => w).length} kata
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Kategori:</span> {
                          selectedCategories.length > 0
                            ? selectedCategories.map(id => categories.find(c => c.id === id)?.label).join(', ')
                            : 'Belum dipilih'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 md:gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 md:px-6 py-2.5 md:py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !content.trim()}
                      className="flex-1 py-2.5 md:py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 bg-[#00158b] text-white hover:bg-[#00158b]/90 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Menganalisis...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Kirim Laporan</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Support Messages */}
        <motion.div
          className="mt-6 md:mt-8 grid grid-cols-3 gap-3 md:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white p-3 md:p-6 rounded-2xl border-2 border-pink-200 text-center hover:shadow-lg transition-shadow">
            <Heart className="w-6 h-6 md:w-8 md:h-8 text-pink-500 mx-auto mb-2 md:mb-3" />
            <p className="font-semibold text-gray-900 mb-1 text-xs md:text-sm leading-snug">Kamu tidak sendirian</p>
            <p className="text-xs text-gray-600 hidden sm:block">Kami di sini untuk membantu</p>
          </div>
          <div className="bg-white p-3 md:p-6 rounded-2xl border-2 border-blue-200 text-center hover:shadow-lg transition-shadow">
            <Shield className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mx-auto mb-2 md:mb-3" />
            <p className="font-semibold text-gray-900 mb-1 text-xs md:text-sm leading-snug">Data terlindungi</p>
            <p className="text-xs text-gray-600 hidden sm:block">Privasi dijamin 100%</p>
          </div>
          <div className="bg-white p-3 md:p-6 rounded-2xl border-2 border-green-200 text-center hover:shadow-lg transition-shadow">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-green-500 mx-auto mb-2 md:mb-3" />
            <p className="font-semibold text-gray-900 mb-1 text-xs md:text-sm leading-snug">AI yang membantu</p>
            <p className="text-xs text-gray-600 hidden sm:block">Analisis cepat & akurat</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}