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
            Provide concise, practical insights that are directly related to the journal entry.
            Format your response in three clear sections:
            
            QUOTE: A short, relevant quote that speaks to the specific situation
            WELLNESS TIP: A concrete, actionable mental health suggestion
            ACTION STEP: One specific, doable task for today
            
            Keep each section to 1-2 sentences maximum. Be specific, not generic.`
        },
        {
          role: "user",
          content: `Based on this journal entry, provide personalized insights:
            
            ${journalText}`
        }
      ],
      temperature: 0.5,
      max_tokens: 300
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
          content: `You are an AI specialized in precise emotional analysis.
            Focus on identifying:
            1. The dominant emotion and its direct cause
            2. Maximum of two secondary emotions
            3. Clear behavioral patterns or triggers
            4. One specific suggestion for emotional regulation
            
            Be concise and specific. Avoid generalities.
            Base all analysis strictly on the provided text.`
        },
        {
          role: "user",
          content: `Analyze this journal entry and return a JSON object:
            {
              "mainEmotion": {
                "name": "emotion",
                "intensity": 1-10,
                "trigger": "specific event or thought that caused this emotion"
              },
              "secondaryEmotions": [
                {
                  "name": "emotion",
                  "intensity": 1-10,
                  "context": "brief explanation"
                }
              ],
              "sentimentScore": -1 to 1,
              "actionableTakeaway": "one specific suggestion based on the emotional state"
            }
            
            Journal entry: "${journalText}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 350,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
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

/**
 * Generates personalized journaling prompts based on mood and context
 * @param {Object} sentiment - The sentiment analysis results
 * @returns {Promise<Object>} Journaling recommendations
 */
const generateJournalingPrompts = async (sentiment) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a journaling expert who provides personalized prompts.
            Based on the user's emotional state, create a JSON response with:
            1. Three reflection prompts
            2. One gratitude prompt
            3. One growth-oriented prompt
            
            Make prompts specific to their current situation and emotional state.
            Each prompt should be 1-2 sentences maximum.`
        },
        {
          role: "user",
          content: `Generate JSON formatted journaling prompts based on this emotional state:
            ${JSON.stringify(sentiment)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating prompts:', error);
    throw new Error('Failed to generate journaling prompts');
  }
};

/**
 * Provides mood-based personalized content recommendations
 * @param {Object} sentiment - The sentiment analysis results
 * @returns {Promise<Object>} Personalized content suggestions
 */
