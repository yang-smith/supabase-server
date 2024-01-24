import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { createClient } from '@supabase/supabase-js'
import fs from 'fs';

type CommonError = {
    message: string;
    code: string;
};

async function fetchDescription(url, errors) {
    // GitHub URL
    if (url.includes('github.com') ) {
        const response = await fetch(url);
        const html = await response.text();
        const match = html.match(/<meta name="twitter:description" content="([^"]+)"/i);
        if(match){
            if(match[1].includes('Contribute to')){
                return null;
            }
            return match[1];
        }
        return null;
    }
    // Youtube
    if (url.includes('youtube') ) {
        console.log(`Youtube: ${url}`);
        return null;
    }
    // 扩展程序URL
    if (url.startsWith('chrome-extension://') || url.startsWith('moz-extension://')) {
        console.log(`Processing extension URL: ${url}`);
        return 'extension'; 
    }

    try {
        const response = await fetch(url);
        const html = await response.text();
        const match = html.match(/<meta name="description" content="([^"]+)"/i);
        return match ? match[1] : null;
    } catch (error: any) {
        console.error(`Error fetching description for ${url}:`, error);
        if(error){
            if (error.code === 'ECONNRESET' || error.code === 'UND_ERR_CONNECT_TIMEOUT') {
                errors.push({ url, error: 'Timeout error', errorCode: error.code });
            } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                errors.push({ url, error: 'Server not found or connection refused', errorCode: error.code });
            } else {
                errors.push({ url, error: 'Unknown error', errorCode: error.code });
            }
        }
        return null;
    }
}
async function fetchDescriptions(bookmarks, batchSize = 10) {
    let processed = 0;
    const errors = [];
    const processBatch = async (batch) => {
        const fetchPromises = batch.map(bookmark =>
            fetchDescription(bookmark.url, errors).then(description => {
                bookmark.description = description;
            })
        );
        await Promise.allSettled(fetchPromises);
        processed += batch.length;
        console.log(`Processed ${processed}/${bookmarks.length} bookmarks`);
    };

    while (processed < bookmarks.length) {
        const batch = bookmarks.slice(processed, processed + batchSize);
        await processBatch(batch);
        return errors;
    }

    return errors;
}

export default async function handler(
    req,
    res
) {
    res.setHeader('Access-Control-Allow-Origin', 'chrome-extension://mkfmekmffkdlbghfjhojpcdpccfneahc');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
            // 提取书签文本并创建ID数组
            const errors = await fetchDescriptions(bookmarks);
            
            const outputData = {
                bookmarks: bookmarks,
                errors: errors
            };
            fs.writeFileSync('output.txt', JSON.stringify(outputData, null, 2));
            // console.log(bookmarks);
            // 使用vectorStore将书签添加到documents
            const texts = bookmarks.map(bookmark => `${bookmark.title}`+`  ${bookmark.description}`);
            const urls = bookmarks.map(bookmark => ({ url: bookmark.url }));
            console.log(texts);
            const vectorStore = await SupabaseVectorStore.fromTexts(
                texts,
                urls,
                embeddings,
                {
                    client,
                    tableName: 'documents',
                    queryName: 'match_documents',
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
