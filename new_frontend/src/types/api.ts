// API Types matching backend responses

export interface CourseStats {
  rating: number;
  reviews_count: number;
  enrollment_count: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  institution: string;
  thumbnail_url: string;
  category: string;
  level: string;
  price: string;
  rating: number;
  rating_count: string;
  stars: number[];
  badge: string | null;
  badge_color: string;
  image: string;
  instructor_image: string;
}

export interface CourseDetail extends Course {
  duration_string: string;
  enrollment_count: number;
  what_you_will_learn: string[];
  requirements: string[];
  tags: string[];
  module_count: number;
  lecture_count: number;
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  total_duration: string;
  lecture_count: number;
  lectures: Lecture[];
}

export interface Lecture {
  id: string;
  title: string;
  order_index: number;
  duration: string;
  video_url?: string;
  description?: string;
  resources?: Resource[];
}

export interface Resource {
  title: string;
  type: string;
  size: string;
  file_url: string;
}

export interface LectureProgress {
  lecture_id: string;
  title: string;
  order_index: number;
  duration: string;
  is_completed: boolean;
  completed_at: string | null;
}

export interface ModuleProgress {
  module_id: string;
  title: string;
  order_index: number;
  status: 'completed' | 'in-progress' | 'locked';
  completed_count: number;
  total_count: number;
  lectures: LectureProgress[];
}

export interface CourseProgress {
  user_id: string;
  course_id: string;
  progress_percentage: number;
  enrollment_date: string;
  total_lectures: number;
  completed_lectures: number;
  modules: ModuleProgress[];
}

export interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail_url: string;
  progress_percentage: number;
  enrollment_date: string;
  last_accessed_module_id: string | null;
  last_accessed_lecture_id: string | null;
}

export interface QuizOption {
  letter: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  points: number;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  title: string;
  time_limit_seconds: number;
  question_count: number;
  total_points: number;
  questions: QuizQuestion[];
  context_source: {
    type: 'module' | 'lecture';
    id: string;
  };
}

export interface QuizResult {
  attempt_id: string;
  score: number;
  total_points: number;
  accuracy_percentage: number;
  correct_answers: Record<string, string>;
  time_taken_seconds: number;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export interface TutorChatResponse {
  response: string;
  suggested_prompts: string[];
  session_id: string;
}

export interface User {
  id: string;
  name: string;
  avatar_url: string;
  bio: string;
  skills: string[];
  role: 'student' | 'creator';
  joined_at: string;
}

export interface UserStats {
  user_id: string;
  enrolled_courses: number;
  completed_courses: number;
  average_progress: number;
  quizzes_taken: number;
  average_quiz_accuracy: number;
}
