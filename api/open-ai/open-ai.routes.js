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
            model: 'gpt-4-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 3800,
        });

        const messageContent = completion.choices[0].message.content;

        try {
            const validJSON = fixInvalidJson(messageContent);
            const responseObject = JSON.parse(validJSON);
            if (!isValidResponse(responseObject)) {
                console.warn('Response does not meet minimum requirements');
            }
            res.json(responseObject);  // Send as JSON response
        } catch (jsonError) {
            console.error('Invalid JSON:', messageContent);
            res.status(500).json({
                error: 'Invalid JSON response from OpenAI',
                details: jsonError.message,
                content: messageContent
            });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: error.message,
            stack: error.stack
        });
    }
});

function fixInvalidJson(jsonString) {
    try {
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

    let hasChecklist = false;

    for (const group of response.groups) {
        if (!group.tasks || group.tasks.length < 4) {
            return false;
        }

        for (const task of group.tasks) {
            if (task.checklists && task.checklists.length > 0) {
                hasChecklist = true;
                break;
            }
        }

        if (hasChecklist) break;
    }

    if (!hasChecklist) {
        console.warn('No task contains a checklist.');
        return false;
    }

    return true;
}