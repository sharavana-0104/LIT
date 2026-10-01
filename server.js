const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.wasm': 'application/wasm',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json',
    '.ktx2': 'image/ktx2',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
    // Enable CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
    }

    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // API endpoint for Join Beta form submission
    if (pathname === '/api/join-beta' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body || '{}');
                console.log(`[${new Date().toISOString()}] Join Beta Submission:`, data);

                // 1. Save to local submissions file
                const submissionsFile = path.join(ROOT, 'submissions.json');
                let submissions = [];
                try {
                    if (fs.existsSync(submissionsFile)) {
                        submissions = JSON.parse(fs.readFileSync(submissionsFile, 'utf8') || '[]');
                    }
                } catch (e) {
                    submissions = [];
                }
                const entry = {
                    ...data,
                    targetEmail: 'sharavanacomputer2007@gmail.com',
                    receivedAt: new Date().toISOString()
                };
                submissions.push(entry);
                fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2), 'utf8');

                // Also append to a CSV for easy viewing in Excel
                const csvFile = path.join(ROOT, 'submissions.csv');
                const csvHeader = 'Timestamp,Email,Name,Age,City,Education,University,Notes\n';
                const csvRow = `"${entry.receivedAt}","${entry.email || ''}","${entry.name || ''}","${entry.age || ''}","${entry.city || ''}","${entry.education || ''}","${entry.university || ''}","${(entry.notes || '').replace(/"/g, '""')}"\n`;
                if (!fs.existsSync(csvFile)) {
                    fs.writeFileSync(csvFile, csvHeader + csvRow, 'utf8');
                } else {
                    fs.appendFileSync(csvFile, csvRow, 'utf8');
                }

                // 2. Forward to sharavanacomputer2007@gmail.com via FormSubmit
                try {
                    const fsRes = await fetch('https://formsubmit.co/ajax/sharavanacomputer2007@gmail.com', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Origin': 'http://localhost:8000',
                            'Referer': 'http://localhost:8000/',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        },
                        body: JSON.stringify({
                            _subject: `New Join Beta Application: ${entry.name || entry.email || 'Applicant'}`,
                            Name: entry.name || 'Not provided',
                            Email: entry.email || 'Not provided',
                            Age: entry.age || 'Not provided',
                            City: entry.city || 'Not provided',
                            Education: entry.education || 'Not provided',
                            University: entry.university || 'Not provided',
                            'About / Notes': entry.notes || entry.about || 'None',
                            'Submission Date': new Date().toLocaleString()
                        })
                    });
                    const fsText = await fsRes.text().catch(() => '');
                    console.log(`[FormSubmit] Status: ${fsRes.status}, Response:`, fsText);
                } catch (err) {
                    console.warn('FormSubmit dispatch error:', err.message);
                }

                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({
                    success: true,
                    ok: true,
                    message: 'Details sent to sharavanacomputer2007@gmail.com'
                }));
            } catch (err) {
                console.error('Error handling join-beta:', err);
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ success: false, ok: false, error: err.message }));
            }
        });
        return;
    }

    if (pathname === '/') pathname = '/index.html';
    console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);

    const filePath = path.join(ROOT, pathname);

    // Prevent directory traversal
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end(`404 Not Found: ${pathname}`);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const totalSize = stats.size;

        // Support HTTP Range requests for video/audio streaming
        const range = req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

            if (start >= totalSize || end >= totalSize) {
                res.writeHead(416, {
                    'Content-Range': `bytes */${totalSize}`,
                    'Access-Control-Allow-Origin': '*'
                });
                return res.end();
            }

            const chunksize = (end - start) + 1;
            const fileStream = fs.createReadStream(filePath, { start, end });

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${totalSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });

            fileStream.pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': totalSize,
                'Content-Type': contentType,
                'Accept-Ranges': 'bytes',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
            });

            fs.createReadStream(filePath).pipe(res);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (root: ${ROOT})`);
});
