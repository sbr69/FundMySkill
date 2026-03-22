import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEnrolledCourses } from '../hooks/useApi';
import { fallbackCourses } from './CourseCataloguePage';

export function MyCoursesPage() {
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCompletion, setSelectedCompletion] = useState('All');

  // Fetch enrolled courses from API
  const { data, loading, error } = useEnrolledCourses();

  // Use API data or show empty state
  const enrolledCourses = data?.enrolled_courses || [];

  // If no enrolled courses from API, use fallback for demo
  const displayCourses = enrolledCourses.length > 0
    ? enrolledCourses.map(ec => ({
        ...ec,
        image: ec.thumbnail_url || fallbackCourses.find(fc => fc.id === ec.id)?.image || 'https://via.placeholder.com/400x300',
      }))
    : [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-surface-container-high rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface-container-lowest rounded-[1.5rem] p-5">
                <div className="w-full h-36 bg-surface-container-high rounded-xl mb-6"></div>
                <div className="h-4 bg-surface-container-high rounded w-1/2 mb-3"></div>
                <div className="h-6 bg-surface-container-high rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (displayCourses.length === 0) {
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex gap-10 items-start">
        {/* Filters Sidebar */}
        <aside className="w-64 shrink-0 sticky top-8 self-start space-y-10 pr-6">
          <section>
            <h3 className="font-headline font-bold text-[11px] mb-6 uppercase tracking-[0.2em] text-on-surface-variant/70">Level</h3>
            <div className="flex flex-col gap-4">
              {['All', 'Foundational', 'Intermediate', 'Advanced', 'Mastery'].map((level) => (
                <label key={level} className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      checked={selectedLevel === level}
                      onChange={() => setSelectedLevel(level)}
                      className="peer appearance-none w-5 h-5 rounded-lg border-2 border-outline-variant checked:bg-primary checked:border-primary transition-all duration-300 cursor-pointer"
                      type="checkbox"
                    />
                    <span className="material-symbols-outlined absolute text-white text-sm scale-0 peer-checked:scale-100 transition-transform duration-300 pointer-events-none">check</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface/80 group-hover:text-primary transition-colors font-body">{level}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-headline font-bold text-[11px] mb-6 uppercase tracking-[0.2em] text-on-surface-variant/70">Completion</h3>
            <div className="flex flex-col gap-4">
              {['All', 'Completed', 'Not Completed'].map((status) => (
                <label key={status} className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      checked={selectedCompletion === status}
                      onChange={() => setSelectedCompletion(status)}
                      className="peer appearance-none w-5 h-5 rounded-lg border-2 border-outline-variant checked:bg-primary checked:border-primary transition-all duration-300 cursor-pointer"
                      type="checkbox"
                    />
                    <span className="material-symbols-outlined absolute text-white text-sm scale-0 peer-checked:scale-100 transition-transform duration-300 pointer-events-none">check</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface/80 group-hover:text-primary transition-colors font-body">{status}</span>
                </label>
              ))}
            </div>
          </section>
        </aside>

        {/* Grid Content */}
        <div className="flex-1">
          <header className="mb-10 relative flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-extrabold text-on-surface tracking-tight leading-none font-headline">Your Library</h1>
              <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                Resume exactly where you left off. Every module in your learning journey is tracked here.
              </p>
            </div>
          </header>

          <div className="flex justify-between items-center mb-6">
            <p className="text-sm font-medium text-on-surface-variant italic">
              Showing <span className="text-primary font-bold">{displayCourses.length}</span> active modules
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort By:</span>
              <select className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer">
                <option>Last Accessed</option>
                <option>Enrollment Date</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCourses.map((course) => (
              <div
                key={course.id}
                className="group relative bg-surface-container-lowest rounded-[1.5rem] p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full border border-outline-variant/10"
              >
                <div className="relative w-full h-36 mb-6 rounded-xl overflow-hidden shadow-sm">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={course.title}
                    src={course.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-40"></div>
                  {/* Progress Indicator */}
                  <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/40">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${course.progress_percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                      course.progress_percentage >= 100
                        ? 'text-green-600 bg-green-100'
                        : 'text-primary bg-primary/10'
                    }`}>
                      {course.progress_percentage >= 100 ? 'Completed' : 'In Progress'}
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant">
                      {Math.round(course.progress_percentage || 0)}%
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mb-2 group-hover:text-primary transition-colors font-headline leading-tight">{course.title}</h3>
                  <p className="text-[12px] text-on-surface-variant mb-6 line-clamp-2 opacity-80">{course.description}</p>
                  <div className="flex items-center gap-3 mb-4 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-sm">person</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface leading-none mb-1">{course.instructor}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-outline-variant/10">
                  <Link
                    to={`/insider/${course.id}`}
                    className="w-full py-2 bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all active:scale-[0.98] shadow-sm"
                  >
                    Continue
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
