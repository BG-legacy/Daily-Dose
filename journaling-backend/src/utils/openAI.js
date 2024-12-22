const OpenAI = require("openai")
require("dotenv").config({ path: '../../../.env'}); // load environment variables


const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY,
});

// this works but we need credits
async function testOpenAI() {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // You can use other models here if needed
            messages: [
                { "role": "user", "content": "Hello, OpenAI!" }
            ],
        });

        console.log("API Response:", completion.choices[0].message.content); // Log the response
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
    }
}

testOpenAI();