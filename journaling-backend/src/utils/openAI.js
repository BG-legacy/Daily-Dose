require('dotenv').config(); // Load environment variables from a .env file

const OpenAI = require('openai'); // Import the OpenAI library

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to analyze a journal entry and provide insights
const analyzeJournalEntry = async (journalText) => {
  try {
    // Create a chat completion request to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Specify the model to use
      messages: [
        {
          role: "system",
          content: "You are a supportive AI assistant that analyzes journal entries and provides personalized insights."
        },
        {
          role: "user",
          content: `Analyze this journal entry and provide three elements:
            1. An inspirational quote relevant to the content and tone
            2. A mental health tip based on the sentiment
            3. A productivity hack that could help the situation
            
            Journal entry: "${journalText}"`
        }
      ],
      temperature: 0.7, // Set the randomness of the response
      max_tokens: 500 // Limit the response length
    });

    // Return the content of the first choice from the response
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing journal entry:', error); // Log any errors
    throw new Error('Failed to analyze journal entry'); // Throw an error if the analysis fails
  }
};

// Function to analyze the sentiment of a journal entry
const analyzeSentiment = async (journalText) => {
  try {
    // Create a chat completion request to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4", // Specify the model to use
      messages: [
        {
          role: "system",
          content: "You are an AI that analyzes the emotional tone and sentiment of text. Provide a brief analysis."
        },
        {
          role: "user",
          content: `Analyze the emotional tone and sentiment of this journal entry. Return a JSON object with 'mainEmotion' and 'sentimentScore' (-1 to 1).
          
          Journal entry: "${journalText}"`
        }
      ],
      temperature: 0.3, // Set the randomness of the response
      max_tokens: 150, // Limit the response length
      response_format: { type: "json_object" } // Specify the response format
    });

    // Parse and return the JSON content of the first choice from the response
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing sentiment:', error); // Log any errors
    throw new Error('Failed to analyze sentiment'); // Throw an error if the sentiment analysis fails
  }
};

// Export the functions for use in other modules
module.exports = {
  analyzeJournalEntry,
  analyzeSentiment
};

// Test the function with a sample journal entry
(async () => {
  try {
    const result = await analyzeJournalEntry("Today was a challenging day, but I learned a lot.");
    console.log("Journal Analysis Result:", result); // Log the result of the analysis
  } catch (error) {
    console.error("Test Error:", error); // Log any errors during the test
  }
})();