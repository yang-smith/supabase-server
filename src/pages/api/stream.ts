import {
    ParsedEvent,
    ReconnectInterval,
    createParser,
} from 'eventsource-parser';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { createClient } from '@supabase/supabase-js'
// import { OpenAIStream, StreamingTextResponse } from 'ai';
export const config = {
    runtime: 'edge',
};

export default async function handler(
    req: Request,
    res
) {
    if (req.method === 'POST') {
        try {
            let body = await req.json();
            const { model, messages, temperature, userId } = body;
            const query = messages[1].content;
            // console.log(query);
            
            let url = `${process.env.OPENAI_BASE_URL}chat/completions`;
            // let url = `https://ai-yyds.com/v1/chat/completions`;
            const key = process.env.OPENAI_API_KEY
            // const key = 'sk-JGZVAOI7Z4bt5zo8Ff23F09405Cd4b2386B177A42fB48a21'
            if (url == null || key == null) {
                console.log(`NO OPENAI_BASE_URL or OPENAI_API_KEY`);
            }
            const res = await fetch(url, {
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
                    stream: true,
                }),
            });

            // const stream = OpenAIStream(res);
            // return new StreamingTextResponse(stream);


            const encoder = new TextEncoder();
            const decoder = new TextDecoder();
            const stream = new ReadableStream({
                async start(controller) {
                    const onParse = (event: ParsedEvent | ReconnectInterval) => {
                        if (event.type === 'event') {
                            const data = event.data;
                            try {
                                const json = JSON.parse(data);
                                if (json.choices[0].finish_reason != null) {
                                    controller.close();
                                    return;
                                }
                                const text = json.choices[0].delta.content;
                                const queue = encoder.encode(text);
                                controller.enqueue(queue);
                            } catch (e) {
                                controller.error(e);
                            }
                        }
                    };

                    const parser = createParser(onParse);

                    for await (const chunk of res.body as any) {
                        parser.feed(decoder.decode(chunk));
                        // console.log(decoder.decode(chunk));
                    }
                },
            });

            return new Response(stream);
        } catch (error) {
            return new Response(JSON.stringify({ error: error }), { status: 500 })
        }
    } else {
        // 处理非POST请求
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}