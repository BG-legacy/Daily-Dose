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

            try {
                const content = response.choices[0].message.content.trim();
                const insights = JSON.parse(content);
                
                // Validate the response has all required fields
                const requiredFields = ['quote', 'mentalHealthTip', 'productivityHack'];
                const missingFields = requiredFields.filter(field => !insights[field]);
                
                if (missingFields.length > 0) {
                    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                }
                
                return insights;
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Raw Response:', response.choices[0].message.content);
                throw new Error('Failed to parse AI insights');
            }
        } catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error('Failed to generate AI insights');
        }
    }


    async getDailyNotif() {
        // the ai should generate wholesome content that really cute 
        // - develop great prompt
        // - has to be 10/10 wholesome. personal for each person. maybe group people into different types based on the type of content they might wanna see
        // - encouraging, productive, general advice

        const prompt = `
            Your response should be at most three sentences.

            You should give wholesome,cute and encouraging quotes to brighten someone's morning

            Examples:
                - "Every day is a new beginning. Take a deep breath, smile, and start again"
                - "Wake up with determination, go to bed with satisfaction"
                - "One small positive thought in the morning can change your whole day"
        
        
        `;
        
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are that friend that always has something extremely encouraging and motivating to say. Your responses must not be more than 3 sentences.'
                    }, 
                    {
                       role: 'user',
                       content: prompt 
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            try {
                const insights = response.choices[0].message.content.trim();
                // const insights = JSON.parse(content); // this is failing tbh

                console.log(insights);
                return insights;
            }
            catch(parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Raw Response:', response.choices[0].message.content);
                throw new Error('Failed to parse AI insights');
            }

        } catch(error) {
            console.error('OpenAI API Error:', error);
            throw new Error('Failed to generate AI insights');
        }
    }
}

module.exports = OpenAIService;