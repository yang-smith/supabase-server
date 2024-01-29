const OPENAI_API_TYPE = 'openai';
const DEFAULT_TEMPERATURE = 0.5;
const DEFAULT_URL = process.env.OPENAI_API_BASE ? process.env.OPENAI_API_BASE : 'https://api.openai.com/v1/completions';
const KEY = process.env.OPENAI_API_KEY;
const DEFAULT_SYSTEM_PROMPT = 'you are a helpful assistant';

export default async function chat(model, messages, temperature) {
    try {
        const key = "sk-j8ZTOOaaWOXDrkWm1cEf044fD2Da461cB57fB04aBdA5Bb9c";
        const url = "https://ai-yyds.com/v1/chat/completions"
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
            },
            method: 'POST',
            body: JSON.stringify({
                model: model ? model : 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: DEFAULT_SYSTEM_PROMPT,
                    },
                     ...messages,
                ],
                max_tokens: 1000,
                temperature: temperature ? temperature : DEFAULT_TEMPERATURE,
                // stream: true,
            }),
        });
        return res;
    } catch (error) {
        console.error('Error in chat function:', error);
        throw error;
    }
}
