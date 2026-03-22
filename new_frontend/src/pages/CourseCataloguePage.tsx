import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../services/api';
import type { Course } from '../types/api';

export function StarRating({ stars }: { stars: number[] }) {
  return (
    <div className="flex text-secondary">
      {stars.map((fill, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-sm"
          style={{ fontVariationSettings: `'FILL' ${fill}` }}
        >
          {fill === 0.5 ? 'star_half' : 'star'}
        </span>
      ))}
    </div>
  );
}

// Fallback courses for backward compatibility
export const fallbackCourses: Course[] = [];
export const courses = fallbackCourses;

export function CourseCataloguePage() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating'>('popularity');

  // Fetch all courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await courseApi.list({ limit: 100 });
        setAllCourses(data.courses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Get unique categories from courses
  const categories = useMemo(() => {
    const catMap: Record<string, number> = {};
    allCourses.forEach(c => {
      const cat = c.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    return Object.entries(catMap).map(([name, count]) => ({ name, count }));
  }, [allCourses]);

  // Get levels with counts
  const levels = useMemo(() => {
    const levelMap: Record<string, number> = {};
    allCourses.forEach(c => {
      const level = c.level || 'Intermediate';
      levelMap[level] = (levelMap[level] || 0) + 1;
    });
    return ['Beginner', 'Intermediate', 'Advanced'].map(name => ({
      name,
      count: levelMap[name] || 0
    }));
  }, [allCourses]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = [...allCourses];

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(c => selectedCategories.includes(c.category));
    }

    // Level filter
    if (selectedLevel) {
      result = result.filter(c => c.level === selectedLevel);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.instructor.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [allCourses, selectedCategories, selectedLevel, searchQuery, sortBy]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex gap-10 items-start">
        {/* Filters Sidebar */}
        <aside className="w-64 shrink-0 sticky top-8 self-start space-y-10 pr-6">
          {/* Search */}
          <section>
            <h3 className="font-headline font-bold text-[11px] mb-4 uppercase tracking-[0.2em] text-on-surface-variant/70">Search</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">search</span>
            </div>
          </section>

          {/* Category Filter */}
          <section>
            <h3 className="font-headline font-bold text-[11px] mb-6 uppercase tracking-[0.2em] text-on-surface-variant/70">Category</h3>
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
              {categories.map((cat) => (
                <label key={cat.name} className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      checked={selectedCategories.includes(cat.name)}
                      onChange={() => toggleCategory(cat.name)}
                      className="peer appearance-none w-5 h-5 rounded-lg border-2 border-outline-variant checked:bg-primary checked:border-primary transition-all duration-300 cursor-pointer"
                      type="checkbox"
                    />
                    <span className="material-symbols-outlined absolute text-white text-sm scale-0 peer-checked:scale-100 transition-transform duration-300 pointer-events-none">check</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface/80 group-hover:text-primary transition-colors font-body">
                    {cat.name} <span className="opacity-40 ml-1 text-[11px]">({cat.count})</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Level Filter */}
          <section>
            <h3 className="font-headline font-bold text-[11px] mb-6 uppercase tracking-[0.2em] text-on-surface-variant/70">Level</h3>
            <div className="flex flex-col gap-3">
              {levels.map((level) => (
                <label key={level.name} className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      checked={selectedLevel === level.name}
                      onChange={() => setSelectedLevel(selectedLevel === level.name ? null : level.name)}
                      className="peer appearance-none w-5 h-5 rounded-lg border-2 border-outline-variant checked:bg-primary checked:border-primary transition-all duration-300 cursor-pointer"
                      type="checkbox"
                    />
                    <span className="material-symbols-outlined absolute text-white text-sm scale-0 peer-checked:scale-100 transition-transform duration-300 pointer-events-none">check</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface/80 group-hover:text-primary transition-colors font-body">
                    {level.name} <span className="opacity-40 ml-1 text-[11px]">({level.count})</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Clear Filters */}
          {(selectedCategories.length > 0 || selectedLevel || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedLevel(null);
                setSearchQuery('');
              }}
              className="w-full py-2 text-sm font-bold text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Grid Content */}
        <div className="flex-1">
          <header className="mb-10 relative flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-extrabold text-on-surface tracking-tight leading-none font-headline">The Course Catalogue</h1>
              <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                Browse our curated collection of advanced academic modules designed for deep cognitive mastery.
              </p>
            </div>
          </header>

          <div className="flex justify-between items-center mb-6">
            <p className="text-sm font-medium text-on-surface-variant italic">
              {loading ? (
                <span className="text-on-surface-variant">Loading courses...</span>
              ) : error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                <>Showing <span className="text-primary font-bold">{filteredCourses.length}</span> of {allCourses.length} courses</>
              )}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'popularity' | 'rating')}
                className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer"
              >
                <option value="popularity">Popularity</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-surface-container-lowest rounded-[1.5rem] p-5 animate-pulse">
                  <div className="w-full h-36 bg-surface-container-high rounded-xl mb-6"></div>
                  <div className="h-4 bg-surface-container-high rounded w-1/2 mb-3"></div>
                  <div className="h-6 bg-surface-container-high rounded w-full mb-2"></div>
                  <div className="h-4 bg-surface-container-high rounded w-3/4"></div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredCourses.length === 0 && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">search_off</span>
              <h3 className="text-xl font-bold text-on-surface mb-2">No courses found</h3>
              <p className="text-on-surface-variant">Try adjusting your filters or search query</p>
            </div>
          )}

          {/* Course Grid */}
          {!loading && filteredCourses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="group relative bg-surface-container-lowest rounded-[1.5rem] p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full border border-outline-variant/10"
                >
                  <div className="relative w-full h-36 mb-6 rounded-xl overflow-hidden shadow-sm">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={course.title}
                      src={course.image || course.thumbnail_url}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-40"></div>
                    {course.badge && (
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`bg-white/95 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-black ${course.badge_color} uppercase tracking-tight shadow-sm`}>
                          {course.badge}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="bg-black/60 backdrop-blur px-2 py-1 rounded-lg text-[9px] font-bold text-white uppercase">
                        {course.level}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider">{course.category}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <StarRating stars={course.stars} />
                      <span className="text-xs font-bold text-on-surface-variant opacity-70">{course.rating}</span>
                      <span className="text-[10px] text-on-surface-variant/50">({course.rating_count})</span>
                    </div>
                    <h3 className="text-lg font-bold text-on-surface mb-2 group-hover:text-primary transition-colors font-headline leading-tight line-clamp-2">{course.title}</h3>
                    <p className="text-[12px] text-on-surface-variant mb-4 line-clamp-2 opacity-80">{course.description}</p>
                    <div className="flex items-center gap-3 mb-4 mt-auto">
                      <img
                        className="w-8 h-8 rounded-full bg-slate-100"
                        alt={course.instructor}
                        src={course.instructor_image}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${course.id}`;
                        }}
                      />
                      <div>
                        <p className="text-xs font-bold text-on-surface leading-none mb-1">{course.instructor}</p>
                        <p className="text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">{course.institution}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto pt-3 border-t border-outline-variant/10">
                    <Link
                      to={`/courses/${course.id}`}
                      className="w-full py-3 bg-[#2e3440] hover:bg-[#3b4252] flex items-center justify-center text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-xl transition-all active:scale-[0.98] shadow-md shadow-black/5"
                    >
                      Explore Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
