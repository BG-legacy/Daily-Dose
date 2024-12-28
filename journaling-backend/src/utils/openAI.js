import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ 
  path: path.join(__dirname, '../../../journaling-backend/.env')
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyzes a journal entry to provide personalized insights
 * @param {string} journalText - The journal entry text to analyze
 * @returns {Promise<string>} Analysis including:
 * - Inspirational quote related to the situation
 * - Mental health tip
 * - Actionable productivity suggestion
 */
const analyzeJournalEntry = async (journalText) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Specify the model to use
      messages: [
        {
          role: "system",
          content: `You are an empathetic AI assistant specializing in journal analysis. 
            Consider the writer's emotional state, personal context, and specific situations when providing advice.
            Your responses should be supportive, non-judgmental, and tailored to the individual's needs.`
        },
        {
          role: "user",
          content: `Analyze this journal entry and provide three personalized elements:
            1. An inspirational quote that directly relates to the specific situation or emotion expressed
            2. A practical mental health tip that addresses the specific challenges mentioned
            3. A concrete, actionable productivity suggestion based on the context provided
            
            Please ensure all recommendations are specific to the situation, not generic advice.
            
            Journal entry: "${journalText}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing journal entry:', error);
    throw new Error('Failed to analyze journal entry');
  }
};

/**
 * Performs detailed sentiment analysis on journal entries
 * @param {string} journalText - The journal entry text to analyze
 * @returns {Promise<Object>} JSON object containing:
 * - Main emotion with intensity and context
 * - Secondary emotions
 * - Sentiment score (-1 to 1)
 * - Confidence score (0 to 1)
 * - Emotional trends and patterns
 */
const analyzeSentiment = async (journalText) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI specialized in advanced sentiment analysis and emotional intelligence.
            Approach the analysis with:
            1. Contextual Understanding: Consider cultural nuances, idioms, and personal expression styles
            2. Temporal Analysis: Track emotional changes throughout the text
            3. Intensity Recognition: Gauge the strength of expressed emotions
            4. Multi-dimensional Analysis: Consider both explicit and implicit emotional cues
            5. Behavioral Patterns: Identify recurring emotional themes or triggers`
        },
        {
          role: "user",
          content: `Perform a comprehensive sentiment analysis of this journal entry.
            Return a JSON object with:
            {
              "mainEmotion": {
                "name": "primary emotion detected",
                "intensity": "scale 1-10",
                "context": "brief explanation of why this emotion was identified"
              },
              "secondaryEmotions": [
                {
                  "name": "emotion name",
                  "intensity": "scale 1-10",
                  "context": "brief explanation"
                }
              ],
              "sentimentScore": "scale from -1 to 1",
              "confidenceScore": "scale from 0 to 1",
              "emotionalTrends": {
                "progression": "description of emotional flow",
                "patterns": ["identified patterns"],
                "triggers": ["identified emotional triggers"]
              },
              "recommendedFocus": "area for emotional growth or attention"
            }
            
            Journal entry: "${journalText}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 500, // Increased to accommodate more detailed analysis
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    
    // Add metadata for training purposes
    return {
      ...analysis,
      _metadata: {
        timestamp: new Date().toISOString(),
        modelVersion: "gpt-4o",
        analysisVersion: "2.0"
      }
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw new Error('Failed to analyze sentiment');
  }
};

/**
 * Validates the structure and values of sentiment analysis results
 * @param {Object} analysis - The sentiment analysis result to validate
 * @returns {boolean} True if analysis meets all requirements
 */
const validateAnalysis = (analysis) => {
  const requiredFields = [
    'mainEmotion',
    'secondaryEmotions',
    'sentimentScore',
    'confidenceScore',
    'emotionalTrends'
  ];

  const isValid = requiredFields.every(field => field in analysis) &&
    analysis.sentimentScore >= -1 && 
    analysis.sentimentScore <= 1 &&
    analysis.confidenceScore >= 0 && 
    analysis.confidenceScore <= 1;

  return isValid;
};

/**
 * Collects and formats training data for model improvement
 * @param {string} journalText - Original journal entry
 * @param {Object} analysis - Analysis results
 * @param {Object} humanValidation - Optional human validation data
 * @returns {Promise<Object>} Formatted training example
 */
const collectTrainingData = async (journalText, analysis, humanValidation = null) => {
  try {
    const trainingExample = {
      messages: [
        {
          role: "system",
          content: "You are an AI specialized in nuanced emotional analysis."
        },
        {
          role: "user",
          content: journalText
        },
        {
          role: "assistant",
          content: JSON.stringify(analysis)
        }
      ],
      metadata: {
        timestamp: new Date().toISOString(),
        validationScore: humanValidation?.score,
        validatorNotes: humanValidation?.notes,
        modelVersion: "gpt-4o",
        datasetVersion: "1.0"
      }
    };

    // Here you would save to your training data storage
    // await saveTrainingExample(trainingExample);
    return trainingExample;
  } catch (error) {
    console.error('Error collecting training data:', error);
    throw new Error('Failed to collect training data');
  }
};

/**
 * Enhanced version of analyzeSentiment that includes validation
 * and optional training data collection
 * @param {string} journalText - The journal entry to analyze
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Validated sentiment analysis
 */
const analyzeSentimentWithValidation = async (journalText, options = {}) => {
  const analysis = await analyzeSentiment(journalText);
  
  if (!validateAnalysis(analysis)) {
    console.warn('Invalid analysis result detected');
    // You might want to retry or handle invalid results
  }

  if (options.collectTraining) {
    await collectTrainingData(journalText, analysis, options.humanValidation);
  }

  return analysis;
};

/**
 * Test function to verify both analysis functions
 * Uses a sample journal entry to test:
 * 1. Journal analysis for insights
 * 2. Sentiment analysis
 */
const testAnalysis = async () => {
  try {
    const testEntry = "Today was challenging. I had a big presentation at work and felt nervous, but I managed to get through it. My colleagues gave positive feedback, which made me feel proud, though I'm still processing the stress.";
    
    console.log("\n1. Testing Journal Analysis...");
    const analysis = await analyzeJournalEntry(testEntry);
    console.log("Input:", testEntry);
    console.log("\nAnalysis:", analysis);

    console.log("\n2. Testing Sentiment Analysis...");
    const sentiment = await analyzeSentiment(testEntry);
    console.log("\nSentiment Results:", JSON.stringify(sentiment, null, 2));

  } catch (error) {
    console.error("Test Error:", error);
  }
};

// Run the test
testAnalysis();

// Export the main functions for use in other modules
export {
  analyzeJournalEntry,
  analyzeSentiment,
  analyzeSentimentWithValidation
};