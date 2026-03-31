import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Brain, 
  Trophy, 
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  PenTool,
  Clock,
  Layout
} from 'lucide-react';
import { quizService } from '../services/api';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import HistorySidebar from '../components/HistorySidebar';

const Quiz = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizId, setQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const response = await quizService.getHistory();
      setHistory(response.data.quizzes || []);
    } catch (err) {
      console.error('Failed to fetch quiz history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const startNewQuiz = () => {
    setQuestions([]);
    setQuizId(null);
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setTopic('');
  };

  const handleSelectQuiz = (quiz) => {
    // If it's an old quiz, we just show the score/result if available
    // For now, let's just reset and show the topic in the input
    setTopic(quiz.topic);
    setDifficulty(quiz.difficulty || 'medium');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setResult(null);
    setQuestions([]);

    try {
      const response = await quizService.generateQuiz(topic, difficulty);
      setQuestions(response.data.questions);
      setQuizId(response.data.quizId);
      setCurrentQuestion(0);
      setAnswers({});
    } catch (err) {
      console.error('Quiz Error:', err);
      // Fallback/Mock for testing
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleSubmit = async () => {
    try {
      // Map numeric keys to an array of answers
      const answerList = Object.keys(answers).sort().map(key => answers[key]);
      const response = await quizService.submitQuiz(quizId, answerList);
      setResult(response.data);
      fetchHistory(); // Refresh history with new score
    } catch (err) {
      console.error('Submit Error:', err);
    }
  };

  return (
    <div className="flex -m-8 h-[calc(100vh-100px)] overflow-hidden">
      <HistorySidebar 
        type="quiz"
        items={history}
        activeId={quizId}
        onSelect={handleSelectQuiz}
        onNew={startNewQuiz}
        isLoading={isHistoryLoading}
      />

      <div className="flex-1 flex flex-col h-full bg-surface/10 relative overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {!questions.length && !result ? (
            <div className="space-y-10">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tight">Quiz Arena</h1>
                  <p className="text-text-muted mt-2 font-medium">Test your knowledge and track your mastery.</p>
                </div>
                <PenTool className="w-12 h-12 text-primary opacity-20" />
              </div>

              <div className="p-10 rounded-[3rem] bg-surface/50 backdrop-blur-3xl border border-white/5 shadow-2xl space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em] ml-1">Knowledge Topic</label>
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter topic to be tested on..." 
                    className="w-full bg-surface border border-white/10 rounded-3xl py-5 px-8 text-white text-lg font-black focus:border-primary/50 transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em] ml-1">Difficulty Level</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={cn(
                          "py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border",
                          difficulty === level 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                            : "bg-surface border-white/5 text-text-muted hover:border-primary/30"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={!topic.trim() || isGenerating}
                  className={cn(
                    "w-full py-6 rounded-[2.5rem] font-black text-lg transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] shadow-2xl",
                    topic.trim() && !isGenerating 
                      ? "bg-primary text-white hover:scale-[1.01] active:scale-[0.99] shadow-primary/30" 
                      : "bg-white/5 text-text-muted cursor-not-allowed border border-white/5"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 fill-current" />
                      Start Quiz
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : result ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-10 rounded-[3rem] bg-surface/50 backdrop-blur-3xl border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] text-center space-y-8"
            >
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner relative group">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-[2rem] animate-ping"></div>
                <Trophy className="w-10 h-10 text-emerald-500 relative z-10" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight">Quiz Complete!</h2>
                <p className="text-text-muted font-medium uppercase tracking-[0.2em] text-xs">Knowledge Verified</p>
              </div>

              <div className="flex items-center justify-center gap-12 py-6">
                <div className="text-center">
                  <p className="text-4xl font-black text-white">{result.score}/{result.total}</p>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-2">Score</p>
                </div>
                <div className="w-px h-12 bg-white/5"></div>
                <div className="text-center">
                  <p className="text-4xl font-black text-primary">{result.percentage}%</p>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-2">Accuracy</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center gap-4 text-left">
                <Zap className="w-8 h-8 text-primary shadow-2xl shrink-0 fill-current" />
                <p className="text-sm text-text-muted font-medium">
                  {result.percentage >= 80 ? 'Mastery achieved! You have a strong grasp of this topic.' : 
                   result.percentage >= 50 ? 'Good progress! A bit more study on the key concepts will get you to mastery.' :
                   'Keep learning! Try reviewing the study notes then come back for another attempt.'}
                </p>
              </div>

              <button 
                onClick={startNewQuiz}
                className="w-full py-5 bg-white text-background font-black rounded-[2rem] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-sm shadow-2xl"
              >
                Try New Topic
              </button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                   <Layout className="w-5 h-5 text-primary" />
                   <p className="text-xs font-black text-white uppercase tracking-[0.2em]">Question {currentQuestion + 1} of {questions.length}</p>
                </div>
                <div className="flex gap-1">
                   {questions.map((_, i) => (
                     <div key={i} className={cn(
                       "w-6 h-1 rounded-full bg-white/5",
                       i <= currentQuestion ? "bg-primary" : ""
                     )}></div>
                   ))}
                </div>
              </div>

              <motion.div 
                key={currentQuestion}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="p-10 rounded-[3rem] bg-surface/50 backdrop-blur-3xl border border-white/10 shadow-2xl space-y-8 min-h-[400px]"
              >
                <h2 className="text-2xl font-black text-white leading-tight tracking-tight">{questions[currentQuestion].question}</h2>
                <div className="grid grid-cols-1 gap-4">
                  {questions[currentQuestion].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(option)}
                      className={cn(
                        "w-full p-6 rounded-2xl text-left font-bold transition-all border flex items-center justify-between group",
                        answers[currentQuestion] === option
                          ? "bg-primary/20 border-primary text-white shadow-lg"
                          : "bg-white/5 border-white/5 text-text-muted hover:border-white/20 hover:text-white"
                      )}
                    >
                      <span>{option}</span>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        answers[currentQuestion] === option 
                          ? "bg-primary border-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                          : "border-white/10 group-hover:border-primary/50"
                      )}>
                        {answers[currentQuestion] === option && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>

              <div className="flex justify-between items-center px-4">
                <button 
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  className="px-8 py-4 rounded-2xl bg-white/5 text-text-muted text-sm font-bold uppercase tracking-widest disabled:opacity-0 transition-all border border-white/5"
                >
                  Previous
                </button>
                {currentQuestion === questions.length - 1 ? (
                  <button 
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length < questions.length}
                    className={cn(
                      "px-10 py-4 rounded-[2rem] bg-emerald-500 text-white font-black uppercase tracking-widest text-sm shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50",
                    )}
                  >
                    Finish Quiz
                  </button>
                ) : (
                  <button 
                    onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                    disabled={!answers[currentQuestion]}
                    className="px-10 py-4 bg-primary text-white font-black rounded-[2rem] flex items-center gap-2 group shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    Next Question
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
