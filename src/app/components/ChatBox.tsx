import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { sendMessage, markMessagesAsRead, type ChatMessage, type Report } from '../services/reportService';
import { motion, AnimatePresence } from 'motion/react';

interface ChatBoxProps {
  report: Report;
  userId: string;
  userName: string;
  userRole: 'student' | 'counselor';
  onMessagesUpdate: () => void;
}

export function ChatBox({ report, userId, userName, userRole, onMessagesUpdate }: ChatBoxProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const messages = report.messages || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Mark messages as read when component mounts or messages update
  useEffect(() => {
    if (messages.length > 0) {
      const markAsRead = async () => {
        try {
          await markMessagesAsRead(report.id, userId);
          onMessagesUpdate();
        } catch (error) {
          console.error('Failed to mark messages as read', error);
        }
      };
      markAsRead();
    }
  }, [messages.length, report.id, userId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await sendMessage(report.id, userId, userName, userRole, message.trim());
      setMessage('');
      onMessagesUpdate();

      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[350px] sm:h-[450px] md:h-[600px]">
      {/* Header */}
      <div className="bg-[#00158b] p-3 sm:p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div className="flex-1 text-white min-w-0">
            <h3 className="font-semibold text-sm sm:text-lg truncate">Chat dengan {userRole === 'student' ? 'Guru BK' : `Siswa ${report.studentInitial}`}</h3>
            <p className="text-[10px] sm:text-xs text-blue-100">
              {messages.length === 0 ? 'Belum ada pesan' : `${messages.length} pesan`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white min-h-0"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <MessageCircle className="w-7 h-7 sm:w-10 sm:h-10 text-blue-400" />
            </div>
            <p className="text-gray-600 font-medium text-sm mb-1 sm:mb-2">Belum ada percakapan</p>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md">
              {userRole === 'counselor' 
                ? 'Mulai percakapan dengan mengirim pesan kepada siswa.'
                : 'Guru BK siap membantu Anda. Jangan ragu untuk mengobrol.'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => {
              const isOwnMessage = msg.senderId === userId;
              const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-1.5 sm:gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  {showAvatar ? (
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white flex-shrink-0 ${
                      msg.senderRole === 'counselor' 
                        ? 'bg-purple-500' 
                        : 'bg-[#00158b]'
                    }`}>
                      {msg.senderRole === 'counselor' ? '👨‍🏫' : '👤'}
                    </div>
                  ) : (
                    <div className="w-6 sm:w-8" /> // Spacer for alignment
                  )}

                  {/* Message Bubble */}
                  <div className={`max-w-[75%] sm:max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                    {showAvatar && (
                      <p className={`text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 px-1.5 sm:px-2 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                        {msg.senderRole === 'student' ? 'Siswa (Anonim)' : 'Guru BK'}
                      </p>
                    )}
                    <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 ${
                      isOwnMessage 
                        ? 'bg-[#00158b] text-white rounded-br-sm' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                    }`}>
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                    </div>
                    <p className={`text-[9px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 px-1.5 sm:px-2 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      {formatMessageTime(msg.timestamp)}
                      {isOwnMessage && msg.isRead && ' • Dibaca'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form - Responsive */}
      <form onSubmit={handleSendMessage} className="p-2 sm:p-3 md:p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0" style={{ position: 'relative', zIndex: 10 }}>
        <div className="flex items-end gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Ketik pesan Anda di sini..."
              className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none text-sm"
              rows={1}
              style={{ maxHeight: '80px' }}
            />
            <p className="hidden sm:block text-[10px] text-gray-500 mt-0.5 ml-1">
              💡 Shift+Enter untuk baris baru
            </p>
          </div>
          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className="px-3 py-2 sm:px-5 sm:py-3 md:px-6 md:py-3 bg-[#00158b] text-white rounded-xl font-medium hover:bg-[#00158b]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline text-sm">Kirim</span>
          </button>
        </div>
      </form>
    </div>
  );
}
