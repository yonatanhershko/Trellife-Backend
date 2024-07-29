import express from 'express'
import http from 'http'
// import { createServer } from 'node:http'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import compression from 'compression';
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'

import { OpenAI } from "openai";
import bodyParser from 'body-parser'
import { log } from 'console'


const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import { logger } from './services/logger.service.js'
logger.info('server.js loaded...')

const app = express()
const server = http.createServer(app)

// Express App Config
app.use(cookieParser())

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json())
app.use(express.static('public'))
app.use(compression());


if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')))
} else {
    const corsOptions = {
        origin: [
            'http://127.0.0.1:5173',
            'http://localhost:5173',

            'http://127.0.0.1:3000',
            'http://localhost:3000',
        ],
        credentials: true
    }
    app.use(cors(corsOptions))
}

// Routes and Socket

import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { boardRoutes } from './api/board/board.routes.js'
import { setupSocketAPI } from './services/socket.service.js'

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 413) {
      console.error('Request entity too large:', err)
      return res.status(413).json({ error: 'Request entity too large' })
    }
    next(err)
  })

app.all('*', setupAsyncLocalStorage)



// routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/board', boardRoutes)




setupSocketAPI(server)


// Make every unmatched server-side-route fall back to index.html
// So when requesting http://localhost:3030/index.html/car/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue-router to take it from there

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3030

server.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})


const openai = new OpenAI({
    apiKey: process.env.API_KEY
    
});

app.use(bodyParser.json())

app.post('/chat', async (req, res) => {
    // const { prompt } = req.body
    // const completion = await openai.chat.completions.create({
    //     board: prompt,
    //     model: "gpt-4o-mini",
    //     max_tokens: 3000
    //   });
    const completion = await openai.chat.completions.create({
        messages: [{"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Who won the world series in 2020?"},
            {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
            {"role": "user", "content": "Where was it played?"}],
            model: "gpt-4o-mini",
        });
          res.send(completion.choices[0].text)
        // res.send(prompt)
})