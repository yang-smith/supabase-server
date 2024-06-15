// pages/test.tsx
import { useState, ChangeEvent, MouseEvent } from 'react';

const Test: React.FC = () => {
    const [url, setUrl] = useState<string>(''); // 明确url是字符串类型
    const [responseContent, setResponseContent] = useState<string>(''); // 明确responseContent是字符串类型

    const fetchContent = async () => {
        if (!url.trim()) {
            setResponseContent('Please enter a valid URL.');
            return;
        }
    
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            setResponseContent(text);
        } catch (error) {
            console.error('Fetching error:', error);
            setResponseContent(`Error fetching the URL: ${error}`);
        }
    };
    

    const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUrl(e.target.value);
    };

    const handleFetchClick = (e: MouseEvent<HTMLButtonElement>) => {
        fetchContent();
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>URL Fetch Test Page</h1>
            <input
                type="text"
                value={url}
                onChange={handleUrlChange}
                style={{ width: "300px", marginRight: "10px" }}
            />
            <button onClick={handleFetchClick}>Fetch Content</button>
            <div>
                <h2>Response:</h2>
                <textarea value={responseContent} readOnly style={{ width: "100%", height: "300px" }}></textarea>
            </div>
        </div>
    );
};

export default Test;
