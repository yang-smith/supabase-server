// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// import type { NextApiRequest, NextApiResponse } from 'next'

// type Data = {
//   pagecontent: string
// }

import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { createClient } from '@supabase/supabase-js'
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
    try {
      // 解析请求体中的参数
      const { query, topK, userId } = req.body;
      const privateKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!privateKey) throw new Error(`Expected env var SUPABASE_SERVICE_ROLE_KEY`)
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!url) throw new Error(`Expected env var SUPABASE_URL`)

      const client = createClient(url, privateKey)
      const embeddings = new OpenAIEmbeddings();
      const vectorStore = new SupabaseVectorStore(embeddings, {
        client,
        tableName: 'documents',
      });

      const result = await vectorStore.similaritySearch(query, topK, { user_id: userId });
      console.log(result);

    //   const response = await fetch('http://localhost:3000/api/ai', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ query, result })
    // });
    // const data = await response.json();
    // console.log('ai result', data);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error});
    }
  } else {
    // 处理非POST请求
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
