import {
    ParsedEvent,
    ReconnectInterval,
    createParser,
  } from 'eventsource-parser';

export default async function handler(
    req,
    res
) {
    if (req.method === 'POST') {
        try{
            const { model, messages, temperature } = req.body;
            let url = `${process.env.OPENAI_BASE_URL}/chat/completions`;
            const key = process.env.OPENAI_API_KEY
            if(url==null || key == null){
                console.log(`NO OPENAI_BASE_URL or OPENAI_API_KEY`);
            }
            const res = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`,
                },
                method: 'POST',
                body: JSON.stringify({
                    model: model? model : 'gpt-3.5-turbo',
                    messages: messages,
                    max_tokens: 1000,
                    temperature: temperature? temperature : 0.1,
                    stream: true,
                }),
            });
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
                    }
                },
            });
    
            return new Response(stream);
        } catch(error){
            res.status(500).json({ error});
        }
    } else {
        // 处理非POST请求
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}