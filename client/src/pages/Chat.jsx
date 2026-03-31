import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2,
  Trash2,
  MessageSquarePlus,
  Zap,
  Paperclip,
  X,
  FileText
} from 'lucide-react';
import { chatService, uploadService } from '../services/api';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import HistorySidebar from '../components/HistorySidebar';
import MarkdownRenderer from '../components/MarkdownRenderer';

// Simple Markdown-like renderer for stability (Safe Mode)
const SafeMarkdown = ({ content }) => {
  if (!content) return null;
  return <MarkdownRenderer content={content} />;
};

// Typewriter effect component for AI responses
const TypewriterText = ({ text = "", speed = 15 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!text) return;
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return <SafeMarkdown content={displayedText} />;
};

const Chat = () => {
  const [input, setInput] = useState('');
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const response = await chatService.getHistory();
      setHistory(response.data.chats || []);
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSelectChat = (chat) => {
    setCurrentChatId(chat._id);
    // Convert backend message format to frontend format if needed
    // Assuming backend messages: { role: 'user'|'ai', text: string }
    setMessages(chat.messages || []);
  };

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setInput('');
    setSelectedFile(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleFileUpload = async () => {
    if (!selectedFile || isLoading) return;

    const fileMessage = {
      role: 'user',
      text: `📎 Uploaded: **${selectedFile.name}**`,
    };
    setMessages(prev => [...prev, fileMessage]);
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const response = await uploadService.uploadFile(selectedFile);
      const { extractedText, answer } = response.data;

      // Optionally show extracted text as a subtle system note
      if (extractedText) {
        setMessages(prev => [...prev, {
          role: 'system',
          text: `📄 Extracted text:\n\n${extractedText}`,
        }]);
      }

      setMessages(prev => [...prev, { role: 'ai', text: answer }]);
    } catch (err) {
      console.error('Upload Error:', err);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: "Sorry, I couldn't process that file. Make sure it's a clear image or a text-based PDF under 5MB.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(userMessage.text, currentChatId);
      const aiMessage = { role: 'ai', text: response.data.reply };
      
      setMessages(prev => [...prev, aiMessage]);
      
      if (!currentChatId && response.data.chatId) {
        setCurrentChatId(response.data.chatId);
        fetchHistory(); // Refresh history to show the new chat
      }
    } catch (err) {
      console.error('Chat Error:', err);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex -m-8 h-[calc(100vh-100px)] overflow-hidden">
      {/* History Sidebar */}
      <HistorySidebar 
        type="chat"
        items={history}
        activeId={currentChatId}
        onSelect={handleSelectChat}
        onNew={startNewChat}
        isLoading={isHistoryLoading}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-surface/10 relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
              <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center shadow-2xl relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-[2rem] animate-ping group-hover:animate-none"></div>
                <Zap className="w-10 h-10 text-primary animate-pulse fill-current" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight">Mentixo AI Assistant</h2>
                <p className="text-text-muted font-medium text-lg">
                  How can I help you excel in your studies today?
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-8">
                {[
                  "Explain quantum physics simply",
                  "Summarize the French Revolution",
                  "Help me solve calculus",
                  "Brainstorm biology topics"
                ].map(suggestion => (
                  <button 
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="p-5 rounded-2xl bg-surface border border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all text-sm font-bold text-text-muted hover:text-white text-left group flex items-center justify-between"
                  >
                    {suggestion}
                    <Sparkles className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-start gap-4",
                  msg.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                {msg.role === 'system' ? (
                  <div className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-text-muted font-mono">
                    <SafeMarkdown content={msg.text} />
                  </div>
                ) : (
                  <>
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                      msg.role === 'user' ? "bg-primary text-white" : "bg-white/5 text-primary border border-white/10"
                    )}>
                      {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 shadow-inner" />}
                    </div>
                    <div className={cn(
                      "max-w-[80%] p-6 rounded-3xl shadow-2xl",
                      msg.role === 'user' 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-surface border border-white/5 rounded-tl-none"
                    )}>
                      {msg.role === 'ai' && i === messages.length - 1 && isLoading ? (
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                        </div>
                      ) : (
                        <SafeMarkdown content={msg.text} />
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 bg-gradient-to-t from-background to-transparent">
          {/* File preview pill */}
          {selectedFile && (
            <div className="max-w-4xl mx-auto mb-3 flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-2xl text-sm text-primary font-medium">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="ml-1 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={handleFileUpload}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-indigo-500 transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyse'}
              </button>
            </div>
          )}

          <form 
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto relative flex items-center gap-4 bg-surface/50 backdrop-blur-3xl border border-white/10 p-2 rounded-[2.5rem] shadow-2xl hover:border-primary/30 transition-all group"
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Paperclip button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-3 ml-2 rounded-2xl text-text-muted hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-40"
              title="Upload image or PDF"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <div className="flex-1 px-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Mentixo AI anything..." 
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-text-muted text-sm font-medium py-3"
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className={cn(
                "p-4 rounded-[2rem] transition-all flex items-center justify-center",
                input.trim() && !isLoading 
                  ? "bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105 active:scale-95" 
                  : "bg-white/5 text-text-muted cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5 fill-current" />
              )}
            </button>
          </form>
          <p className="text-center mt-4 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] opacity-40">
            Mentixo AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