const getMoodBasedContent = async (sentiment) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a wellness content curator. Create a JSON response with these exact fields:
            {
              "mindfulnessExercise": {
                "title": "string",
                "description": "string"
              },
              "moodLiftingActivity": {
                "title": "string",
                "description": "string"
              },
              "relevantArticle": {
                "title": "string",
                "url": "string",
                "description": "string"
              },
              "selfCareSuggestion": {
                "title": "string",
                "description": "string"
              }
            }`
        },
        {
          role: "user",
          content: `Generate JSON formatted content recommendations for this emotional state:
            ${JSON.stringify(sentiment)}`
        }
      ],
      temperature: 0.6,
      max_tokens: 500, // Increased to ensure complete response
      response_format: { type: "json_object" }
    });

    const content = JSON.parse(response.choices[0].message.content);
    
    // Validate the response structure
    if (!content.mindfulnessExercise || !content.moodLiftingActivity || 
        !content.relevantArticle || !content.selfCareSuggestion) {
      throw new Error('Invalid response structure');
    }

    return content;
  } catch (error) {
    console.error('Error generating content recommendations:', error);
    // Return a default response instead of throwing
    return {
      mindfulnessExercise: {
        title: "Basic Breathing Exercise",
        description: "Take 5 deep breaths, counting to 4 on the inhale and 4 on the exhale."
      },
      moodLiftingActivity: {
        title: "Quick Walk",
        description: "Take a 10-minute walk outside to clear your mind."
      },
      relevantArticle: {
        title: "Managing Daily Stress",
        url: "https://www.mindful.org/how-to-manage-stress-with-mindfulness-and-meditation/",
        description: "Learn basic techniques for managing stress and anxiety."
      },
      selfCareSuggestion: {
        title: "Self-Care Break",
        description: "Take a 15-minute break to do something you enjoy."
      }
    };
  }
};

const formatLongString = (str) => {
  // Increase max length and handle word wrapping better
  const maxLength = Math.min(process.stdout.columns || 100, 100);
  const words = str.split(' ');
  let lines = [];
  let currentLine = '';

  words.forEach(word => {
    // Check if adding the word would exceed maxLength
    if (currentLine.length + word.length + 1 > maxLength) {
      // Push current line and start new one
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      // Add word to current line
      currentLine += (currentLine.length ? ' ' : '') + word;
    }
  });
  
  // Add the last line if it exists
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines.join('\n');
};

const testMultipleScenarios = async () => {
  const testEntries = [
    {
      scenario: "Achievement/Pride",
      entry: "Today was incredible! I finally completed my coding project that I've been working on for months. The client loved it and even offered me another contract. I feel on top of the world, though a bit exhausted."
    },
    {
      scenario: "Anxiety/Stress",
      entry: "I've been overthinking about tomorrow's presentation. Can't seem to focus on anything else. My heart's racing every time I think about it, and I keep second-guessing my preparation."
    },
    {
      scenario: "Mixed Emotions",
      entry: "Had lunch with my ex today. It was surprisingly pleasant, but also brought up some complicated feelings. Part of me misses our friendship, but I know maintaining distance is healthier right now."
    },
    {
      scenario: "Growth/Learning",
      entry: "Made a big mistake at work today. Initially felt terrible, but my manager's response was surprisingly constructive. We turned it into a learning opportunity and created new protocols to prevent similar issues."
    }
  ];

  console.log("\n=== Testing Multiple Journal Scenarios ===\n");

  for (const test of testEntries) {
    try {
      console.log(`\n=== ${test.scenario} ===\n`);
      console.log("Input:", formatLongString(test.entry), "\n");

      // 1. Journal Analysis
      console.log("1. Journal Analysis:");
      const analysis = await analyzeJournalEntry(test.entry);
      const sections = analysis.split('\n\n');
      sections.forEach(section => {
        const formattedSection = formatLongString(section);
        console.log(formattedSection);
        console.log(); // Add blank line between sections
      });

      // 2. Sentiment Analysis
      console.log("2. Sentiment Analysis:");
      const sentiment = await analyzeSentiment(test.entry);
      // Format JSON output without wrapping
      console.log(JSON.stringify(sentiment, null, 2));
      console.log();

      // 3. Journaling Prompts
      console.log("3. Journaling Prompts:");
      const prompts = await generateJournalingPrompts(sentiment);
      Object.entries(prompts).forEach(([key, value]) => {
        console.log(`\n${key}:`);
        if (Array.isArray(value)) {
          value.forEach(prompt => {
            const formattedPrompt = formatLongString(`- ${prompt}`);
            console.log(formattedPrompt);
          });
        } else {
          const formattedValue = formatLongString(`- ${value}`);
          console.log(formattedValue);
        }
      });
      console.log();

      // 4. Mood-Based Content
      console.log("4. Mood-Based Content:");
      const content = await getMoodBasedContent(sentiment);
      Object.entries(content).forEach(([key, value]) => {
        console.log(`\n${key}:`);
        console.log(`Title: ${value.title}`);
        const formattedDesc = formatLongString(value.description);
        console.log(`Description: ${formattedDesc}`);
        if (value.url) console.log(`URL: ${value.url}`);
      });

      console.log("\n" + "=".repeat(50) + "\n");
    } catch (error) {
      console.error(`Error in scenario "${test.scenario}":`, error);
    }
  }
};

// Comment out the old test
// testAnalysis();

// Run the new comprehensive tests
testMultipleScenarios();

// Export the main functions for use in other modules
export {
  analyzeJournalEntry,
  analyzeSentiment,
  analyzeSentimentWithValidation,
  generateJournalingPrompts,
  getMoodBasedContent
};