const express = require('express');
const { execFile } = require('child_process');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>URL Security Checker</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; background: #f4f4f9; color: #333; }
                .container { max-width: 600px; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin: auto; }
                h2 { color: #007BFF; margin-top: 0; }
                .input-group { display: flex; gap: 10px; margin-top: 20px; }
                input { flex: 1; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 16px; transition: border-color 0.3s; }
                input:focus { border-color: #007BFF; outline: none; }
                button { padding: 12px 24px; background: #007BFF; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold; }
                button:hover { background: #0056b3; }
                #result { margin-top: 25px; padding: 15px; border-radius: 6px; font-weight: bold; font-size: 1.1em; display: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>URL Security Checker</h2>
                <p>Analyze links against the Google Safe Browsing API database.</p>
                <div class="input-group">
                    <input type="text" id="url" placeholder="https://example.com">
                    <button onclick="checkUrl()">Analyze</button>
                </div>
                <div id="result"></div>
            </div>

            <script>
                async function checkUrl() {
                    const urlInput = document.getElementById('url').value.trim();
                    const resultDiv = document.getElementById('result');
                    
                    if (!urlInput) return;

                    resultDiv.style.display = "block";
                    resultDiv.innerText = "Analyzing URL...";
                    resultDiv.style.background = "#eee";
                    resultDiv.style.color = "#333";

                    try {
                        const res = await fetch('/check', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: urlInput })
                        });
                        const data = await res.json();
                        resultDiv.innerText = data.output;
                        
                        // Dynamic styling based on binary return keywords
                        if (data.output.includes("WARNUNG")) {
                            resultDiv.style.background = "#ffebee";
                            resultDiv.style.color = "#c62828";
                        } else if (data.output.includes("UNGÜLTIG")) {
                            resultDiv.style.background = "#fff3e0";
                            resultDiv.style.color = "#ef6c00";
                        } else {
                            resultDiv.style.background = "#e8f5e9";
                            resultDiv.style.color = "#2e7d32";
                        }
                    } catch (e) {
                        resultDiv.innerText = "Connection error.";
                        resultDiv.style.background = "#ffebee";
                        resultDiv.style.color = "#c62828";
                    }
                }
            </script>
        </body>
        </html>
    `);
});

app.post('/check', (req, res) => {
    const targetUrl = req.body.url;

    // Validate type structure of payload
    if (!targetUrl || typeof targetUrl !== 'string') {
        return res.status(400).json({ output: "[UNGÜLTIG] Invalid input data." });
    }

    // ExecFile prevents shell command injections by parsing arguments as a strict array
    execFile('./urlchecker', [targetUrl], (error, stdout, stderr) => {
        if (error && !stdout) {
            return res.status(500).json({ output: "Execution error." });
        }
        res.json({ output: stdout.trim() || stderr.trim() });
    });
});

// Production daemon management handled separately via PM2
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
