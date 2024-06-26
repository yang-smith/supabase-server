import { Prompt } from "@/lib/prompt";
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
    const { model, messages, temperature, bookmark } = req.body;
    // const query = messages[1].content;
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
        model: model,
        messages: messages,
        max_tokens: 1000,
        temperature: temperature ? temperature : 0.1,
      }),
    });
    if (result.ok) {
      const data = await result.json();
      const content = data.choices[0].message.content;
      // console.log(content);
      bookmark.description = content.replace(/^Summary: /, '');
      console.log(bookmark.description);
      try {
        const response = await fetch('https://api.bookmarkbot.fun/api/addBookmarksTest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ bookmarks: [bookmark] })
        });
        const data = await response.json();
        console.log('successfully addbookmarks api:', data);
      } catch (error) {
        console.error('Error sending bookmarks to addbookmarks api:', error);
      }

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