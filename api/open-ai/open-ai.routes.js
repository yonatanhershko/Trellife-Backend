import express from 'express'

import bodyParser from 'body-parser';
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { openAiService } from './open-ai.service.js';
import { OpenAI } from 'openai';
import '../../config.js';

export const openAiRoutes = express.Router()

// middleware that is specific to this router
openAiRoutes.use(requireAuth)
openAiRoutes.use(bodyParser.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

openAiRoutes.post('/', log,async (req, res) => {
    try {
        const { title } = req.body;
        const prompt = openAiService.getPrompt(title)
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 3000,
        });

        const messageContent = completion.choices[0].message.content;

        // Validate if the response is a valid JSON
        try {
            const responseObject = JSON.parse(messageContent);
            res.send(responseObject);
        } catch (jsonError) {
            console.error('Invalid JSON:', messageContent);
            res.status(500).send('Invalid JSON response from OpenAI');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});