import { useState, useEffect, useCallback } from 'react';
import { courseApi, progressApi, quizApi, aiApi, userApi } from '../services/api';
import type {
  Course,
  CourseDetail,
  CourseProgress,
  EnrolledCourse,
  Quiz,
  QuizResult,
  TutorChatResponse,
  ChatMessage,
  User,
  UserStats,
} from '../types/api';

// Generic fetch hook
function useFetch<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = []
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// Courses hooks
export function useCourses(filters?: {
  category?: string;
  level?: string;
  search?: string;
}) {
  return useFetch(
    () => courseApi.list(filters),
    [filters?.category, filters?.level, filters?.search]
  );
}

export function useCourse(courseId: string) {
  return useFetch(() => courseApi.get(courseId), [courseId]);
}

export function useEnroll() {
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enroll = async (courseId: string) => {
    setEnrolling(true);
    setError(null);
    try {
      const result = await courseApi.enroll(courseId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll');
      throw err;
    } finally {
      setEnrolling(false);
    }
  };

  return { enroll, enrolling, error };
}

// Progress hooks
export function useCourseProgress(courseId: string) {
  return useFetch(() => progressApi.getCourseProgress(courseId), [courseId]);
}

export function useEnrolledCourses() {
  return useFetch(() => progressApi.getEnrolledCourses(), []);
}

export function useCompleteLecture() {
  const [completing, setCompleting] = useState(false);

  const complete = async (courseId: string, lectureId: string) => {
    setCompleting(true);
    try {
      const result = await progressApi.completeLecture(courseId, lectureId);
      return result;
    } finally {
      setCompleting(false);
    }
  };

  return { complete, completing };
}

// Quiz hooks
export function useQuiz(quizId: string) {
  return useFetch(() => quizApi.get(quizId), [quizId]);
}

export function useSubmitQuiz() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const submit = async (
    quizId: string,
    answers: Record<string, string>,
    timeTakenSeconds: number
  ) => {
    setSubmitting(true);
    try {
      const res = await quizApi.submit(quizId, answers, timeTakenSeconds);
      setResult(res);
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, result };
}

// AI Tutor hooks
export function useAiTutor(lectureId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Load session history on mount
  useEffect(() => {
    if (lectureId) {
      aiApi.getSessionHistory(lectureId).then((res) => {
        setMessages(res.messages || []);
        setSessionId(res.session_id);
      }).catch(() => {
        // Start fresh if no history
      });
    }
  }, [lectureId]);

  const sendMessage = async (message: string) => {
    setSending(true);

    // Optimistically add user message
    const userMsg: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await aiApi.chat(lectureId, message);

      // Add AI response
      const aiMsg: ChatMessage = {
        role: 'ai',
        content: response.response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setSuggestedPrompts(response.suggested_prompts);
      setSessionId(response.session_id);

      return response;
    } catch (err) {
      // Remove optimistic message on error
      setMessages((prev) => prev.slice(0, -1));
      throw err;
    } finally {
      setSending(false);
    }
  };

  return { messages, suggestedPrompts, sending, sendMessage, sessionId };
}

export function useGenerateQuiz() {
  const [generating, setGenerating] = useState(false);

  const generate = async (lectureId: string) => {
    setGenerating(true);
    try {
      return await aiApi.generateQuiz(lectureId);
    } finally {
      setGenerating(false);
    }
  };

  return { generate, generating };
}

// User hooks
export function useUser() {
  return useFetch(() => userApi.getMe(), []);
}

export function useUserStats() {
  return useFetch(() => userApi.getStats(), []);
}
