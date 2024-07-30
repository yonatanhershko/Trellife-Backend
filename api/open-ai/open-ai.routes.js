import express from 'express';
import bodyParser from 'body-parser';
import { requireAuth } from '../../middlewares/requireAuth.middleware.js';
import { log } from '../../middlewares/logger.middleware.js';
import { openAiService } from './open-ai.service.js';
import { OpenAI } from 'openai';
import '../../config.js';

export const openAiRoutes = express.Router();

// middleware that is specific to this router
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
            model: 'gpt-4',
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
        // Remove comments and backticks
        jsonString = jsonString.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/```json|```/g, '');

        // Add missing quotes around keys
        jsonString = jsonString.replace(/([{,])(\s*)([A-Za-z0-9_]+)(\s*):/g, '$1"$3":');

        // Remove trailing commas
        jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');

        // Ensure boolean and null values are not quoted
        jsonString = jsonString.replace(/"true"/g, 'true').replace(/"false"/g, 'false').replace(/"null"/g, 'null');

        // Fix improperly escaped characters
        jsonString = jsonString.replace(/\\([^nrtbf"\\/])/g, '\\\\$1');

        // Ensure all keys are quoted properly
        jsonString = jsonString.replace(/([{,])(\s*)([A-Za-z0-9_]+)(\s*):/g, '$1"$3":');

        // Fix unescaped double quotes inside string values
        jsonString = jsonString.replace(/"([^"]*?)":\s*"((?:[^"\\]|\\.)*?)"/g, (match, p1, p2) => {
            return `"${p1}": "${p2.replace(/"/g, '\\"')}"`;
        });

        // Fix trailing commas inside arrays or objects
        jsonString = jsonString.replace(/,\s*(?=[}\]])/g, '');

        // Try parsing the fixed JSON string
        return jsonString;
    } catch (e) {
        console.error("Fixing JSON failed:", e);
        throw new Error("Unable to fix invalid JSON");
    }
}

export default openAiRoutes;