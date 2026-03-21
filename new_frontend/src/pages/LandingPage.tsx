import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <>
      {/* TopNavBar for Landing */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm dark:shadow-none font-headline antialiased flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">FundMySkill</span>
          <div className="hidden md:flex gap-6">
            <a className="text-blue-700 dark:text-blue-400 font-semibold border-b-2 border-blue-700 dark:border-blue-400" href="#">Home</a>
            <a className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200" href="#">Programs</a>
            <a className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200" href="#">Methodology</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/donate" className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium text-sm shadow-sm border border-red-100">
            <span className="material-symbols-outlined text-red-500 text-[1.2rem]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            Donate
          </Link>
          <button className="material-symbols-outlined text-slate-500 p-2 hover:bg-slate-50 rounded-full transition-all">notifications</button>
          <button className="material-symbols-outlined text-slate-500 p-2 hover:bg-slate-50 rounded-full transition-all">help_outline</button>
          <div className="h-8 w-8 rounded-full bg-surface-container-high overflow-hidden">
            <img
              alt="User profile avatar"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5o5mZK-C3zFfF9cS27BquYBuYhpQV-cAac9S6OxpA4giziL3MIefey0YTF9MM7RaCpubC2w0A9O4gVzqFamte41OTSrqSH2C_sxKj_QxYn0jCXAiRRrjYMMHGO1DgX_9FhEiHxuDjmuBPsz0rDMFYjtTq8eYZmOeXQdN9wHjRUPtJSkDI1HDkNUHkgN1QJZm5U7pszyIXvPvwL2COORtGbVIUscca1XuH3FNSMdDg2zdIQkyQEIwOiYJ2MfheUEW-gxPCS-mNuEg"
            />
          </div>
        </div>
      </nav>

      <main className="min-h-screen pt-16 flex flex-col md:flex-row">
        {/* Hero Section - Left Column */}
        <section className="flex-1 px-8 md:px-16 lg:px-24 py-12 md:py-24 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary blur-3xl"></div>
          </div>
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label text-sm font-semibold mb-6 tracking-wide uppercase">
              The Future of Learning
            </span>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-background leading-[1.1] tracking-tight mb-8">
              Elevate Your Mind with <span className="text-primary">AI Precision.</span>
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
              FundMySkill combines centuries of pedagogical wisdom with cutting-edge artificial intelligence to create a curated, focus-driven workspace for the modern scholar.
            </p>
            {/* Bento-style feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface-container-low p-6 rounded-xl transition-all duration-200 hover:translate-x-1">
                <span className="material-symbols-outlined text-primary mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h3 className="font-headline font-bold text-on-surface mb-1">Personalized Path</h3>
                <p className="text-sm text-on-surface-variant">AI-generated curricula tailored to your specific cognitive style.</p>
              </div>
              <div className="bg-surface-container-low p-6 rounded-xl transition-all duration-200 hover:translate-x-1">
                <span className="material-symbols-outlined text-secondary mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
                <h3 className="font-headline font-bold text-on-surface mb-1">Deep Work Tools</h3>
                <p className="text-sm text-on-surface-variant">Integrated focus shrouds and smart pomodoro tracking.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Login Section - Right Column */}
        <section className="w-full md:w-[480px] lg:w-[560px] bg-surface-container flex flex-col items-center justify-center px-8 md:px-12 py-12 border-l border-outline-variant/10">
          <div className="w-full max-w-md bg-surface-container-lowest p-10 rounded-[1.5rem] shadow-2xl shadow-on-surface/5">
            <div className="mb-10 text-center">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Welcome Back</h2>
              <p className="text-on-surface-variant font-body">Enter your credentials to access your atelier.</p>
            </div>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block font-label text-sm font-medium text-on-surface-variant mb-2 ml-1" htmlFor="email">Academic Email</label>
                <input
                  className="w-full h-12 px-4 rounded-xl border-none bg-surface-container-low focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-fixed transition-all text-on-surface"
                  id="email"
                  placeholder="name@institution.edu"
                  type="email"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block font-label text-sm font-medium text-on-surface-variant" htmlFor="password">Access Code</label>
                  <a className="text-xs font-semibold text-primary hover:underline" href="#">Forgot?</a>
                </div>
                <input
                  className="w-full h-12 px-4 rounded-xl border-none bg-surface-container-low focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-fixed transition-all text-on-surface"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                />
              </div>
              <div className="flex items-center gap-2 px-1">
                <input className="w-4 h-4 rounded text-primary focus:ring-primary-fixed border-outline-variant" id="remember" type="checkbox" />
                <label className="text-sm text-on-surface-variant select-none" htmlFor="remember">Stay logged in for deep sessions</label>
              </div>
              <Link
                to="/dashboard"
                className="w-full h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold rounded-full transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transform flex items-center justify-center"
              >
                Enter Workspace
              </Link>
            </form>
            <div className="mt-10 flex flex-col items-center gap-6">
              <div className="w-full flex items-center gap-4">
                <div className="flex-1 h-px bg-outline-variant/30"></div>
                <span className="text-xs font-label text-outline uppercase tracking-widest">or connect via</span>
                <div className="flex-1 h-px bg-outline-variant/30"></div>
              </div>
              <div className="flex gap-4 w-full">
                <button className="flex-1 h-12 flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-xl font-label text-sm font-semibold">
                  <img
                    alt="Google Logo"
                    className="w-4 h-4"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUlOifmFABF31KKj3TYPu8vXMklLz-MDez4IDkYKLw0KbsVroYUYZ_cAkXiV1O27xlfVm8Cc0JFU47uVC1B_tXRa5cxQW7ZGvUe4qaDiZaBzMYKZ45f13b2usppxr9UPWbHIa7xaMZNbldZARUUqc2c8FT9auS6Wy_lPRX-oON51PwGV_ol3wBVjqkoNdNN41aoo-P0-rZzkTdzYx809aoM_IYCu_U8lPeM1AUAxiVa8bRSW65DIBF1ICTy2tWdfXAvfgI5GGYVbc"
                  />
                  Google
                </button>
                <button className="flex-1 h-12 flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-xl font-label text-sm font-semibold">
                  <img
                    alt="Microsoft Logo"
                    className="w-4 h-4"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBs-yNNX8GG8jzf5K0PbzQtafcvYQzFs3L1A8CV60puvA0FX52dg09cdojO2JTNiBuMqkxwBPXzYwxgi1qriOBu-gd_lRfQCYTHrevbQOhvxxGbIIV9Yci469-Jedi0NSGqzPZXyBar_-bEU-48kP5CLtrU2f-d1wjyC54loiKEu8nhLEdxbXO4s1VX2NjaOWMqekwXduv9fr8U9bjd1tfylUPDl2p7pBU5D4iNSJF8N90ZN5GIFpum3vv9N6TDEe5aBzRz3gBqT58"
                  />
                  Outlook
                </button>
              </div>
            </div>
            <div className="mt-12 text-center">
              <p className="text-sm text-on-surface-variant">
                New student? <a className="text-primary font-bold hover:underline" href="#">Apply for an Invitation</a>
              </p>
            </div>
          </div>
          {/* Footer for transactional pages */}
          <footer className="mt-12 flex gap-6 text-xs font-label text-outline uppercase tracking-widest">
            <a className="hover:text-primary transition-colors" href="#">Privacy Charter</a>
            <a className="hover:text-primary transition-colors" href="#">Institutional Terms</a>
            <a className="hover:text-primary transition-colors" href="#">Support</a>
          </footer>
        </section>
      </main>

      {/* Bottom Ornament */}
      <div className="hidden lg:block fixed bottom-12 left-16 max-w-xs p-6 bg-surface-bright/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-on-surface/5 border border-outline-variant/20 -rotate-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
          </div>
          <p className="text-xs font-bold font-headline tracking-tight text-on-surface">Curated Insight</p>
        </div>
        <p className="text-sm italic font-body text-on-surface-variant leading-relaxed">
          "The mind is not a vessel to be filled, but a fire to be kindled. AI is the spark we provide at the FundMySkill."
        </p>
        <p className="mt-3 text-[10px] font-bold text-outline uppercase tracking-widest">— Dr. Aris Thorne, Provost</p>
      </div>
    </>
  );
}
