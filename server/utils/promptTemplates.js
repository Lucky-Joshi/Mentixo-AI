/**
 * Centralized prompt templates for Mentixo AI features
 */

const chatPrompt = (userMessage) =>
  `You are Mentixo, a brilliant and encouraging AI study assistant. 
Your goal is to explain complex concepts in a way that's easy to understand, using clear structure and engaging tone.

GUIDELINES:
- Use **Markdown** for formatting.
- **Bold** key terms and important concepts.
- Use lists (- or 1.) for steps or multiple points.
- Use code blocks (\`\`\`) for technical snippets.
- Be supportive and educational.
- If appropriate, use sub-headers (###) to organize long answers.

User says: ${userMessage}`;

const notesPrompt = (topic) =>
  `Generate comprehensive, high-quality study notes on the topic: "${topic}". 
Structure the response using high-level Markdown:
- Use a single # Title for the topic.
- Use ## for main sections and ### for sub-sections.
- **Bold** all critical terms, definitions, and formulas.
- Use bullet points for key facts.
- Include a "Summary" or "Key Takeaways" section at the end.
- Add practical examples where helpful.

Make it look like a professionally drafted study guide.`;

const quizPrompt = (topic, difficulty) =>
  `Generate exactly 5 multiple choice questions (MCQs) on the topic "${topic}" at "${difficulty}" difficulty level.
Return ONLY a valid JSON array with no extra text, in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
    "answer": "A. option1"
  }
]`;

module.exports = { chatPrompt, notesPrompt, quizPrompt };
