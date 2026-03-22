"""
AI service for tutor chat and quiz generation using Google Gemini.
Falls back to mock responses when API key is not available.
"""
import json
from typing import Optional
from datetime import datetime

from app.config import get_settings
from app.models.quiz import QuizQuestion, QuizOption

# Try to import Google Generative AI
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


class AIService:
    """Service for AI-powered tutoring and quiz generation."""

    def __init__(self):
        self.settings = get_settings()
        self._model = None

        if GENAI_AVAILABLE and self.settings.gemini_api_key:
            try:
                genai.configure(api_key=self.settings.gemini_api_key)
                self._model = genai.GenerativeModel("gemini-1.5-flash")
                print("Gemini AI initialized successfully")
            except Exception as e:
                print(f"Failed to initialize Gemini: {e}")

    @property
    def is_available(self) -> bool:
        return self._model is not None

    async def get_tutor_response(
        self,
        user_message: str,
        lecture_context: str,
        chat_history: list[dict],
    ) -> tuple[str, list[str]]:
        """
        Get AI tutor response for a user message.
        Returns: (response_text, suggested_prompts)
        """
        if not self.is_available:
            return self._mock_tutor_response(user_message)

        # Build the system prompt
        system_prompt = f"""You are an AI Teaching Assistant for an online course.
Your role is to help students understand the course material.

Current Lecture Context:
{lecture_context}

Instructions:
1. Answer the student's question based on the lecture context
2. Be helpful, encouraging, and educational
3. Use examples when helpful
4. Keep responses concise but comprehensive
5. At the end of your response, suggest 2 follow-up questions the student might ask

Format your response as JSON:
{{
    "response": "Your answer here",
    "suggested_prompts": ["Suggestion 1", "Suggestion 2"]
}}
"""

        # Build conversation
        messages = [{"role": "user", "parts": [system_prompt]}]

        for msg in chat_history[-5:]:  # Last 5 messages for context
            role = "user" if msg.get("role") == "user" else "model"
            messages.append({"role": role, "parts": [msg.get("content", "")]})

        messages.append({"role": "user", "parts": [user_message]})

        try:
            response = self._model.generate_content(messages)
            result = self._parse_json_response(response.text)
            return result.get("response", response.text), result.get("suggested_prompts", [])
        except Exception as e:
            print(f"AI error: {e}")
            return self._mock_tutor_response(user_message)

    async def generate_quiz(
        self,
        lecture_title: str,
        lecture_description: str,
        lecture_context: str,
    ) -> list[QuizQuestion]:
        """
        Generate a quiz based on lecture content.
        Returns list of QuizQuestion objects.
        """
        if not self.is_available:
            return self._mock_quiz_questions(lecture_title)

        prompt = f"""Generate a 5-question multiple choice quiz based on this lecture content.

Lecture Title: {lecture_title}
Lecture Description: {lecture_description}
Lecture Context: {lecture_context}

Requirements:
1. Create 5 thoughtful questions that test understanding
2. Each question should have 4 options (A, B, C, D)
3. Only one option should be correct
4. Include immediate feedback explaining why the correct answer is right

Return the quiz as JSON in this exact format:
{{
    "questions": [
        {{
            "id": "q1",
            "text": "Question text here?",
            "points": 2,
            "options": [
                {{"letter": "A", "text": "Option A", "is_correct": false}},
                {{"letter": "B", "text": "Option B", "is_correct": true}},
                {{"letter": "C", "text": "Option C", "is_correct": false}},
                {{"letter": "D", "text": "Option D", "is_correct": false}}
            ],
            "immediate_feedback": "B is correct because..."
        }}
    ]
}}
"""

        try:
            response = self._model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            questions = []

            for q in result.get("questions", []):
                options = [
                    QuizOption(
                        letter=opt["letter"],
                        text=opt["text"],
                        is_correct=opt.get("is_correct", False)
                    )
                    for opt in q.get("options", [])
                ]
                questions.append(QuizQuestion(
                    id=q.get("id", f"q{len(questions)+1}"),
                    text=q.get("text", ""),
                    points=q.get("points", 2),
                    options=options,
                    immediate_feedback=q.get("immediate_feedback")
                ))

            return questions if questions else self._mock_quiz_questions(lecture_title)

        except Exception as e:
            print(f"AI quiz generation error: {e}")
            return self._mock_quiz_questions(lecture_title)

    def _parse_json_response(self, text: str) -> dict:
        """Parse JSON from AI response, handling markdown code blocks."""
        # Remove markdown code blocks if present
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]

        try:
            return json.loads(text.strip())
        except json.JSONDecodeError:
            return {}

    def _mock_tutor_response(self, question: str) -> tuple[str, list[str]]:
        """Provide a mock tutor response for development."""
        response = f"""Great question! Let me explain this concept.

In the context of this lecture, the key points to understand are:

1. **Core Concept**: The foundational principles build upon established theories and practices.
2. **Application**: These concepts have real-world applications in industry and research.
3. **Connection**: This relates to earlier material we covered on foundational paradigms.

Would you like me to elaborate on any of these points or provide specific examples?"""

        suggestions = [
            "Can you give me an example?",
            "How does this relate to the previous module?"
        ]

        return response, suggestions

    def _mock_quiz_questions(self, lecture_title: str) -> list[QuizQuestion]:
        """Generate mock quiz questions for development."""
        return [
            QuizQuestion(
                id="q1",
                text=f"Which concept is fundamental to understanding {lecture_title}?",
                points=2,
                options=[
                    QuizOption(letter="A", text="The Semantic Parser Interface", is_correct=True),
                    QuizOption(letter="B", text="Probabilistic Logic Engines", is_correct=False),
                    QuizOption(letter="C", text="Neural-Symbolic Mapping Layer", is_correct=False),
                    QuizOption(letter="D", text="Hierarchical Temporal Memory Units", is_correct=False),
                ],
                immediate_feedback="A is correct. The Semantic Parser Interface forms the foundation for understanding how systems process and interpret structured data."
            ),
            QuizQuestion(
                id="q2",
                text="What is the primary benefit of the approach discussed in this lecture?",
                points=2,
                options=[
                    QuizOption(letter="A", text="Increased computational speed", is_correct=False),
                    QuizOption(letter="B", text="Better interpretability", is_correct=True),
                    QuizOption(letter="C", text="Lower memory usage", is_correct=False),
                    QuizOption(letter="D", text="Simpler implementation", is_correct=False),
                ],
                immediate_feedback="B is correct. Better interpretability allows researchers and practitioners to understand and verify the system's decision-making process."
            ),
            QuizQuestion(
                id="q3",
                text="In the context of this module, what does 'feedback loop' refer to?",
                points=2,
                options=[
                    QuizOption(letter="A", text="User interface response time", is_correct=False),
                    QuizOption(letter="B", text="Error correction mechanism", is_correct=False),
                    QuizOption(letter="C", text="Iterative refinement of predictions using outcomes", is_correct=True),
                    QuizOption(letter="D", text="System logging process", is_correct=False),
                ],
                immediate_feedback="C is correct. A feedback loop in this context refers to how system predictions are refined based on observed outcomes, creating a cycle of continuous improvement."
            ),
            QuizQuestion(
                id="q4",
                text="Which of the following is NOT a characteristic of the methodology presented?",
                points=2,
                options=[
                    QuizOption(letter="A", text="Scalability", is_correct=False),
                    QuizOption(letter="B", text="Deterministic outputs", is_correct=True),
                    QuizOption(letter="C", text="Adaptability", is_correct=False),
                    QuizOption(letter="D", text="Robustness", is_correct=False),
                ],
                immediate_feedback="B is correct. The methodology is probabilistic in nature, meaning outputs can vary based on input conditions and learned parameters, rather than being strictly deterministic."
            ),
            QuizQuestion(
                id="q5",
                text="According to the lecture, what is the recommended first step when implementing this approach?",
                points=2,
                options=[
                    QuizOption(letter="A", text="Deploy to production immediately", is_correct=False),
                    QuizOption(letter="B", text="Start with a comprehensive literature review", is_correct=False),
                    QuizOption(letter="C", text="Establish clear baseline metrics", is_correct=True),
                    QuizOption(letter="D", text="Write extensive documentation", is_correct=False),
                ],
                immediate_feedback="C is correct. Establishing clear baseline metrics allows you to measure the impact of your implementation and make data-driven decisions throughout the development process."
            ),
        ]


# Global instance
_ai_service: Optional[AIService] = None


def get_ai_service() -> AIService:
    """Get AI service singleton instance."""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
