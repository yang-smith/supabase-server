import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { createClient } from '@supabase/supabase-js'
import fs from 'fs';
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
    // Handle preflight requests for CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method === 'POST') {
        try {

            const bookmarks = req.body.bookmarks;
            if (!bookmarks || bookmarks.length === 0) {
                throw new Error('No bookmarks provided');
            }
            const privateKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            if (!privateKey) throw new Error(`Expected env var SUPABASE_SERVICE_ROLE_KEY`)
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL
            if (!url) throw new Error(`Expected env var SUPABASE_URL`)
            const client = createClient(url, privateKey);
            const embeddings = new OpenAIEmbeddings();
            const texts = bookmarks.map(bookmark => `${bookmark.title}`+`\n${bookmark.description}`);
            // const texts = bookmarks.map(bookmark => `${bookmark.title}`);
            const metadata = bookmarks.map(bookmark => ({ url: bookmark.url, user_id: bookmark.user_id}));
            const vectorStore = await SupabaseVectorStore.fromTexts(
                texts,
                metadata,
                embeddings,
                {
                    client,
                    tableName: 'bookmarks',
                    queryName: 'match_bookmarks',
                }
            );
            res.status(200).json({ message: 'Bookmarks added successfully', vectorStore });
        } catch (error) {
            res.status(500).json({ error });
        }
    } else {
        // 处理非POST请求
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
