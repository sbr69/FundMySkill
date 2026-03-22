import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fallbackCourses } from './CourseCataloguePage';
import { useCourse, useCourseProgress, useAiTutor, useCompleteLecture, useGenerateQuiz } from '../hooks/useApi';

export function LearningInterfacePage() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const [isAiTutorOpen, setIsAiTutorOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // Fetch course and progress from API
  const { data: apiCourse, loading: courseLoading } = useCourse(courseId || '');
  const { data: progress, loading: progressLoading } = useCourseProgress(courseId || '');
  const { complete: completeLecture, completing } = useCompleteLecture();
  const { generate: generateQuiz, generating: generatingQuiz } = useGenerateQuiz();

  // AI Tutor integration
  const lectureId = `${courseId}-${moduleId}-${lessonId}`;
  const { messages, suggestedPrompts, sending, sendMessage } = useAiTutor(lectureId);

  // Fallback course
  const fallbackCourse = fallbackCourses.find((c) => c.id === courseId) || fallbackCourses[0];
  const course = apiCourse || fallbackCourse;

  // Get current module and lecture info
  const currentModule = progress?.modules?.[parseInt(moduleId || '1') - 1];
  const currentLecture = currentModule?.lectures?.[parseInt(lessonId || '1') - 1];

  // Calculate progress
  const progressPercentage = progress?.progress_percentage ?? 62;
  const completedLectures = progress?.completed_lectures ?? 12;
  const totalLectures = progress?.total_lectures ?? 18;

  const handleSendMessage = async () => {
    if (!chatInput.trim() || sending) return;
    const message = chatInput;
    setChatInput('');
    await sendMessage(message);
  };

  const handleGenerateQuiz = async () => {
    if (generatingQuiz) return;
    try {
      const quiz = await generateQuiz(lectureId);
      navigate(`/quiz/${quiz.quiz_id}`);
    } catch {
      navigate('/quiz/ai-generated');
    }
  };

  const loading = courseLoading || progressLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex items-center justify-center">
        <div className="animate-pulse space-y-6 w-full max-w-5xl px-6">
          <div className="aspect-video w-full rounded-[2rem] bg-surface-container-high"></div>
          <div className="h-8 bg-surface-container-high rounded w-3/4"></div>
          <div className="h-4 bg-surface-container-high rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col font-body relative overflow-x-hidden">
      {/* Top Banner/Nav */}
      <nav className="sticky top-0 z-40 bg-[#fafafc]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(`/insider/${courseId}`)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-[#2e3440] transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-xs font-black text-[#5e81ac] uppercase tracking-[0.2em]">{course?.title || "Applied Machine Learning"}</h1>
            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
            <p className="text-xs font-black text-[#4c566a]/60 tracking-widest uppercase">Module {moduleId || 3} • Lesson {lessonId || 1}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAiTutorOpen(!isAiTutorOpen)}
          className={`px-5 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all flex items-center gap-2 ${
            isAiTutorOpen 
              ? 'bg-[#5e81ac] text-white shadow-md' 
              : 'text-[#4c566a] hover:bg-slate-100/80 hover:text-[#5e81ac]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          {isAiTutorOpen ? 'Close Assistant' : 'AI Assistant'}
        </button>
      </nav>

      {/* Main Content Area */}
      <div className={`flex-1 p-6 lg:px-12 lg:py-8 transition-all duration-500 pb-20 ${isAiTutorOpen ? 'lg:pr-[380px]' : ''}`}>
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Video Player Section */}
          <div className="relative group w-full">
            <div className="aspect-video w-full rounded-[2rem] overflow-hidden bg-slate-900 shadow-xl relative">
              <img
                alt="Lesson Video Thumbnail"
                className="w-full h-full object-cover opacity-60"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNc_Fbc_0-KtUCIE57beL2PlwhivL0Pn_IEclIa8_KhH_8JXqE0jeOnE3tKMMLzIVLeWo9S7p6JlfGPRorn_TkIN_jOoMfZkK-XttYZdj_mci0ngB0XnIDP2mLn7kLqsgPVrAACYFu0AtJ7po9rzcpXfzoNsYrB541GttB0_CEsI9bi-rNcFN3S9agaCXRaFisAo1K7ckBCdL3Nku9G0dbq2yXGBeBQHzQHqf0CwQSfAc24c21vL_SBS8X2kNUR3A83zvU9I6iiIc"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="h-20 w-20 bg-[#5e81ac]/90 text-white rounded-full flex items-center justify-center shadow-lg transform transition-all hover:scale-110 active:scale-95 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                </button>
              </div>
              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-6 text-white w-full max-w-sm">
                  <span className="material-symbols-outlined cursor-pointer hover:text-white/80">volume_up</span>
                  <div className="h-1 flex-1 bg-white/20 rounded-full relative cursor-pointer">
                    <div className="absolute inset-0 w-1/3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                  </div>
                  <span className="text-xs font-black tracking-widest text-white/80">12:45 / 45:00</span>
                </div>
                <div className="flex items-center gap-5 text-white/80">
                  <span className="material-symbols-outlined cursor-pointer hover:text-white">closed_caption</span>
                  <span className="material-symbols-outlined cursor-pointer hover:text-white">settings</span>
                  <span className="material-symbols-outlined cursor-pointer hover:text-white">fullscreen</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Details & Resources (Minimalist Layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 px-4">
            
            {/* Left Column: Description & Resources */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Description Section */}
              <div className="border-b border-slate-200/60 pb-12">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-[#4c566a]/60">
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-[#5e81ac]">schedule</span> 45 MIN</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1.5 text-green-500"><span className="material-symbols-outlined text-[16px]">check_circle</span> COMPLETED</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                    <h1 className="font-headline text-4xl font-black tracking-tight text-[#2e3440] leading-tight flex-1">
                      Understanding Fundamental Paradigms
                    </h1>
                    
                    {/* GENERATE QUIZ BUTTON */}
                    <button
                      onClick={handleGenerateQuiz}
                      disabled={generatingQuiz}
                      className="flex border items-center border-[#5e81ac]/20 gap-2.5 px-6 py-3.5 bg-white text-[#5e81ac] rounded-full hover:bg-[#f0f7ff] hover:border-[#5e81ac]/40 transition-all group shrink-0 disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-[20px] ${generatingQuiz ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform`}>
                        {generatingQuiz ? 'progress_activity' : 'auto_awesome'}
                      </span>
                      <span className="font-bold tracking-wide text-sm">{generatingQuiz ? 'Generating...' : 'Generate AI Quiz'}</span>
                    </button>
                  </div>

                  <p className="text-[#4c566a]/90 leading-relaxed font-medium text-lg max-w-3xl">
                    In this session, we dive deep into how algorithms don't just reflect human biases—they amplify them through systemic feedback loops. We'll examine case studies from housing, credit scoring, and predictive policing to understand the long-term impact on marginalized communities.
                  </p>
                </div>
              </div>

              {/* Resources Section */}
              <div className="pb-12">
                <h3 className="font-headline text-[10px] font-black uppercase tracking-[0.25em] text-[#4c566a]/50 mb-6">
                  Lecture Resources
                </h3>
                
                <div className="flex flex-col gap-2">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200/60 transition-all group cursor-pointer">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
                          <span className="material-symbols-outlined text-[22px]">picture_as_pdf</span>
                        </div>
                        <div>
                          <p className="font-bold text-[#2e3440] group-hover:text-[#5e81ac] transition-colors leading-snug">Reading_Material_4.{i}.pdf</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#4c566a]/50 mt-1">PDF • 2.4 MB</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-[#5e81ac] group-hover:text-white text-slate-300 transition-colors mr-2">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar Meta Info */}
            <div className="lg:col-span-4 space-y-12">
              
              {/* Minimal Progress Summary */}
              <div>
                <h4 className="font-headline font-black text-[10px] uppercase tracking-[0.25em] text-[#4c566a]/50 mb-5">Course Progress</h4>
                <div className="flex items-end justify-between mb-3">
                  <span className="text-3xl font-black text-[#2e3440]">{Math.round(progressPercentage)}%</span>
                  <span className="text-[#4c566a]/60 text-[10px] font-black uppercase tracking-widest mb-1">{completedLectures} / {totalLectures} Completed</span>
                </div>
                <div className="relative h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-green-400 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>
              
              <div className="w-full h-[1px] bg-slate-200/60"></div>

              {/* Minimal Next Up Queue */}
              <div>
                <h4 className="font-headline font-black text-[10px] uppercase tracking-[0.25em] text-[#4c566a]/50 mb-6">Upcoming in Module</h4>
                <div className="space-y-4">
                  <div className="flex gap-5 items-start cursor-pointer group">
                    <span className="text-[#5e81ac] font-black text-xs pt-1 w-6">04</span>
                    <div>
                      <p className="text-sm font-bold text-[#2e3440] group-hover:text-[#5e81ac] transition-colors leading-snug mb-1">Mitigation Strategies for Language Models</p>
                      <p className="text-[9px] font-black text-[#4c566a]/50 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[12px]">schedule</span> 30 MIN
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-5 items-start opacity-40 cursor-default">
                    <span className="text-slate-400 font-black text-xs pt-1 w-6">05</span>
                    <div>
                      <p className="text-sm font-bold text-[#2e3440] leading-snug mb-1">Ethics of Dataset Curation</p>
                      <p className="text-[9px] font-black text-[#4c566a]/50 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[12px]">lock</span> 45 MIN
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* AI Tutor Chat Panel (Slide-in) */}
      <aside 
        className={`fixed right-0 top-[73px] bottom-0 w-[380px] bg-white border-l border-slate-200/60 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] z-30 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isAiTutorOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 bg-gradient-to-r from-[#2e3440] to-[#3b4252] text-white flex items-center justify-between shrink-0 shadow-md relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-11 w-11 rounded-[14px] bg-white/10 flex items-center justify-center border border-white/20 shadow-inner backdrop-blur-sm">
                <span className="material-symbols-outlined text-[22px] text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">smart_toy</span>
              </div>
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-[#2e3440] rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(74,222,128,1)]"></div>
              </div>
            </div>
            <div>
              <p className="font-headline font-black text-[15px] tracking-wide text-white/95">AI Tutor Assistant</p>
              <p className="text-[10px] font-black text-green-400/80 uppercase tracking-widest mt-0.5">Active Session</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAiTutorOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {/* Initial AI Message */}
          {messages.length === 0 && (
            <div className="flex flex-col gap-1 items-start max-w-[88%]">
              <div className="px-5 py-4 bg-white border border-slate-200/60 rounded-2xl rounded-tl-sm text-[13px] text-[#4c566a] leading-relaxed shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-medium">
                Hello! This is an interactive lesson on Fundamental Paradigms. You can ask me to clarify concepts, break down complex topics, or quiz you on what you just watched.
              </div>
              <span className="text-[9px] font-black text-[#4c566a]/40 px-1 uppercase tracking-widest mt-1">Now</span>
            </div>
          )}

          {/* Dynamic Messages */}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end ml-auto' : 'items-start'} max-w-[88%]`}>
              <div className={`px-5 py-4 rounded-2xl text-[13px] leading-relaxed font-medium ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-[#5e81ac] to-[#81a1c1] text-white rounded-tr-sm shadow-md'
                  : 'bg-white border border-slate-200/60 rounded-tl-sm text-[#4c566a] shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
              }`}>
                {msg.content}
              </div>
              <span className={`text-[9px] font-black px-1 uppercase tracking-widest mt-1 ${
                msg.role === 'user' ? 'text-[#5e81ac]/50' : 'text-[#4c566a]/40'
              }`}>
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
              </span>
            </div>
          ))}

          {/* Typing indicator */}
          {sending && (
            <div className="flex flex-col gap-1 items-start max-w-[88%]">
              <div className="px-5 py-4 bg-white border border-slate-200/60 rounded-2xl rounded-tl-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#5e81ac] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#5e81ac] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#5e81ac] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Suggested Prompts */}
          {suggestedPrompts.length > 0 && (
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-[10px] font-black text-[#4c566a]/50 uppercase tracking-widest mb-1">Suggested Prompts</span>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setChatInput(prompt)}
                    className="text-[10px] font-black px-4 py-2.5 bg-[#f0f7ff] text-[#5e81ac] rounded-full border border-[#5e81ac]/20 hover:bg-[#5e81ac] hover:text-white transition-colors tracking-[0.1em] uppercase shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {suggestedPrompts.length === 0 && messages.length === 0 && (
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-[10px] font-black text-[#4c566a]/50 uppercase tracking-widest mb-1">Suggested Prompts</span>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setChatInput('Give an example')} className="text-[10px] font-black px-4 py-2.5 bg-[#f0f7ff] text-[#5e81ac] rounded-full border border-[#5e81ac]/20 hover:bg-[#5e81ac] hover:text-white transition-colors tracking-[0.1em] uppercase shadow-sm">
                  Give an example
                </button>
                <button onClick={() => setChatInput('Explain "Sampling Bias"')} className="text-[10px] font-black px-4 py-2.5 bg-[#f0f7ff] text-[#5e81ac] rounded-full border border-[#5e81ac]/20 hover:bg-[#5e81ac] hover:text-white transition-colors tracking-[0.1em] uppercase shadow-sm">
                  Explain "Sampling Bias"
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-5 bg-white border-t border-slate-200/60 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] z-10">
          <div className="relative">
            <textarea
              className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-[1.25rem] text-[13px] py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-[#5e81ac]/40 focus:bg-white resize-none placeholder:text-slate-400 font-medium transition-all shadow-inner"
              placeholder="Ask the AI Tutor anything..."
              rows={1}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !chatInput.trim()}
              className="absolute right-2 top-2 h-11 w-11 bg-gradient-to-br from-[#8fbcbb] to-[#5e81ac] text-white rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-transform hover:shadow-lg disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px] translate-x-0.5">send</span>
            </button>
          </div>
          <p className="text-[9px] font-black text-center text-[#4c566a]/40 mt-3 uppercase tracking-widest">Trained strictly on course materials</p>
        </div>
      </aside>
    </div>
  );
}
