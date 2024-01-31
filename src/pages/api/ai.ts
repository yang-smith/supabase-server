import {Prompt} from"@/lib/prompt";
import chat from '@/lib/openai';

export default async function handler(
    req,
    res
) {
    if (req.method === 'POST') {
        const { query, contents } = req.body;
        const model = 'gpt-3.5-turbo';
        const prompt = Prompt(query, JSON.stringify(contents, null, 2));
        console.log([prompt])
        const messages = [{ role: 'user', content: prompt }];
        const temperature = 0.1;
        const result = await chat(model, messages, temperature);
        if (result.ok) {
          const data = await result.json();
          console.log(data.choices[0].message.content);
          res.status(200).json(data.choices[0].message.content);
        } else {
          console.log(result.status);
          res.status(404).json(result.status);
        }
    } else {
    // 处理非POST请求
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}