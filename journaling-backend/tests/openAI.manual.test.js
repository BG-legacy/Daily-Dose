const OpenAIService = require('../src/utils/openAI');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the correct path
const envPath = path.resolve(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);
}

async function manualTest() {
    try {
        // Verify API key is loaded
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not set in environment variables');
        }

        const openAIService = new OpenAIService();
        
        // Test cases with different emotional tones
        const testCases = [
            {
                description: "Positive Journal Entry",
                content: "Today was an amazing day! I completed all my tasks ahead of schedule and received praise from my manager."
            },
            {
                description: "Challenging Journal Entry",
                content: "I'm feeling overwhelmed with work and struggling to maintain focus. There's so much to do and so little time."
            }
        ];

        for (const testCase of testCases) {
            console.log('\n📝 Testing:', testCase.description);
            console.log('--------------------------------');
            console.log('Journal Content:', testCase.content);
            console.log('\n⏳ Generating insights...');

            const insights = await openAIService.generateInsights(testCase.content);
            
            console.log('\n✨ Generated Insights:');
            console.log('--------------------------------');
            console.log('🗣️  Quote:', insights.quote);
            console.log('💭 Mental Health Tip:', insights.mentalHealthTip);
            console.log('⚡ Productivity Hack:', insights.productivityHack);
            console.log('--------------------------------\n');
        }

        console.log('✅ All manual tests completed successfully!');

    } catch (error) {
        console.error('❌ Manual Test Failed:', error.message);
        process.exit(1);
    }
}

// Run the manual test
manualTest(); 