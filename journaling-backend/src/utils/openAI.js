const OpenAI = require('openai');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables if not already loaded
if (!process.env.OPENAI_API_KEY) {
    const envPath = path.resolve(__dirname, '../../../.env');
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
        Analyze this journal entry and provide three distinct insights:
        "${journalContent}"

        Please provide your response in the following JSON format:
        {
            "quote": "An inspirational quote that resonates with the journal's theme",
            "mentalHealthTip": "A practical mental health tip based on the content",
            "productivityHack": "A relevant productivity suggestion based on the context"
        }
        
        Ensure the response is empathetic, constructive, and directly relevant to the journal content.`;

        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a compassionate mental health and productivity advisor." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            const insights = JSON.parse(response.choices[0].message.content);
            return insights;
        } catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error('Failed to generate AI insights');
        }
    }
}

// Export the class instead of an instance
module.exports = OpenAIService;