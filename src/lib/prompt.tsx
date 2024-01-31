export function Prompt(question: string, contents: string): string {
    const prompt = `
        您的任务是从我提供的多个URL及其对应的内容描述中筛选出我可能感兴趣的URL。您需要基于我在对话中提到的兴趣点和偏好来进行选择。
        我提供的数据是一个数组，pageContent对应网页内容，metadata中url是网页链接。
        输出示例
        (website name)[url] - 此链接的内容与您之前提到的A主题高度相关，且包含最新的研究成果。
        (website name)[url] - 考虑到您对B领域的兴趣，这个资源提供了深入的分析和独特的视角。
        
        用户对话：
        ${question}

        URL和内容描述：
        ${contents}
        `
    return prompt
}