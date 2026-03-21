import { Link } from 'react-router-dom';

export function MyCoursesPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-[80vh] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center text-center gap-6 animate-fade-in">
        <div className="w-24 h-24 rounded-[2rem] bg-surface-container-high flex items-center justify-center mb-4 border border-outline-variant/10 shadow-inner">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">auto_stories</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-on-surface tracking-tight font-headline">Your Course Library</h1>
          <p className="text-lg text-on-surface-variant font-body">No courses enrolled</p>
        </div>

        <p className="max-w-md text-on-surface-variant/60 text-sm leading-relaxed mb-4">
          It looks like you haven't started any learning paths yet. Explore our extensive catalogue to find the perfect module for your growth.
        </p>

        <Link 
          to="/courses" 
          className="px-8 py-3 bg-primary text-on-primary rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Explore Catalogue
        </Link>
      </div>
    </div>
  );
}
