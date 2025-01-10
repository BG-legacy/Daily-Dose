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
        Analyze this journal entry's emotional tone and provide highly personalized insights.
        Your response must be a valid JSON object with these fields, strictly adhering to these character limits:
        - mood: The primary emotional state detected (e.g., "happy", "sad", "stressed")
        - intensity: Emotional intensity rating (1-10)
        - quote: A VERY SHORT relevant quote (max 150 chars INCLUDING author attribution)
        - mentalHealthTip: A mood-specific, actionable suggestion (max 200 chars)
        - productivityHack: A situation-specific productivity tip (max 200 chars)
        
        Journal Entry: "${journalContent}"

        IMPORTANT: Quotes MUST be under 150 characters total, including the author attribution.
        If needed, truncate the quote or choose a shorter one to stay within limits.`;

        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert wellness coach who NEVER gives generic advice. Your responses must:
                        1. Be unique and specific to each situation
                        2. Reference details from the journal entry
                        3. Avoid common productivity clichés
                        4. Include concrete numbers and timeframes
                        5. Match the writer's emotional state exactly
                        6. Stay within character limits while being detailed`
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.8,
                max_tokens: 500
            });

            try {
                let content = response.choices[0].message.content.trim();
                
                // Remove any duplicate JSON keys by keeping only the last occurrence
                const jsonObject = {};
                const keyValuePairs = content.match(/"([^"]+)"\s*:\s*"([^"]+)"|"([^"]+)"\s*:\s*(\d+)/g);
                
                if (keyValuePairs) {
                    keyValuePairs.forEach(pair => {
                        const [key, value] = pair.split(':').map(s => s.trim());
                        const cleanKey = key.replace(/"/g, '');
                        const cleanValue = value.replace(/^"/, '').replace(/"$/, '');
                        jsonObject[cleanKey] = cleanValue;
                    });
                    
                    content = JSON.stringify(jsonObject);
                }

                const insights = JSON.parse(content);
                
                // Validate the response has all required fields
                const requiredFields = ['mood', 'intensity', 'quote', 'mentalHealthTip', 'productivityHack'];
                const missingFields = requiredFields.filter(field => !insights[field]);
                
                if (missingFields.length > 0) {
                    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                }

                // Validate character limits
                if (insights.quote.length > 150) {
                    throw new Error('Quote exceeds 150 character limit');
                }
                if (insights.mentalHealthTip.length > 200) {
                    throw new Error('Mental health tip exceeds 200 character limit');
                }
                if (insights.productivityHack.length > 200) {
                    throw new Error('Productivity hack exceeds 200 character limit');
                }

                // Add mood validation
                if (!insights.mood || !insights.intensity) {
                    throw new Error('Missing mood analysis fields');
                }
                
                if (insights.intensity < 1 || insights.intensity > 10) {
                    throw new Error('Emotional intensity must be between 1 and 10');
                }

                return insights;
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Raw Response:', response.choices[0].message.content);
                
                // Improved recovery attempt with regex-based parsing
                try {
                    const rawContent = response.choices[0].message.content;
                    const jsonObject = {};
                    
                    // Extract key-value pairs using regex
                    const moodMatch = rawContent.match(/"mood":\s*"([^"]+)"/);
                    const intensityMatch = rawContent.match(/"intensity":\s*(\d+)/);
                    const quoteMatch = rawContent.match(/"quote":\s*"([^"]+)"/);
                    const tipMatch = rawContent.match(/"mentalHealthTip":\s*"([^"]+)"/);
                    const hackMatch = rawContent.match(/"productivityHack":\s*"([^"]+)"/);
                    
                    if (moodMatch) jsonObject.mood = moodMatch[1];
                    if (intensityMatch) jsonObject.intensity = parseInt(intensityMatch[1]);
                    if (quoteMatch) jsonObject.quote = quoteMatch[1];
                    if (tipMatch) jsonObject.mentalHealthTip = tipMatch[1];
                    if (hackMatch) jsonObject.productivityHack = hackMatch[1];
                    
                    return jsonObject;
                } catch (recoveryError) {
                    console.error('Recovery attempt failed:', recoveryError);
                    throw new Error('Failed to parse AI insights');
                }
            }
        } catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error('Failed to generate AI insights');
        }
    }
}

module.exports = OpenAIService;