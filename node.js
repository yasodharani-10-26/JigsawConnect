const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// HackerRank Contest Leaderboard నుండి డేటా తెచ్చే API Endpoint
app.get('/api/get-scores/:contestSlug', async (req, res) => {
    const { contestSlug } = req.params;
    
    // HackerRank Internal Leaderboard URL
    const hackerRankUrl = `https://www.hackerrank.com/rest/contests/${contestSlug}/leaderboard?offset=0&limit=100`;

    try {
        const response = await axios.get(hackerRankUrl, {
            headers: {
                // HackerRank బ్రౌజర్ అభ్యర్థనలను బ్లాక్ చేయకుండా ఉండటానికి User-Agent అవసరం
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });

        // HackerRank లీడర్‌బోర్డ్ డేటా
        const leaderboard = response.data.models; 

        /* 
          leaderboard లో ఉండే డేటా Format:
          [
             { hacker: "student_username_1", score: 100, rank: 1 },
             { hacker: "student_username_2", score: 80, rank: 2 }
          ]
        */

        res.status(200).json({
            success: true,
            data: leaderboard
        });

    } catch (error) {
        console.error("Error fetching HackerRank leaderboard:", error.message);
        res.status(500).json({ success: false, message: "HackerRank నుంచి డేటా తీసుకోలేకపోయాం." });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
