import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCourse, useEnroll } from '../hooks/useApi';
import { StarRating } from './CourseCataloguePage';

interface Lecture {
  id: string;
  title: string;
  duration: string;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  total_duration: string;
  lecture_count: number;
  lectures: Lecture[];
}

export function CourseOverviewPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Fetch course from API
  const { data: course, loading } = useCourse(courseId || '');
  const { enroll, enrolling } = useEnroll();

  const handleEnroll = async () => {
    if (!courseId) return;
    setEnrollError(null);
    try {
      await enroll(courseId);
      navigate('/my-courses');
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : 'Failed to enroll');
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-surface-container-high rounded w-1/4"></div>
          <div className="h-16 bg-surface-container-high rounded w-3/4"></div>
          <div className="h-6 bg-surface-container-high rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">error</span>
          <h3 className="text-xl font-bold text-on-surface mb-2">Course not found</h3>
          <Link to="/courses" className="text-primary hover:underline">Back to catalogue</Link>
        </div>
      </div>
    );
  }

  const title = course.title;
  const description = course.description;
  const instructor = course.instructor;
  const institution = course.institution;
  const instructorImage = course.instructor_image || `https://i.pravatar.cc/150?u=${courseId}`;
  const stars = course.stars || [1, 1, 1, 1, 0.5];
  const rating = course.rating || 4.5;
  const ratingCount = course.rating_count || '0';
  const modules: Module[] = course.modules || [];

  return (
    <div className="max-w-6xl mx-auto px-6 pt-12">
      <Link
        to="/courses"
        className="flex items-center gap-2 mb-10 text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 hover:text-primary transition-all group w-fit font-body"
      >
        <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Back to Catalogue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-12 pb-12">
          {/* Hero Content */}
          <section>
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider rounded-lg">
                {course.category}
              </span>
              <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded-lg">
                {course.level}
              </span>
            </div>
            <h1 className="text-5xl font-extrabold text-on-surface leading-[1.1] mb-8 tracking-tighter font-headline">
              {title}
            </h1>
            <p className="text-xl text-on-surface-variant leading-relaxed opacity-90 max-w-2xl">
              {description}
            </p>

            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-3">
                <img
                  src={instructorImage}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-md shadow-black/5"
                  alt={instructor}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${courseId}`;
                  }}
                />
                <div>
                  <p className="text-sm font-bold text-on-surface leading-none mb-1">{instructor}</p>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">{institution}</p>
                </div>
              </div>
              <div className="h-10 w-[1px] bg-outline-variant/20"></div>
              <div className="flex items-center gap-2 drop-shadow-sm">
                <StarRating stars={stars} />
                <span className="text-xs font-black text-on-surface/70">{rating}</span>
                <span className="text-[10px] font-bold text-on-surface-variant opacity-60">({ratingCount} Reviews)</span>
              </div>
            </div>
          </section>

          {/* What You'll Learn */}
          {course.what_you_will_learn && course.what_you_will_learn.length > 0 && (
            <section>
              <h2 className="text-2xl font-extrabold tracking-tight mb-4 font-headline">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.what_you_will_learn.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-lg mt-0.5">check_circle</span>
                    <span className="text-sm text-on-surface-variant">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Curriculum Section */}
          <section>
            <div className="flex items-end justify-between mb-4 pb-1 border-b border-outline-variant/10">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-1 font-headline">Curriculum</h2>
                <p className="text-sm text-on-surface-variant opacity-70">
                  {course.module_count || modules.length} modules • {course.lecture_count || 0} lectures
                </p>
              </div>
              <button
                onClick={() => setExpandedModules(expandedModules.size === modules.length ? new Set() : new Set(modules.map(m => m.id)))}
                className="text-[11px] font-bold text-primary uppercase tracking-wider hover:underline"
              >
                {expandedModules.size === modules.length ? 'Collapse All' : 'Expand All'}
              </button>
            </div>

            <div className="space-y-3">
              {modules.map((mod, index) => {
                const isExpanded = expandedModules.has(mod.id);
                const lectures = mod.lectures || [];

                return (
                  <div
                    key={mod.id}
                    className="bg-surface-container-lowest border border-outline-variant/5 rounded-2xl overflow-hidden transition-all"
                  >
                    {/* Module Header */}
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full p-5 flex items-center justify-between hover:bg-surface-container-low/50 transition-colors"
                    >
                      <div className="flex items-start gap-5 text-left">
                        <span className="text-2xl font-black text-outline-variant/40 font-headline">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <h4 className="text-lg font-bold text-on-surface mb-1 font-headline">{mod.title}</h4>
                          <p className="text-xs text-on-surface-variant/70">{mod.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                            {lectures.length} Lessons
                          </p>
                          <p className="text-[10px] text-on-surface-variant/60">{mod.total_duration}</p>
                        </div>
                        <span
                          className={`material-symbols-outlined text-on-surface-variant/40 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          expand_more
                        </span>
                      </div>
                    </button>

                    {/* Lectures List */}
                    {isExpanded && lectures.length > 0 && (
                      <div className="border-t border-outline-variant/10 bg-surface-container-low/30">
                        {lectures.map((lecture, lectureIndex) => (
                          <div
                            key={lecture.id}
                            className="flex items-center gap-4 px-5 py-3 border-b border-outline-variant/5 last:border-b-0 hover:bg-surface-container-low/50 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                              <span className="material-symbols-outlined text-on-surface-variant/60 text-sm">
                                play_circle
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-on-surface truncate">
                                {lectureIndex + 1}. {lecture.title}
                              </p>
                            </div>
                            <span className="text-[11px] font-bold text-on-surface-variant/60 uppercase">
                              {lecture.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <section>
              <h2 className="text-2xl font-extrabold tracking-tight mb-4 font-headline">Requirements</h2>
              <ul className="space-y-2">
                {course.requirements.map((req: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant/50 text-lg mt-0.5">arrow_right</span>
                    <span className="text-sm text-on-surface-variant">{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Instructor Section */}
          <section className="bg-on-surface rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center gap-12 text-surface overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_rgba(var(--primary-rgb),0.15),transparent_60%)] pointer-events-none opacity-50"></div>
            <div className="w-56 shrink-0 aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-white/10">
              <img
                src={instructorImage}
                className="w-full h-full object-cover"
                alt={instructor}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${courseId}`;
                }}
              />
            </div>
            <div className="relative z-10">
              <h3 className="text-4xl font-extrabold mb-3 tracking-tighter font-headline">Meet your instructor</h3>
              <p className="text-primary-fixed-dim text-lg font-bold mb-4 uppercase tracking-widest font-headline">{instructor}</p>
              <p className="text-surface/70 text-base leading-relaxed mb-6">
                {institution}. Expert in {course.category} with years of experience teaching and building real-world projects.
              </p>
              {course.tags && course.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {course.tags.slice(0, 4).map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-8 pl-0 lg:pl-8 border-l-0 lg:border-l border-outline-variant/20">
            <div className="flex flex-col gap-8 w-full">
              {/* Course Preview */}
              {course.thumbnail_url && (
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={course.thumbnail_url}
                    alt={title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
                    }}
                  />
                </div>
              )}

              {/* Course Stats */}
              <div className="space-y-4 pb-6 border-b border-outline-variant/10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 font-headline">Course Details</h4>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">schedule</span> Duration
                  </span>
                  <span className="font-black text-on-surface">{course.duration_string || '8 Weeks'}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">signal_cellular_alt</span> Level
                  </span>
                  <span className="font-black text-on-surface">{course.level || 'Intermediate'}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">play_lesson</span> Lectures
                  </span>
                  <span className="font-black text-on-surface">{course.lecture_count || 0}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">group</span> Students
                  </span>
                  <span className="font-black text-on-surface">{course.enrollment_count?.toLocaleString() || 0}</span>
                </div>
              </div>

              <div className="space-y-4">
                {enrollError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {enrollError}
                  </div>
                )}
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full py-4 bg-primary text-on-primary rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>

                <p className="text-[11px] leading-relaxed text-on-surface-variant text-center">
                  100% Free • Full lifetime access • Certificate of completion
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
