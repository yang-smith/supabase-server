import { ChatOpenAI } from "@langchain/openai";
import {Prompt} from"@/lib/prompt";

export default async function handler(
    req,
    res
) {
    if (req.method === 'POST') {
        const { query, contents } = req.body;
        console.log(query);
        console.log(contents);
        const chatModel = new ChatOpenAI({});
        const prompt = Prompt(query, contents);
        const result = await chatModel.invoke(prompt);
        console.log(result);

        res.status(200).json(result);

    } else {
    // 处理非POST请求
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}