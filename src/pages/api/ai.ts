import {Prompt} from"@/lib/prompt";
import chat from '@/lib/openai';
import Cors from 'nextjs-cors';

export default async function handler(
    req,
    res
) {
  await Cors(req, res, {
    methods: ['GET', 'POST', 'HEAD', 'OPTIONS'], 
    origin: '*', 
    optionsSuccessStatus: 200, 
  });
    if (req.method === 'POST') {
      let body = await req.json();
      const { model, messages, temperature } = body;
      const query = messages[1].content;
      // console.log(query);
      
      let url = `${process.env.OPENAI_BASE_URL}chat/completions`;
      const key = process.env.OPENAI_API_KEY
      if (url == null || key == null) {
          console.log(`NO OPENAI_BASE_URL or OPENAI_API_KEY`);
      }
      const result = await fetch(url, {
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`,
          },
          method: 'POST',
          body: JSON.stringify({
              model: model ? model : 'gpt-3.5-turbo',
              messages: messages,
              max_tokens: 1000,
              temperature: temperature ? temperature : 0.1,
              stream: false,
          }),
      });
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