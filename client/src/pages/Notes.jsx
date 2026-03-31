import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Search,
  BookOpen,
  Sparkles,
  Loader2,
  Zap,
  Download,
  Share2
} from 'lucide-react';
import { notesService } from '../services/api';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import NotesViewer from '../components/NotesViewer';
import HistorySidebar from '../components/HistorySidebar';

const Notes = () => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const response = await notesService.getHistory();
      setHistory(response.data.notes || []);
    } catch (err) {
      console.error('Failed to fetch notes history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSelectNote = (note) => {
    setActiveNote(note.content);
    setTopic(note.topic);
  };

  const startNewNote = () => {
    setActiveNote(null);
    setTopic('');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setActiveNote(null);

    try {
      const response = await notesService.generateNotes(topic);
      setActiveNote(response.data.notes);
      fetchHistory(); // Refresh history list
    } catch (err) {
      console.error('Notes API Error:', err);
      setActiveNote("# Error\nFailed to generate notes. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex -m-8 h-[calc(100vh-100px)] overflow-hidden">
      <HistorySidebar 
        type="note"
        items={history}
        activeId={activeNote?._id}
        onSelect={handleSelectNote}
        onNew={startNewNote}
        isLoading={isHistoryLoading}
      />

      <div className="flex-1 flex flex-col h-full bg-surface/10 relative overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-5xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Study Notes</h1>
              <p className="text-text-muted mt-2 font-medium">Generate comprehensive study materials in seconds.</p>
            </div>
            <div className="hidden sm:block">
              <Zap className="w-12 h-12 text-primary opacity-10 rotate-12" />
            </div>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleGenerate} className="flex gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What would you like to learn today? (e.g. 'Photosynthesis')" 
                  className="w-full bg-surface border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-white text-lg font-medium focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all shadow-2xl placeholder-text-muted/50"
                />
              </div>
              <button 
                type="submit"
                disabled={isGenerating || !topic.trim()}
                className={cn(
                  "px-10 rounded-[2.5rem] font-black flex items-center gap-3 transition-all shrink-0 uppercase tracking-widest text-sm",
                  topic.trim() && !isGenerating 
                    ? "bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95" 
                    : "bg-surface text-text-muted border border-white/5 cursor-not-allowed"
                )}
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 fill-current" />}
                Generate
              </button>
            </form>

            <div className="min-h-[600px] bg-surface/30 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden relative shadow-inner">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center space-y-6"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-2xl"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="w-8 h-8 text-primary animate-pulse fill-current" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-white text-xl tracking-tight">Mentixo is drafting...</p>
                      <p className="text-sm text-text-muted mt-2 font-medium">Researching and organizing facts for your notes.</p>
                      <div className="mt-6 flex items-center justify-center gap-1.5">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:calc(var(--delay)*100ms)]" style={{'--delay': i}}></div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : activeNote ? (
                  <NotesViewer notes={activeNote} topic={topic} />
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center p-12"
                  >
                    <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      <BookOpen className="w-12 h-12 text-text-muted opacity-20 group-hover:text-primary transition-all group-hover:scale-110" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Ready to master a new topic?</h2>
                    <p className="text-text-muted max-w-sm font-medium">
                      Enter a subject above and Mentixo AI will generate structured notes, research points, and simplified summaries for you.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-lg">
                      {["Organic Chemistry", "Middle Ages", "Macroeconomics", "Machine Learning"].map(t => (
                        <button 
                          key={t}
                          onClick={() => setTopic(t)}
                          className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 text-xs font-bold text-text-muted hover:text-white transition-all text-left flex items-center gap-3 uppercase tracking-widest"
                        >
                          <Zap className="w-4 h-4 text-primary" />
                          {t}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
