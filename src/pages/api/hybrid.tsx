// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// import type { NextApiRequest, NextApiResponse } from 'next'

// type Data = {
//   pagecontent: string
// }

import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { createClient } from '@supabase/supabase-js'
import Cors from 'nextjs-cors';
import { SupabaseHybridSearch } from "@langchain/community/retrievers/supabase";

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


      const retriever = new SupabaseHybridSearch(embeddings, {
        client,
        //  Below are the defaults, expecting that you set up your supabase table and functions according to the guide above. Please change if necessary.
        similarityK: 10,
        keywordK: 10,
        tableName: "bookmarks",
        similarityQueryName: "match_bookmarks",
        keywordQueryName: "kw_match_bookmarks",
      });


      const result = await retriever.getRelevantDocuments(query);

      console.log(result);
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
