import { useState } from 'react';
import { Link } from 'react-router-dom';

const courses = [
  {
    id: '1',
    title: 'Applied Machine Learning & Neural Networks',
    description: 'A deep dive into tensor operations, backpropagation, and large-scale model deployment architectures.',
    instructor: 'Dr. Elena Vance',
    institution: 'Stanford AI Faculty',
    rating: 4.9,
    ratingCount: '2.4k',
    stars: [1, 1, 1, 1, 0.5],
    price: '$149.00',
    badge: 'Best Seller',
    badgeColor: 'text-primary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGrAUlhDlNQD7vRj_KU_qkFaFsRjz12naK2q3EAjwCvX62UxoaAia8cNcAXhYbi_lso-6KtbRK3cPxzq_KYcXMqsIEweqp4E9nyEUMeeGJfSkvkc7b5ezRFAmt4cz70BN9DDRS1GN9u24bdOsY1WWJQToVUIMa4WQdS3KxU6R4cl2UGkOvp13U6CJlM973nPT7vZP6XVcZgBR-DoErBrLw4DEdpy3fxnlLSCNMRoKVHacIZnbbOuEYbysHQTidRlDT8ZtxD-3k-F8',
    instructorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyUq4Wayh_h4Nht78BIIRJD2t6CM3uRisdZRb5qmv6i2JJp75Z3z3MooWMKUpWD04i2G92kOule5wD08xMTZ5qisIyvxoMD4tFZ2nuZBl3sB03B3Jo33cRv7L2ki-WcWH58MgWZMPmTT3-_vbSz_qTqA46aF5Tj3aaRyyDA5gfUVv6ySvoLtr7vntlQzFnEFWuJX0CjEk1dzHJOi_yTvhBy_6C_9k3eZhPnjNk70CqBjvCCNXJMKU1jccSek3XmTnstf04nYdMjvQ',
  },
  {
    id: '2',
    title: 'Principles of Generative Urban Design',
    description: 'Exploring how algorithmic logic and procedural generation can revitalize urban living spaces.',
    instructor: 'Julian Thorne',
    institution: 'RIBA Gold Medalist',
    rating: 4.8,
    ratingCount: '812',
    stars: [1, 1, 1, 1, 0],
    price: '$199.00',
    badge: 'New Module',
    badgeColor: 'text-tertiary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFOGvl9jwRiAjHGHWmuNrp4LF3g8xNWq2M-FFv8Pje9tjemwIhLjqtLfaH47mu7Nm5jRSgUOfubIJZiSjK4a8aLY-6WTrdE4dCihSw4wNM5sppIHaoxs7K_wKMFdReT99QMBFEsBNfHXxoSWO-BwkhvXiWNeD5XZwSWbPROQWhJVbYwgpfzA87y0H4OJ_FJabcExL0h1UtkLbjq2KsbAyTGedWch6v-z004k8_DsNBqjbxjcrPBw4EVrDRbXqTfvTGEL9Jeq3OJ80',
    instructorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ7cENpd8Ohf5Z-KSGuPyNTWdTCm0VWZnRhY6aR5bvfIub3xzKRH3GnqRvGav6YnHSDw3JviyQQDq26hWaBLr4F7rNUmsewQNlhII-3oaOq2-FkPSZYpxXU2UNwHx1A_uScYN_3IxXE3RLKEj-OY4HdNZDvBzaAnVjIzI4pe_zvmlx21kEQgP2ui0_BMt5jELo8IE1bQCFB-6LbJRQoEfKu3w6-Psm-6d3prGqNLgLG5Je4pJdSGuv6cx5BpkI2d4lNou9iLEQZI4',
  },
  {
    id: '3',
    title: 'Ethics of the Anthropocene',
    description: 'Navigating the moral landscape of a human-centric era. A philosophical study on global responsibility.',
    instructor: 'Dr. Aris Thorne',
    institution: 'Cambridge Philosophy Fellow',
    rating: 5.0,
    ratingCount: '430',
    stars: [1, 1, 1, 1, 1],
    price: '$89.00',
    badge: null,
    badgeColor: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA43FGrzD7oZN3fIFoGN87K3tqkG2K85SEOVNvNWJTaFIlSqtr9KhXcJMne5SdKtAEnKc-PSRI3sipKFNZu9RmPVOiJRe6vKxoDsnGMzD322FDN7p8sWI8HveMYd-_h9ZPkROdFx8PeBl287ZLhV6zr5kq_FtnZvO7E3SpBz7DLfCQUSiTnl_B-vKJjO36En8mgX1WOUSI8uhwU-wUL0bBfSJaDQ2Wa96m5t67gjfAGu9IMmYLh8ar0IdyUqCIajbnzfKrc8CLZkkc',
    instructorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgTs8UvGjvJetwA9lemNy-AcVbdbIF5_qZLkvaVs56xGHt3ecljGLw5WuGInRJXEVEJyxBapiv-GGBnQc_CSLu2HNvGVitiwMzsMn45Tf9QD9AhmhqhvjAU7PPOJXe0R_smWKHvJJNrxQyD5yPJsfoazHuIeYahgtAGdH_usaTDzJsL9ZVGU2glNHhyVY2ekUC-SoyrulCj88v1_nDnnYiZDaQAsk1RNXTx5g8eg1md5T67nA4fL4rhXvgg_4DM0pQYMvq3JKkjZ4',
  },
  {
    id: '4',
    title: 'Quantum Mechanics: Field Theory',
    description: 'Rigorous mathematical frameworks for subatomic interactions and quantum entanglement phenomena.',
    instructor: 'Prof. Marcus Chen',
    institution: 'CERN Researcher',
    rating: 4.9,
    ratingCount: '1.1k',
    stars: [1, 1, 1, 1, 0.5],
    price: '$220.00',
    badge: 'Level: Advanced',
    badgeColor: 'text-secondary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRCL3aMvD_6iHhyizNZRAp7j9DtvDVkD2coOp19cCj4RZcVUDXE6d8ckB4TTDbnHeU8lkq2zezCChZs5RXK627rw9_8HmtGlPQi_wPCzlsmRBlL4pxlfvH2HQuQddI6fh2lXaXzVR3lwJOV2W0WWVfRgPIctwT_oIcfKhhO9GN0vg8FG13t-Li8fbeapl6Xwr5Rj3omnwNmVyrHUpnKMuiKVM4AWsZl1qqFz97VmHX9i6K8NBhOpECgQ3NleUs2Q38EQFQDoRpJNE',
    instructorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5lWbq4nXME82MPhuvnd5_gLn9b8Ve9A1rw183cv18kMTmusK2jKN4_XdgZlX73AAOmrLfLNwFJq5YFEN5uo-xJ68ZhsK32EaQeTIL6IdqUdtZpwJU_MNS6afzLuWmsTEB-_Wgbt6DPsA_blgBAkB6UCrXH5nf1ooiGeS49qhQJLHixXUguja0C8n5WhwH2yA7Ry7yyuTKeGwYP087v6Tir7gmesuPft1oGGpiXSQCho8B6GMXE--NFVJa8YiBWyzr44lOtTbLcwY',
  },
];

