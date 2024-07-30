import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js';
import { logger } from './services/logger.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

logger.info('server.js loaded...');

const app = express();
const server = http.createServer(app);

// Express App Config
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));
app.use(compression());

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')));
} else {
    const corsOptions = {
        origin: [
            'http://127.0.0.1:5173',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://localhost:3000',
        ],
        credentials: true,
    };
    app.use(cors(corsOptions));
}

// Routes and Socket
import { authRoutes } from './api/auth/auth.routes.js';
import { userRoutes } from './api/user/user.routes.js';
import { boardRoutes } from './api/board/board.routes.js';
import { openAiRoutes } from './api/open-ai/open-ai.routes.js';
import { setupSocketAPI } from './services/socket.service.js';

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 413) {
        console.error('Request entity too large:', err);
        return res.status(413).json({ error: 'Request entity too large' });
    }
    next(err);
});

app.all('*', setupAsyncLocalStorage);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/open-ai', openAiRoutes);

setupSocketAPI(server);

// Make every unmatched server-side-route fall back to index.html
app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'));
});

const port = process.env.PORT || 3030;

server.listen(port, () => {
    logger.info('Server is running on port: ' + port);
});