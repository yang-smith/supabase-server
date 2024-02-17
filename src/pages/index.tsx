import { useState } from 'react';
import OpenAI from "openai";
import { ChatOpenAI } from "@langchain/openai";
import chat from '@/lib/openai';
import { Prompt } from '@/lib/prompt';

// const openai = new OpenAI({
//     apiKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
// })

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponseText('');

    const model = 'gpt-3.5-turbo';
    const prompt = Prompt("我想看些有趣的视频", inputText);
    const messages = [{ role: 'user', content: prompt }];
    const temperature = 0.1;
    const res = await chat(model, messages, temperature);
    if (res.ok) {
      const data = await res.json();
      setResponseText(data.choices[0].message.content);
    } else {
      console.log(res.status);
      setResponseText('something error');
      throw new Error(`Error: ${res.status}`);
    }
    setIsLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold">OpenAI API Test</h1>
      <form onSubmit={handleSubmit} className="mt-4 w-full max-w-md">
        <div className="mb-2">
          <label htmlFor="inputText" className="block mb-2 text-sm font-medium">Your Input:</label>
          <textarea
            id="inputText"
            rows={4}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Type something..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          ></textarea>
        </div>
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Submit'}
        </button>
      </form>
      {responseText && (
        <div className="mt-4 p-4 w-full max-w-md bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-medium">API Response:</h2>
          <p className="mt-2">{responseText}</p>
        </div>
      )}
    </main>
  );
}