function StarRating({ stars }: { stars: number[] }) {
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

export function CourseCataloguePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* Hero / Title Section */}
      <header className="mb-16 relative flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl font-extrabold text-on-surface tracking-tight leading-none font-headline">The Course Catalogue</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Curated experiences designed for deep cognitive mastery. Browse our collection of advanced academic modules.
          </p>
        </div>
        

      </header>

      <div className="flex gap-12 items-start">
        {/* Filters Sidebar */}
        <aside className="w-72 shrink-0 sticky top-28 space-y-10">
          <section>
            <h3 className="font-headline font-bold text-sm mb-6 uppercase tracking-wider text-slate-400">Category</h3>
            <div className="flex flex-col gap-3">
              {['Computer Science', 'Architecture & Design', 'Theoretical Physics', 'Modern Philosophy'].map((cat, i) => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    defaultChecked={i === 0}
                    className="w-5 h-5 rounded-lg border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-low transition-colors"
                    type="checkbox"
                  />
                  <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{cat}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-headline font-bold text-sm mb-6 uppercase tracking-wider text-slate-400">Difficulty</h3>
            <div className="flex flex-wrap gap-2">
              {['Foundational', 'Intermediate', 'Mastery'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    selectedDifficulty === diff
                      ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-primary/10'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-headline font-bold text-sm mb-6 uppercase tracking-wider text-slate-400">Duration</h3>
            <div className="space-y-4">
              <input className="w-full h-1.5 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary" type="range" />
              <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase">
                <span>2 Weeks</span>
                <span>12+ Weeks</span>
              </div>
            </div>
          </section>
        </aside>

        {/* Grid Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-10">
            <p className="text-sm font-medium text-on-surface-variant">
              Showing <span className="text-on-surface font-bold">24</span> active modules
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort By:</span>
              <select className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer">
                <option>Most Relevant</option>
                <option>Newest Arrivals</option>
                <option>Top Rated</option>
              </select>
            </div>
          </div>

          {/* Bento-ish Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group relative bg-surface-container-lowest rounded-[2rem] p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full border border-outline-variant/10"
              >
                <div className="relative w-full h-56 mb-8 rounded-2xl overflow-hidden">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={course.title}
                    src={course.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  {course.badge && (
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold ${course.badgeColor} uppercase`}>
                        {course.badge}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating stars={course.stars} />
                    <span className="text-xs font-bold text-on-surface-variant">{course.rating} ({course.ratingCount})</span>
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors font-headline">{course.title}</h3>
                  <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-3 mb-8">
                    <img className="w-10 h-10 rounded-full bg-slate-100" alt={course.instructor} src={course.instructorImage} />
                    <div>
                      <p className="text-sm font-bold text-on-surface">{course.instructor}</p>
                      <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">{course.institution}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tuition</p>
                    <p className="text-xl font-extrabold text-on-surface">{course.price}</p>
                  </div>
                  <button className="px-8 py-3 bg-primary bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-primary/20">
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination / Load More */}
          <div className="mt-16 flex justify-center">
            <button className="flex items-center gap-3 px-10 py-4 bg-surface-container-high text-on-surface font-bold rounded-2xl hover:bg-surface-container-highest transition-colors active:scale-95">
              <span>Explore More Modules</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
          </div>
        </div>
      </div>

      {/* FAB for quick action */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-xl shadow-secondary/30 active:scale-90 transition-transform z-50">
        <span className="material-symbols-outlined">edit_square</span>
      </button>
    </div>
  );
}
