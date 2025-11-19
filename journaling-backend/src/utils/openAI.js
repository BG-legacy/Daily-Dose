const OpenAI = require('openai');
const path = require('path');
const dotenv = require('dotenv');
const { trackAIOperation } = require('./performance');

// Load environment variables if not already loaded
if (!process.env.OPENAI_API_KEY) {
    const envPath = path.resolve(__dirname, '../../../../.env');
    dotenv.config({ path: envPath });
}

class OpenAIService {
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }

        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async generateInsights(journalContent) {
        const prompt = `
        Analyze this journal entry and provide insights. 
        Your response must be a valid JSON object with exactly these fields: quote, mentalHealthTip, and productivityHack.
        
        Journal Entry: "${journalContent}"

        Remember:
        1. Response must be valid JSON
        2. Must include exactly these fields: quote, mentalHealthTip, productivityHack
        3. No additional commentary or text outside the JSON object
        
        Example format:
        {
            "quote": "Relevant quote about the situation",
            "mentalHealthTip": "A helpful mental health suggestion",
            "productivityHack": "A practical productivity tip"
        }`;

        const startTime = Date.now();
        let success = false;

        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that provides insights in valid JSON format. You must respond with properly formatted JSON containing exactly these fields: quote, mentalHealthTip, and productivityHack. No other text or commentary allowed."
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            const duration = Date.now() - startTime;

            try {
                const content = response.choices[0].message.content.trim();
                const insights = JSON.parse(content);
                
                // Validate the response has all required fields
                const requiredFields = ['quote', 'mentalHealthTip', 'productivityHack'];
                const missingFields = requiredFields.filter(field => !insights[field]);
                
                if (missingFields.length > 0) {
                    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                }
                
                success = true;
                trackAIOperation('generateInsights', duration, true);
                return insights;
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Raw Response:', response.choices[0].message.content);
                trackAIOperation('generateInsights', duration, false);
                throw new Error('Failed to parse AI insights');
            }
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error('OpenAI API Error:', error);
            trackAIOperation('generateInsights', duration, false);
            throw new Error('Failed to generate AI insights');
        }
    }
}

module.exports = OpenAIService;