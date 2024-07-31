import express from 'express';
import bodyParser from 'body-parser';
import { requireAuth } from '../../middlewares/requireAuth.middleware.js';
import { log } from '../../middlewares/logger.middleware.js';
import { openAiService } from './open-ai.service.js';
import { OpenAI } from 'openai';
import '../../config.js';

export const openAiRoutes = express.Router();

// Middleware specific to this router
openAiRoutes.use(requireAuth);
openAiRoutes.use(bodyParser.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

openAiRoutes.post('/', log, async (req, res) => {
    try {
        const { title } = req.body;
        const prompt = openAiService.getPrompt(title);
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
            const validJSON = fixInvalidJson(messageContent);
            const responseObject = JSON.parse(validJSON);
            if (!isValidResponse(responseObject)) {
                console.warn('Response does not meet minimum requirements');
            }
            res.json(responseObject);  // Use res.json to ensure the response is sent as a JSON object
        } catch (jsonError) {
            console.error('Invalid JSON:', messageContent);
            res.status(500).send('Invalid JSON response from OpenAI');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

function fixInvalidJson(jsonString) {
    try {
        // Remove comments and fix JSON issues
        jsonString = jsonString.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();
        jsonString = jsonString.replace(/([{,])(\s*)([A-Za-z0-9_]+)(\s*):/g, '$1"$3":');
        jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');
        return jsonString;
    } catch (e) {
        console.error("Error fixing JSON:", e);
        throw new Error("Unable to fix invalid JSON");
    }
}

function isValidResponse(response) {
    if (!response.groups || response.groups.length < 4) {
        return false;
    }
    for (const group of response.groups) {
        if (!group.tasks || group.tasks.length < 4) {
            return false;
        }
    }
    return true;
}