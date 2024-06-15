// pages/api/test.js
export default async (req, res) => {
    try {
      const response = await fetch('https://db.bookmarkbot.fun/');
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  