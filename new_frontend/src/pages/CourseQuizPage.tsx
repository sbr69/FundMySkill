import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuiz, useSubmitQuiz } from '../hooks/useApi';

// Fallback options for when API is unavailable
const fallbackOptions = [
  { letter: 'A', text: 'The Semantic Parser Interface', isCorrect: true },
  { letter: 'B', text: 'Probabilistic Logic Engines', isCorrect: false },
  { letter: 'C', text: 'Neural-Symbolic Mapping Layer', isCorrect: false },
  { letter: 'D', text: 'Hierarchical Temporal Memory Units', isCorrect: false },
];

export function CourseQuizPage() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const [startTime] = useState(Date.now());

  // Fetch quiz from API
  const { data: quizData, loading } = useQuiz(quizId || '');
  const { submit, submitting, result } = useSubmitQuiz();

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Use API data or fallback
  const questions = quizData?.questions || [
    {
      id: 'q1',
      question: 'Which architectural component is primarily responsible for the "Symbolic Grounding" problem in the context of hybrid AI systems?',
      options: fallbackOptions,
      points: 2.0,
    }
  ];

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIdx];
  const options = currentQuestion?.options || fallbackOptions;

  // Build questions map for sidebar
  const questionsMap = questions.map((q: { id: string }, idx: number) => ({
    id: idx + 1,
    questionId: q.id,
    status: answers[q.id] ? 'attempted' : idx < currentQuestionIdx ? 'skipped' : 'not_visited',
  }));

  const handleSelectAnswer = (letter: string) => {
    setSelectedAnswer(letter);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: letter,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedAnswer(answers[questions[currentQuestionIdx + 1]?.id] || null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
      setSelectedAnswer(answers[questions[currentQuestionIdx - 1]?.id] || null);
    }
  };

  const handleSubmit = async () => {
    if (!quizId) return;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    try {
      await submit(quizId, answers, timeTaken);
      // Result will be available after submission
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    }
  };

  const handleClearAnswer = () => {
    setSelectedAnswer(null);
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion.id];
      return newAnswers;
    });
  };

  // Show result screen if quiz is submitted
  if (result) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex items-center justify-center font-body">
        <div className="bg-white rounded-3xl p-12 shadow-xl max-w-lg w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
          </div>
          <h1 className="text-3xl font-black text-[#2e3440] mb-4">Quiz Completed!</h1>
          <p className="text-lg text-[#4c566a] mb-8">
            You scored <span className="font-black text-[#5e81ac]">{result.correct_count}</span> out of <span className="font-black">{result.total_questions}</span> questions
          </p>
          <div className="text-5xl font-black text-[#5e81ac] mb-8">{Math.round(result.accuracy_percentage)}%</div>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-[#5e81ac] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#4c566a] transition-colors"
          >
            Continue Learning
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex items-center justify-center">
        <div className="animate-pulse space-y-6 w-full max-w-3xl px-6">
          <div className="h-8 bg-surface-container-high rounded w-1/2"></div>
          <div className="h-24 bg-surface-container-high rounded-2xl"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-surface-container-high rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col font-body text-[#2e3440] selection:bg-[#5e81ac]/20 overflow-x-hidden">
      
      {/* Top Banner/Nav - Exam Software Style */}
      <nav className="sticky top-0 z-40 bg-[#fafafc] border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
            title="Exit Exam"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-black text-[#5e81ac] uppercase tracking-[0.1em]">Module 4: Cognitive Architectures</h1>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <p className="text-sm font-black text-[#4c566a]/80 tracking-widest hidden sm:block">Weekly Synthesis Quiz</p>
          </div>
        </div>
        
        {/* Timer Widget */}
        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border shadow-sm ${timeRemaining < 60 ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
          <span className={`material-symbols-outlined text-[18px] ${timeRemaining < 60 ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>timer</span>
          <span className={`text-base font-black font-mono tracking-widest ${timeRemaining < 60 ? 'text-red-600' : 'text-amber-600'}`}>{formatTime(timeRemaining)}</span>
        </div>
      </nav>

      {/* Main Content Layout */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 relative pb-24">
        
        {/* Left Sidebar: Question Map */}
        <aside className="lg:col-span-3 border-r border-slate-200/60 bg-white flex flex-col h-full overflow-hidden hidden lg:flex">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#4c566a]/70 mb-4 text-center">Question Map</h3>
            
            {/* Legend Map */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-[4px] bg-green-500 shadow-sm border border-green-600/20"></div>
                <span className="text-[10px] uppercase font-bold text-[#4c566a]">Attempted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-[4px] bg-red-400 shadow-sm border border-red-500/20"></div>
                <span className="text-[10px] uppercase font-bold text-[#4c566a]">Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-[4px] bg-yellow-400 shadow-sm border border-yellow-500/20"></div>
                <span className="text-[10px] uppercase font-bold text-[#4c566a]">Skipped</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-[4px] bg-slate-100 border border-slate-200"></div>
                <span className="text-[10px] uppercase font-bold text-[#4c566a]">Not Visited</span>
              </div>
            </div>
          </div>
          
          {/* Question Grid Map */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {questionsMap.map((q, idx) => {
                let boxClasses = "bg-slate-100 border-slate-200 text-slate-400"; // not_visited
                if (q.status === 'attempted') {
                  boxClasses = "bg-green-500 border-green-600/30 text-white font-black shadow-sm";
                } else if (q.status === 'skipped') {
                  boxClasses = "bg-yellow-400 border-yellow-500/30 text-yellow-900 font-black shadow-sm";
                } else if (q.status === 'marked') {
                  boxClasses = "bg-red-400 border-red-500/30 text-white font-black shadow-sm";
                }

                // Current question highlight
                const isCurrent = idx === currentQuestionIdx;
                if (isCurrent) {
                  // Add an explicit ring for current question
                  boxClasses += " ring-2 ring-offset-2 ring-[#5e81ac]";
                }

                return (
                  <button 
                    key={q.id}
                    className={`w-full aspect-square flex items-center justify-center rounded-lg text-xs transition-all border font-bold hover:brightness-95 active:scale-95 ${boxClasses}`}
                  >
                    {q.id}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Center Area: Question & Options */}
        <div className="lg:col-span-9 flex flex-col h-full bg-[#fafafc] overflow-y-auto">
          <div className="flex-1 p-6 md:p-10 lg:px-16 lg:py-12 max-w-5xl mx-auto w-full">
            
            {/* The Question */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f0f7ff] rounded-full border border-[#5e81ac]/20 text-[#5e81ac]">
                  <span className="material-symbols-outlined text-[16px]">psychology_alt</span>
                  <span className="text-[11px] font-black tracking-[0.15em] uppercase">Question {String(currentQuestionIdx + 1).padStart(2, '0')} of {totalQuestions}</span>
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-[#4c566a]/50">Points: {currentQuestion?.points || 2.0}</p>
              </div>
              <h2 className="text-xl md:text-2xl font-bold font-body text-[#2e3440] leading-relaxed">
                {currentQuestion?.question || 'Loading question...'}
              </h2>
            </div>

            {/* Options List */}
            <div className="space-y-4">
              {options.map((option: { letter: string; text: string }) => {
                const isSelected = selectedAnswer === option.letter;
                
                // Active/Inactive classes mapping
                // Using font-body exclusively, removing the blocky uppercase font
                let containerClasses = "bg-white border-2 border-slate-200/70 hover:border-[#5e81ac]/30 hover:shadow-sm";
                let textClasses = "text-[#4c566a] font-medium font-body";
                let letterBoxClasses = "bg-slate-50 border border-slate-200 text-[#4c566a]/60";
                
                if (isSelected) {
                   containerClasses = "bg-[#f0f7ff]/50 border-2 border-[#5e81ac] shadow-[0_4px_20px_rgba(94,129,172,0.1)]";
                   textClasses = "text-[#2e3440] font-bold font-body";
                   letterBoxClasses = "bg-[#5e81ac] text-white border-transparent shadow-sm";
                }

                return (
                  <button
                    key={option.letter}
                    onClick={() => handleSelectAnswer(option.letter)}
                    className={`w-full flex items-center p-4 md:p-5 rounded-2xl text-left transition-all duration-200 active:scale-[0.99] cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-[#5e81ac]/20 ${containerClasses}`}
                  >
                    <div className="flex items-center gap-5 w-full">
                      <span className={`w-10 h-10 shrink-0 rounded-[10px] flex items-center justify-center font-black text-sm transition-colors ${letterBoxClasses}`}>
                        {option.letter}
                      </span>
                      <span className={`text-base flex-1 transition-colors ${textClasses}`}>
                        {option.text}
                      </span>
                      {/* Check/Radio Indicator */}
                      <div className={`w-6 h-6 shrink-0 rounded-full border-2 transition-colors flex items-center justify-center ${
                        isSelected ? 'border-[#5e81ac]' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-3 h-3 bg-[#5e81ac] rounded-full"></div>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
          </div>
        </div>
      </main>

      {/* Sticky Exam Action Footer */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-slate-200/80 z-50 flex-shrink-0">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIdx === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 px-6 py-3.5 rounded-xl font-bold text-[#4c566a] hover:bg-slate-50 transition-colors uppercase tracking-widest text-xs disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              Previous
            </button>
            <button
              onClick={handleClearAnswer}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[#4c566a] hover:bg-red-50 hover:text-red-600 transition-colors uppercase tracking-widest text-xs border border-transparent hover:border-red-100"
            >
              Clear Answer
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {currentQuestionIdx === totalQuestions - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black shadow-md hover:shadow-lg transition-all uppercase tracking-widest text-xs transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-[#5e81ac] hover:bg-[#4c566a] text-white rounded-xl font-black shadow-md hover:shadow-lg transition-all uppercase tracking-widest text-xs transform hover:-translate-y-0.5"
              >
                Save & Next
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            )}
          </div>

        </div>
      </footer>
    </div>
  );
}
