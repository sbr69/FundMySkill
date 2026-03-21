import React from 'react';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen font-body">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl h-16 flex items-center justify-between px-6 md:px-12 shadow-sm font-headline antialiased">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tight text-slate-900">FundMySkill</span>

        </div>
        <div className="flex items-center gap-3">
          <Link to="/donate" className="hidden sm:flex items-center gap-2 h-10 px-5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-all font-action font-bold text-xs shadow-sm border border-red-100 group uppercase tracking-widest leading-none">
            Donate Now
            <span className="material-symbols-outlined text-red-500 text-[1.1rem] group-hover:scale-125 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </Link>
          <Link to="/login" className="flex items-center justify-center h-10 px-6 bg-slate-900 text-white rounded-full font-action font-bold text-xs hover:bg-slate-800 transition-all shadow-md uppercase tracking-widest active:scale-95 leading-none">
            Sign In
          </Link>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative px-6 pt-24 pb-32 md:pt-40 md:pb-52 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-fixed/30 via-transparent to-transparent"></div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface leading-[1.1] font-headline">
                Fund the Future, <br />
                <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">Unlock Potential.</span>
              </h1>
              <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl font-light leading-relaxed">
                We make quality education universally accessible through crowdfunding. Explore intuitive courses, interact with AI tutors, and earn blockchain-verified certificates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/login" className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-full font-silkscreen font-bold text-sm shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center uppercase tracking-wide">
                  Get Started
                </Link>
                <Link to="/donate" className="px-8 py-4 bg-surface-container-high text-on-primary-fixed-variant rounded-full font-silkscreen font-bold text-sm hover:bg-surface-container-highest transition-all text-center uppercase tracking-wide">
                  Support a Student
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="aspect-square rounded-[2rem] bg-surface-container-low overflow-hidden shadow-2xl relative transform rotate-3 border border-outline-variant/20">
                <img 
                  alt="Student learning" 
                  className="w-full h-full object-cover grayscale-[10%] contrast-[1.05]"
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop" 
                />
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-orange-600" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-orange-800 uppercase tracking-wider">Blockchain Verified</p>
                      <p className="text-sm font-semibold text-slate-900">100% Tamper-Proof Certificates</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-24 px-6 bg-surface-container">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-5xl font-extrabold text-on-surface mb-4 font-headline">Architected for Tomorrow</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto text-lg pt-2">
                Merging community funding with next-gen AI tools to craft the ultimate learning ecosystem.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-outline-variant/10">
                <div className="flex flex-col h-full justify-between gap-12">
                  <div>
                    <span className="material-symbols-outlined text-4xl text-primary mb-6 p-3 bg-primary/10 rounded-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
                    <h3 className="text-2xl font-bold mb-4 font-headline">Socratic AI Tutor</h3>
                    <p className="text-on-surface-variant text-lg">
                      Clear doubts instantly. Our AI Chatbot actively engages with you using Socratic questioning, ensuring you deeply understand the concepts instead of just memorizing answers.
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="h-2 rounded-full bg-primary col-span-2"></div>
                    <div className="h-2 rounded-full bg-primary/40"></div>
                    <div className="h-2 rounded-full bg-primary/20"></div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-800 p-8 rounded-[1.5rem] text-white shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow">
                <div>
                  <span className="material-symbols-outlined text-4xl mb-6 text-green-200" style={{ fontVariationSettings: "'FILL' 1" }}>crowdsource</span>
                  <h3 className="text-2xl font-bold mb-4 font-headline text-green-50">Impactful Crowdfunding</h3>
                  <p className="text-green-100/90 leading-relaxed">
                    Direct your crypto donations to specific learning programs. Help scale education for underserved communities globally.
                  </p>
                </div>
                <div className="pt-8 flex items-center justify-between border-t border-green-500/30 mt-6">
                  <span className="text-sm font-semibold tracking-widest uppercase opacity-80">Active Campaigns</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-sm border border-outline-variant/10 flex flex-col justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <span className="material-symbols-outlined text-4xl text-purple-600 mb-6 p-3 bg-purple-50 rounded-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
                  <h3 className="text-2xl font-bold mb-4 font-headline">Insightful Analytics</h3>
                  <p className="text-on-surface-variant">Gauge your progress with comprehensive learning overviews. Track hours, quiz performance, and mastery levels in real-time.</p>
                </div>
              </div>

              <div className="md:col-span-2 bg-slate-900 p-8 rounded-[1.5rem] text-slate-50 shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center h-full">
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-4 font-headline">AI-Powered Assessments</h3>
                    <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                      Take on-demand quizzes dynamically generated by AI. Get instant scoring, comprehensive answers, and step-by-step explanations identifying exactly where you can improve.
                    </p>
                    <button className="text-blue-400 font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                      Try a Practice Quiz <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                  <div className="w-full md:w-[40%] bg-slate-800/80 rounded-2xl p-6 border border-slate-700 backdrop-blur-sm self-stretch flex flex-col justify-center shadow-inner">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm font-medium"><span>Score</span><span className="text-green-400">92%</span></div>
                      <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[92%]"></div></div>
                      <p className="text-xs text-slate-400 mt-4 italic">"Excellent understanding of recursive functions. Let's review optimal branch prediction next."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Journey */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-start">
            <div className="md:w-1/3 md:sticky md:top-32">
              <h2 className="text-4xl font-extrabold text-on-surface leading-tight font-headline">Your Learning Journey</h2>
              <p className="mt-4 text-on-surface-variant text-lg">A simple but powerful progression to take you from a curious mind to a certified expert.</p>
            </div>
            <div className="md:w-2/3 space-y-20 relative before:absolute before:inset-0 before:ml-[1.2rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/30 before:to-transparent">
              
              <div className="relative flex items-start gap-6 group">
                <div className="w-10 h-10 rounded-full bg-blue-100 border-4 border-surface shadow-sm flex items-center justify-center relative z-10 shrink-0 mt-1 transition-colors group-hover:bg-blue-200">
                  <span className="material-symbols-outlined text-blue-600 text-sm">explore</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-on-surface mb-3 font-headline">1. Discover & Enroll</h3>
                  <p className="text-on-surface-variant text-lg leading-relaxed">
                    Explore a diverse catalog of high-quality courses funded by our compassionate community. Enroll instantly and access all study materials from day one.
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-6 group">
                <div className="w-10 h-10 rounded-full bg-purple-100 border-4 border-surface shadow-sm flex items-center justify-center relative z-10 shrink-0 mt-1 transition-colors group-hover:bg-purple-200">
                  <span className="material-symbols-outlined text-purple-600 text-sm">smart_toy</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-on-surface mb-3 font-headline">2. Interactive Learning via AI</h3>
                  <p className="text-on-surface-variant text-lg leading-relaxed">
                    Don't learn alone. Utilize our Socratic AI tutor for challenging concepts, generating dynamic explanations tailored to your personal context.
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-6 group">
                <div className="w-10 h-10 rounded-full bg-orange-100 border-4 border-surface shadow-sm flex items-center justify-center relative z-10 shrink-0 mt-1 transition-colors group-hover:bg-orange-200">
                  <span className="material-symbols-outlined text-orange-600 text-sm">assignment_turned_in</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-on-surface mb-3 font-headline">3. Assess Masterfully</h3>
                  <p className="text-on-surface-variant text-lg leading-relaxed">
                    Validate your knowledge with on-demand tests that adapt to your skill level. Receive immediate, deep-dive AI feedback on right and wrong answers.
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-6 group">
                <div className="w-10 h-10 rounded-full bg-green-100 border-4 border-surface shadow-sm flex items-center justify-center relative z-10 shrink-0 mt-1 transition-colors group-hover:bg-green-200">
                  <span className="material-symbols-outlined text-green-600 text-sm">receipt_long</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-on-surface mb-3 font-headline">4. Earn Blockchain Certification</h3>
                  <p className="text-on-surface-variant text-lg leading-relaxed">
                    Upon completion, your achievement is immortalized via a smart contract. You receive a tamper-proof cryptographic certificate that recruiters deeply trust.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 mb-12">
          <div className="max-w-4xl mx-auto bg-slate-900 rounded-[2.5rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full blur-[100px] -ml-32 -mb-32"></div>
            </div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-6xl text-primary-fixed mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 font-headline leading-tight">Join the Educational Revolution</h2>
              <p className="text-slate-300 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                Whether you're looking to upgrade your skills or seeking to fund the leaders of tomorrow, your place is here.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/courses" className="w-full sm:w-auto px-10 py-4 bg-white text-slate-900 rounded-full font-silkscreen font-bold text-sm hover:bg-slate-100 transition-all shadow-lg active:scale-95 transform uppercase tracking-wide">
                  Start Learning
                </Link>
                <Link to="/donate" className="w-full sm:w-auto px-10 py-4 border-2 border-white/20 text-white rounded-full font-silkscreen font-bold text-sm hover:bg-white/10 transition-all shadow-lg active:scale-95 transform uppercase tracking-wide">
                  Make a Donation
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest pt-20 pb-12 px-6 border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-headline">FundMySkill</span>
              <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 rounded-md">Web3 Powered</span>
            </div>
            <p className="text-sm text-on-surface-variant opacity-80 text-center">© 2026 FundMySkill. Empowering education through transparent tech.</p>
            <div className="flex gap-6">
              <a href="#" className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>language</span></a>
              <a href="#" className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>code</span></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
