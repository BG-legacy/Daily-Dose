import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ 
  path: path.join(__dirname, '../../.env')
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyzes user's mood input and provides personalized feedback
 * @param {Object} moodData - Object containing mood type (happy/sad/stressed) and context
 * @returns {Promise<Object>} Personalized content package including quote, tip, and hack
 */
const analyzeMoodInput = async (moodData) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an empathetic AI assistant specializing in mood-based content generation.
            Based on the user's mood (happy/sad/stressed), generate:
            1. An inspirational quote that resonates with their current state
            2. A mental health tip that's immediately actionable
            3. A productivity hack that considers their emotional state
            
            Format as JSON with these exact fields:
            {
              "quote": {
                "text": "the quote",
                "author": "quote author"
              },
              "mentalHealthTip": {
                "title": "brief title",
                "description": "detailed tip"
              },
              "productivityHack": {
                "title": "brief title",
                "description": "detailed hack"
              }
            }`
        },
        {
          role: "user",
          content: `Generate personalized content for mood:
            ${JSON.stringify(moodData)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing mood:', error);
    throw new Error('Failed to analyze mood');
  }
};

/**
 * Generates mood-specific coping strategies
 * @param {string} moodType - One of: 'happy', 'sad', 'stressed'
 * @param {string} context - Additional context about the mood
 * @returns {Promise<Object>} Tailored coping strategies
 */
const generateMoodStrategies = async (moodType, context = '') => {
  const moodPrompts = {
    happy: "Provide strategies to maintain and build upon this positive mood",
    sad: "Offer gentle, uplifting strategies to improve mood and practice self-care",
    stressed: "Suggest calming techniques and stress-management strategies"
  };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Generate personalized strategies for ${moodType} mood.
            Format as JSON with:
            {
              "immediateActions": ["3 quick things to do right now"],
              "shortTermStrategies": ["3 strategies for today"],
              "longTermPractices": ["3 habits to develop"],
              "encouragement": "A supportive message"
            }`
        },
        {
          role: "user",
          content: `${moodPrompts[moodType]}
            Context: ${context}`
        }
      ],
      temperature: 0.6,
      max_tokens: 400,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating strategies:', error);
    throw new Error('Failed to generate mood strategies');
  }
};

/**
 * Tracks mood patterns over time
 * @param {Array} moodHistory - Array of past mood entries
 * @returns {Promise<Object>} Analysis of patterns and trends
 */
const analyzeMoodPatterns = async (moodHistory) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze mood patterns and provide results as JSON with these exact fields:
            {
              "commonTriggers": {
                "happy": ["triggers for happiness"],
                "sad": ["triggers for sadness"],
                "stressed": ["triggers for stress"]
              },
              "timePatterns": {
                "description": "observed time-based patterns",
                "recommendations": ["suggestions based on timing"]
              },
              "progressIndicators": {
                "improvements": ["positive changes"],
                "challenges": ["areas needing attention"]
              }
            }`
        },
        {
          role: "user",
          content: `Analyze these mood entries and identify patterns as JSON:
            ${JSON.stringify(moodHistory)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing mood patterns:', error);
    throw new Error('Failed to analyze mood patterns');
  }
};

/**
 * Gets daily inspiration based on mood
 * @param {string} moodType - One of: 'happy', 'sad', 'stressed'
 * @returns {Promise<Object>} Daily inspiration package
 */
const getDailyMoodInspiration = async (moodType) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Generate a daily inspiration package for ${moodType} mood.
            Return as JSON with these exact fields:
            {
              "morningAffirmation": "positive statement to start the day",
              "eveningReflection": "thoughtful question for evening",
              "mindfulnessExercise": {
                "title": "exercise name",
                "steps": ["step-by-step instructions"]
              },
              "gratitudePrompt": "specific prompt for gratitude journaling"
            }`
        },
        {
          role: "user",
          content: `Create daily inspiration for ${moodType} mood state as JSON`
        }
      ],
      temperature: 0.6,
      max_tokens: 400,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating daily inspiration:', error);
    throw new Error('Failed to generate daily inspiration');
  }
};

export {
  analyzeMoodInput,
  generateMoodStrategies,
  analyzeMoodPatterns,
  getDailyMoodInspiration
}; 