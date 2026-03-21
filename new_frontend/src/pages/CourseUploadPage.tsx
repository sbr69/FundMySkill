import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function CourseUploadPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    thumbnail: null as File | null,
    video: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="bg-surface text-on-surface min-h-screen font-body flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent"></div>
        <div className="z-10 text-center max-w-2xl px-6">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/20">
            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 font-headline">Course Published!</h1>
          <p className="text-xl text-slate-600 mb-12 font-light leading-relaxed">
            Your course <span className="font-semibold text-slate-800">"{formData.title || 'Untitled Course'}"</span> has been successfully uploaded to the blockchain and is pending review.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/" className="px-8 py-4 bg-slate-900 text-white rounded-full font-silkscreen font-bold text-sm hover:bg-slate-800 transition-all shadow-md uppercase tracking-wide active:scale-95">
              Return Home
            </Link>
            <button 
              onClick={() => setSubmitted(false)}
              className="px-8 py-4 bg-slate-100 text-slate-900 rounded-full font-silkscreen font-bold text-sm hover:bg-slate-200 transition-all uppercase tracking-wide active:scale-95"
            >
              Upload Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 text-slate-900 selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen font-body pb-20">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 -z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-10 right-20 w-96 h-96 bg-primary rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-secondary rounded-full blur-[100px]"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl h-16 flex items-center justify-between px-6 md:px-12 border-b border-slate-200/50 font-headline antialiased shadow-sm">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tight text-slate-900 cursor-pointer hover:text-primary transition-colors">
            FundMySkill
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 text-sm font-bold tracking-wide uppercase">Creator Studio</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="hidden sm:flex items-center gap-2 h-10 px-5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all font-action font-bold text-xs uppercase tracking-widest leading-none shadow-sm">
            Exit
          </Link>
        </div>
      </nav>

      <main className="pt-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="mb-12 pt-8">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight font-headline mb-4">
              Creator Studio
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl font-light leading-relaxed">
              Design, build, and list your comprehensive course path. Empower the FundMySkill community with your expertise.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            
            {/* Left Column: Details */}
            <div className="xl:col-span-8 flex flex-col gap-10">
              
              <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-200/60">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600">edit_document</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 font-headline">Core Details</h2>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label htmlFor="title" className="block text-sm font-bold text-slate-700 tracking-wide uppercase">Course Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      placeholder="e.g. Master React & Web3 Integration 2026"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-6 py-5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 text-lg placeholder-slate-400 font-medium"
                    />
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="description" className="block text-sm font-bold text-slate-700 tracking-wide uppercase">Comprehensive Syllabus</label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={6}
                      placeholder="Detail the curriculum. What key concepts will students master by the end of this course?"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-6 py-5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 text-lg placeholder-slate-400 font-medium resize-y"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-200/60">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-purple-600">category</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 font-headline">Classification & Pricing</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label htmlFor="category" className="block text-sm font-bold text-slate-700 tracking-wide uppercase">Domain</label>
                    <div className="relative">
                      <select
                        id="category"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-6 py-5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 text-lg appearance-none font-medium text-slate-700 cursor-pointer"
                      >
                        <option value="" disabled>Select a learning domain</option>
                        <option value="programming">Software Engineering & Tech</option>
                        <option value="design">Design & Visual Arts</option>
                        <option value="business">Business & Economics</option>
                        <option value="marketing">Digital Marketing</option>
                        <option value="personal_development">Leadership & Growth</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="price" className="block text-sm font-bold text-slate-700 tracking-wide uppercase">Value (USDC)</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        min="0"
                        step="0.01"
                        placeholder="Leave 0 for Community Free"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-6 py-5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 text-lg placeholder-slate-400 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Media & Actions */}
            <div className="xl:col-span-4 flex flex-col gap-10">
              
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 sticky top-24">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-orange-600">perm_media</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 font-headline">Media Assets</h2>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 tracking-wide uppercase">Cover Artwork</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl h-48 flex flex-col items-center justify-center hover:bg-slate-50/80 transition-colors cursor-pointer group relative overflow-hidden bg-slate-50/30">
                      <input 
                        type="file" 
                        name="thumbnail" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {formData.thumbnail ? (
                        <div className="absolute inset-0 z-0 bg-blue-50 flex flex-col items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-blue-500 mb-2">check_circle</span>
                          <span className="text-sm font-bold text-blue-900 px-4 text-center truncate w-full">{formData.thumbnail.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-3 text-slate-500 group-hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-5xl">add_photo_alternate</span>
                          <div className="text-center">
                            <span className="font-bold block">Upload Image</span>
                            <span className="text-xs text-slate-400">1920x1080px recommended</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 tracking-wide uppercase">Trailer / Intro Video</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl h-48 flex flex-col items-center justify-center hover:bg-slate-50/80 transition-colors cursor-pointer group relative overflow-hidden bg-slate-50/30">
                      <input 
                        type="file" 
                        name="video" 
                        accept="video/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {formData.video ? (
                        <div className="absolute inset-0 z-0 bg-purple-50 flex flex-col items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-purple-500 mb-2">check_circle</span>
                          <span className="text-sm font-bold text-purple-900 px-4 text-center truncate w-full">{formData.video.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-3 text-slate-500 group-hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-5xl">video_call</span>
                          <div className="text-center">
                            <span className="font-bold block">Upload Video</span>
                            <span className="text-xs text-slate-400">MP4, max 100MB</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full h-16 rounded-2xl bg-slate-900 text-white font-silkscreen font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3 shadow-xl ${
                        isSubmitting ? 'opacity-80 bg-slate-800 cursor-wait' : 'hover:bg-slate-800 hover:shadow-slate-900/20 hover:-translate-y-1 active:scale-[0.98]'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin material-symbols-outlined">autorenew</span>
                          Processing...
                        </>
                      ) : (
                        <>
                          Publish Course
                          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                        </>
                      )}
                    </button>
                    <p className="text-xs text-center text-slate-400 mt-4 px-4 leading-relaxed font-body">
                      By publishing, you agree to our <a href="#" className="underline">Creator Terms</a> and confirm you own the rights to the uploaded content.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </form>

        </div>
      </main>
    </div>
  );
}
