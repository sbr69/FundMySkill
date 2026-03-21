import { useState } from 'react';
import { Link } from 'react-router-dom';

const options = [
  { letter: 'A', text: 'The Semantic Parser Interface', isCorrect: true },
  { letter: 'B', text: 'Probabilistic Logic Engines', isCorrect: false },
  { letter: 'C', text: 'Neural-Symbolic Mapping Layer', isCorrect: false },
  { letter: 'D', text: 'Hierarchical Temporal Memory Units', isCorrect: false },
];

export function CourseQuizPage() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>('A');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm font-headline antialiased flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">FundMySkill</Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link className="text-slate-500 hover:text-slate-900 transition-all duration-200" to="/dashboard">Dashboard</Link>
            <Link className="text-blue-700 font-semibold border-b-2 border-blue-700 h-16 flex items-center" to="/courses">My Courses</Link>
            <a className="text-slate-500 hover:text-slate-900 transition-all duration-200" href="#">AI Tutor</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-all active:scale-95">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-all active:scale-95">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          <Link to="/profile" className="w-8 h-8 rounded-full bg-primary-fixed overflow-hidden">
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNIis-XdoxiK3QUGOJWQ3OBnx72yYwyz3axFJvavmJ4iDawO-eR5jKvgHPblnLsv_-plGn7KZZMnKPrul_cOkjRxn-pGUvf-Zai1LMSPc4CQ9RSfy9Q0fkuUTXC7SeXteDVoiyC3jmgd6eQRzytQ7bwJcmwAMhwbp6FEdH3bkweAbqFc8-aYeSxP2HqSj8tDk_DXqt1d9XZSAANQU0Ol1nwBBysfHwlGH5hHJ2aPPdcxUp5Ea5z8vYWY9RIlJPK-LC095CaI0rvv8"
            />
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-24 pb-12 px-6 max-w-5xl mx-auto flex-1 flex flex-col">
        {/* Header & Progress Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <span className="text-tertiary font-bold tracking-widest text-xs uppercase">Module 4: Cognitive Architectures</span>
            <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Weekly Synthesis Quiz</h1>
            <p className="text-on-surface-variant max-w-md">Demonstrate your understanding of neural mapping and symbolic reasoning frameworks.</p>
          </div>
          {/* Timer Display */}
          <div className="bg-surface-container-low px-6 py-4 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-outline uppercase tracking-tighter">Remaining Time</span>
              <span className="text-2xl font-mono font-bold text-primary">14:52</span>
            </div>
            <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">timer</span>
            </div>
          </div>
        </header>

        {/* Progress Track */}
        <div className="w-full bg-surface-container-high h-3 rounded-full mb-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-[60%] bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-700"></div>
          {/* Progress Marker */}
          <div className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2 bg-white w-6 h-6 rounded-full border-4 border-primary shadow-lg z-10"></div>
        </div>

        {/* Quiz Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Question Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Question Card */}
            <div className="bg-surface-container-lowest p-8 md:p-12 rounded-[2rem] shadow-sm relative overflow-hidden group">
              {/* Subtle background decoration */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full">Question 06 of 10</span>
                  <span className="text-outline text-xs font-medium">Points: 20</span>
                </div>
                <h2 className="text-2xl font-bold font-headline leading-tight text-on-surface mb-10">
                  Which architectural component is primarily responsible for the "Symbolic Grounding" problem in the context of hybrid AI systems?
                </h2>

                {/* Options Grid */}
                <div className="space-y-4">
                  {options.map((option) => (
                    <button
                      key={option.letter}
                      onClick={() => setSelectedAnswer(option.letter)}
                      className={`w-full flex items-center justify-between p-6 rounded-xl text-left transition-all ${
                        selectedAnswer === option.letter && option.isCorrect
                          ? 'bg-secondary-container/30 border-2 border-secondary'
                          : 'bg-surface-container-low hover:bg-surface-container-high active:scale-[0.98]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            selectedAnswer === option.letter && option.isCorrect
                              ? 'bg-secondary text-white'
                              : 'bg-surface-container-highest text-outline'
                          }`}
                        >
                          {option.letter}
                        </span>
                        <span className="font-medium text-on-surface">{option.text}</span>
                      </div>
                      {selectedAnswer === option.letter && option.isCorrect ? (
                        <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-outline-variant"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Immediate Feedback Panel */}
            {selectedAnswer === 'A' && (
              <div className="bg-secondary-container/10 p-6 rounded-2xl flex gap-6 items-start border border-secondary/20">
                <div className="bg-secondary text-white p-3 rounded-xl">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-secondary-container mb-1">Brilliant Insight!</h4>
                  <p className="text-sm text-on-secondary-container/80 leading-relaxed">
                    The Semantic Parser Interface bridges the gap between raw sensory data and discrete symbolic representations. You've correctly identified the bottleneck in current knowledge synthesis models.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Contextual Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Focus Stats Card */}
            <div className="bg-surface-container p-6 rounded-2xl space-y-6">
              <h3 className="font-bold text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">analytics</span>
                Performance Pulse
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-outline uppercase block mb-1">Accuracy</span>
                  <span className="text-xl font-bold text-secondary">100%</span>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-outline uppercase block mb-1">Avg. Speed</span>
                  <span className="text-xl font-bold text-tertiary">14s</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-outline">Confidence Score</span>
                  <span className="text-on-surface font-bold">High</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-tertiary rounded-full"></div>
                </div>
              </div>
            </div>

            {/* AI Tutor Quick Help */}
            <div className="bg-inverse-surface text-inverse-on-surface p-6 rounded-2xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-bright/10 flex items-center justify-center glass-effect">
                    <span className="material-symbols-outlined">smart_toy</span>
                  </div>
                  <h3 className="font-bold text-lg">Feeling stuck?</h3>
                  <p className="text-sm text-inverse-on-surface/70">I can provide a subtle hint without revealing the full answer.</p>
                </div>
                <button className="mt-8 bg-surface-bright text-on-surface py-3 px-6 rounded-xl font-bold text-sm transition-all hover:bg-white active:scale-95">
                  Ask for a Hint
                </button>
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            </div>
          </aside>
        </div>

        {/* Sticky Footer Action */}
        <footer className="mt-auto pt-16 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-outline-variant/15">
          <button className="flex items-center gap-2 text-outline font-bold hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">keyboard_backspace</span>
            Previous Question
          </button>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-8 py-4 bg-surface-container-high text-on-surface font-bold rounded-full transition-all hover:bg-surface-container-highest active:scale-95">
              Skip for now
            </button>
            <button className="flex-1 md:flex-none px-12 py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-full shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
              Next Question
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </footer>
      </main>

      {/* Side Navigation Placeholder (Hidden on small screens) */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-20 bg-slate-50 border-r border-slate-100 py-20 items-center gap-8">
        <Link to="/dashboard" className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
          <span className="material-symbols-outlined">dashboard</span>
        </Link>
        <Link to="/courses" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-slate-100">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
        </Link>
        <div className="w-12 h-12 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 transition-colors cursor-pointer">
          <span className="material-symbols-outlined">smart_toy</span>
        </div>
        <div className="w-12 h-12 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 transition-colors cursor-pointer">
          <span className="material-symbols-outlined">local_library</span>
        </div>
        <div className="mt-auto w-12 h-12 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 transition-colors cursor-pointer mb-8">
          <span className="material-symbols-outlined">settings</span>
        </div>
      </aside>
    </div>
  );
}
