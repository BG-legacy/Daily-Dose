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

// Mock OpenAI responses
jest.mock('openai', () => {
    return class OpenAIMock {
        constructor() {
            this.chat = {
                completions: {
                    create: jest.fn()
                }
            };
        }
    };
});

describe('OpenAI Service Tests', () => {
    let openAIService;
    
    beforeEach(() => {
        // Ensure OPENAI_API_KEY is set for each test
        process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'mock-api-key';
        openAIService = new OpenAIService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('generateInsights returns properly formatted insights', async () => {
        // Mock successful API response
        const mockResponse = {
            choices: [{
                message: {
                    content: JSON.stringify({
                        quote: "Test quote",
                        mentalHealthTip: "Test mental health tip",
                        productivityHack: "Test productivity hack"
                    })
                }
            }]
        };

        openAIService.openai.chat.completions.create.mockResolvedValue(mockResponse);

        const testJournal = "Today was a challenging day at work.";
        const insights = await openAIService.generateInsights(testJournal);

        expect(insights).toHaveProperty('quote');
        expect(insights).toHaveProperty('mentalHealthTip');
        expect(insights).toHaveProperty('productivityHack');
    });

    test('handles API errors gracefully', async () => {
        openAIService.openai.chat.completions.create.mockRejectedValue(
            new Error('API Error')
        );

        const testJournal = "Today was a challenging day.";
        
        await expect(openAIService.generateInsights(testJournal))
            .rejects
            .toThrow('Failed to generate AI insights');
    });

    test('generates relevant insights based on content', async () => {
        const mockResponses = {
            positive: {
                choices: [{
                    message: {
                        content: JSON.stringify({
                            quote: "Success is not final, failure is not fatal",
                            mentalHealthTip: "Celebrate small wins",
                            productivityHack: "Break tasks into smaller chunks"
                        })
                    }
                }]
            },
            negative: {
                choices: [{
                    message: {
                        content: JSON.stringify({
                            quote: "Every storm runs out of rain",
                            mentalHealthTip: "Practice self-compassion",
                            productivityHack: "Take regular breaks"
                        })
                    }
                }]
            }
        };

        // Test with positive content
        openAIService.openai.chat.completions.create.mockResolvedValueOnce(mockResponses.positive);
        const positiveJournal = "I accomplished all my goals today!";
        const positiveInsights = await openAIService.generateInsights(positiveJournal);

        expect(positiveInsights.quote).toBeTruthy();
        expect(positiveInsights.mentalHealthTip).toBeTruthy();
        expect(positiveInsights.productivityHack).toBeTruthy();

        // Test with negative content
        openAIService.openai.chat.completions.create.mockResolvedValueOnce(mockResponses.negative);
        const negativeJournal = "I'm feeling overwhelmed and stressed.";
        const negativeInsights = await openAIService.generateInsights(negativeJournal);

        expect(negativeInsights.quote).toBeTruthy();
        expect(negativeInsights.mentalHealthTip).toBeTruthy();
        expect(negativeInsights.productivityHack).toBeTruthy();
    });
});

// Updated manual test function
async function manualTest() {
    try {
        // Verify API key is loaded
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not set in environment variables');
        }

        const openAIService = new OpenAIService();
        const testJournal = `Today was a challenging day at work. 
            I had trouble focusing on my tasks and felt overwhelmed 
            with the number of meetings. However, I managed to complete 
            my main project deliverable, which made me feel accomplished.`;

        console.log('\nTesting OpenAI Service with sample journal entry...');
        console.log('Journal Content:', testJournal);
        console.log('\nGenerating insights...');

        const insights = await openAIService.generateInsights(testJournal);
        
        console.log('\nGenerated Insights:');
        console.log('Quote:', insights.quote);
        console.log('Mental Health Tip:', insights.mentalHealthTip);
        console.log('Productivity Hack:', insights.productivityHack);

    } catch (error) {
        console.error('Manual Test Failed:', error.message);
        process.exit(1);
    }
}

// Run manual test if executed directly (not through Jest)
if (require.main === module) {
    manualTest();
} 