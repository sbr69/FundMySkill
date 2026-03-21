import { useParams, Link } from 'react-router-dom';
import { courses, StarRating } from './CourseCataloguePage';

export function CourseOverviewPage() {
  const { courseId } = useParams();
  const course = courses.find((c) => c.id === courseId) || courses[1]; // Fallback to generative urban design

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
            <h1 className="text-5xl font-extrabold text-on-surface leading-[1.1] mb-8 tracking-tighter font-headline">
              {course.title.includes(':') ? (
                course.title.split(':').map((part, i) => (
                  <span key={i} className={i === 1 ? 'block text-primary italic' : 'block'}>
                    {part.trim()}
                    {i === 0 && ' :'}
                  </span>
                ))
              ) : (
                course.title
              )}
            </h1>
            <p className="text-xl text-on-surface-variant leading-relaxed opacity-90 max-w-2xl">
              {course.description} Bridging the gap between theory and high-impact deployment in modern industry.
            </p>

            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-3">
                <img src={course.instructorImage} className="w-12 h-12 rounded-full border-2 border-white shadow-md shadow-black/5" alt={course.instructor} />
                <div>
                  <p className="text-sm font-bold text-on-surface leading-none mb-1">{course.instructor}</p>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">{course.institution}</p>
                </div>
              </div>
              <div className="h-10 w-[1px] bg-outline-variant/20"></div>
              <div className="flex items-center gap-2 drop-shadow-sm">
                <StarRating stars={course.stars} />
                <span className="text-xs font-black text-on-surface/70">{course.rating}</span>
                <span className="text-[10px] font-bold text-on-surface-variant opacity-60">({course.ratingCount} Reviews)</span>
              </div>
            </div>
          </section>

          {/* Curriculum Section */}
          <section>
            <div className="flex items-end justify-between mb-3 pb-1 border-b border-outline-variant/10">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-1 font-headline">Curriculum</h2>
                <p className="text-sm text-on-surface-variant opacity-70">A rigorous deep dive into the future of {course.title.split(':')[0]}.</p>
              </div>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4].map((week) => (
                <div key={week} className="bg-surface-container-lowest border border-outline-variant/5 hover:border-primary/20 rounded-3xl p-6 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-6">
                      <span className="text-3xl font-black text-outline-variant/30 group-hover:text-primary/30 transition-colors font-headline">0{week}</span>
                      <div>
                        <h4 className="text-lg font-bold text-on-surface mb-1 font-headline">Module 0{week}: {week === 1 ? 'Foundations & Parametric Logic' : week === 2 ? 'Data & Environmental Mapping' : week === 3 ? 'Algorithmic Optimization' : 'Thesis Synthesis'}</h4>
                        <p className="text-xs text-on-surface-variant/70 line-clamp-1">Master the core frameworks and procedural logic required for high-level {week === 1 ? 'spatial layout' : 'industry deployment'}.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-surface-container rounded-full text-[9px] font-black text-on-surface uppercase tracking-widest opacity-60">12 Lessons</span>
                      <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-primary transition-colors">expand_more</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Assignments Section */}
          <section>
            <div className="flex items-end justify-between mb-3 pb-1 border-b border-outline-variant/10">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-1 font-headline">Assignments & Assessments</h2>
                <p className="text-sm text-on-surface-variant opacity-70">Evaluate your understanding through structured tasks.</p>
              </div>
            </div>

            {/* Assessment Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Quizzes', value: '12', icon: 'quiz' },
                { label: 'Module Tests', value: '04', icon: 'assignment' },
                { label: 'Evaluations', value: 'Monthly', icon: 'frame_inspect' },
                { label: 'Timeline', value: 'Weekly', icon: 'event_repeat' }
              ].map(stat => (
                <div key={stat.label} className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4 flex flex-col items-center text-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-primary/60 text-lg mb-1">{stat.icon}</span>
                  <p className="text-lg font-black text-on-surface font-headline leading-none">{stat.value}</p>
                  <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary">
                    <span className="material-symbols-outlined">quiz</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">On-Demand Assessments</h4>
                    <p className="text-xs text-on-surface-variant/70">Take quizzes anytime to test your knowledge.</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline-variant/40 group-hover:text-primary transition-colors">chevron_right</span>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary">
                    <span className="material-symbols-outlined">assignment_turned_in</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">Fixed Schedule Assignments</h4>
                    <p className="text-xs text-on-surface-variant/70">Deadlines aligned with weekly progress.</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline-variant/40 group-hover:text-primary transition-colors">chevron_right</span>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary">
                    <span className="material-symbols-outlined">calendar_month</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">Weekly & Monthly Assessments</h4>
                    <p className="text-xs text-on-surface-variant/70">Periodic evaluations for concept mastery.</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline-variant/40 group-hover:text-primary transition-colors">chevron_right</span>
              </div>
            </div>
          </section>

          {/* Certification Criteria Section */}
          <section>
            <div className="flex items-end justify-between mb-3 pb-1 border-b border-outline-variant/10">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-1 font-headline">Certification Criteria</h2>
                <p className="text-sm text-on-surface-variant opacity-70">Minimum requirements to earn your professional certificate.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined">fact_check</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-sm mb-1">Module Progress</h4>
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-2">100% Completion</p>
                  <p className="text-[10px] text-on-surface-variant/70 font-medium">All sub-modules and lessons must be finished.</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined">leaderboard</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-sm mb-1">Aggregate Score</h4>
                  <p className="text-[10px] font-black uppercase text-secondary tracking-widest leading-none mb-2">70% Minimum</p>
                  <p className="text-[10px] text-on-surface-variant/70 font-medium">Average across all weekly and monthly assessments.</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">rule</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-sm mb-1">Test Completion</h4>
                  <p className="text-[10px] font-black uppercase text-tertiary tracking-widest leading-none mb-2">3/4 Attempted</p>
                  <p className="text-[10px] text-on-surface-variant/70 font-medium">Must attempt at least 3 out of 4 major module tests.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Instructor & Social Proof */}
          <section className="bg-on-surface rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center gap-12 text-surface overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_rgba(var(--primary-rgb),0.15),transparent_60%)] pointer-events-none opacity-50"></div>
            <div className="w-56 shrink-0 aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-white/10">
              <img src={course.instructorImage} className="w-full h-full object-cover" alt={course.instructor} />
            </div>
            <div className="relative z-10">
              <h3 className="text-4xl font-extrabold mb-3 tracking-tighter font-headline">Meet your lead.</h3>
              <p className="text-primary-fixed-dim text-lg font-bold mb-6 uppercase tracking-widest font-headline">{course.instructor}</p>
              <p className="text-surface/70 text-base leading-relaxed mb-8">
                Pioneer in the "Responsive Systems" theory. With over 15 years of experience at the intersection of complex logic and practical deployment architectures.
              </p>
              <div className="flex flex-wrap gap-3">
                {['PhD Mathematics', 'AIA Award Winner', 'TED Global Speaker'].map(badge => (
                  <span key={badge} className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">{badge}</span>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="lg:fixed lg:top-1/2 lg:-translate-y-1/2 lg:w-[300px] xl:w-[325px] pl-12 lg:pl-16 border-l border-outline-variant/20 z-20">
            <div className="flex flex-col gap-8 w-full">
              {/* Course Stats */}
              <div className="space-y-4 pb-6 border-b border-outline-variant/10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 font-headline">Course Stats</h4>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant font-medium">Duration</span>
                  <span className="font-black text-on-surface">8 Weeks</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant font-medium">Level</span>
                  <span className="font-black text-on-surface">{course.badge?.replace('Level: ', '') || 'Professional'}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant font-medium">Category</span>
                  <span className="font-black text-on-surface">Computer Science</span>
                </div>
              </div>

              {/* Library & Resources */}
              <div className="space-y-4 pb-6 border-b border-outline-variant/10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 font-headline">Library & Resources</h4>
                {[
                  { label: 'Short Notes', count: '12 Files' },
                  { label: 'Mind Maps', count: '04 Maps' },
                  { label: 'Templates', count: '08 Packs' }
                ].map(res => (
                  <div key={res.label} className="flex justify-between items-center text-[13px]">
                    <span className="text-on-surface-variant font-medium">{res.label}</span>
                    <span className="font-black text-on-surface">{res.count}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <button className="w-full py-5 bg-primary text-on-primary rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Enroll Now
                </button>

                <div className="pt-2 px-1">
                  <p className="text-[11px] leading-relaxed text-on-surface-variant font-bold">
                    <span className="font-black text-primary uppercase mr-1">Note:</span>
                    Active course participation is authorized for a 12-month duration. Please be advised that all modules and assessments must be finalized within the prescribed schedule to maintain certification eligibility. Core study materials remain accessible indefinitely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
