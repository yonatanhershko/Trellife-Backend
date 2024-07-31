export const openAiService = {
    getPrompt
}

function getPrompt(title) {
    const structure = {
        "title": "Project Title",
        "style": {
            "background": "background-url"
        },
        "labels": [
            {
                "id": "label-id",
                "title": "Label Title",
                "color": "#color"
            }
        ],
        "groups": [
            {
                "id": "group-id",
                "title": "Group Title",
                "tasks": [
                    {
                        "id": "task-id",
                        "title": "Task Title",
                        "description": "",
                        "checklists": [],
                        "labelsIds": ["label-id"],
                        "byMember": {},
                        "style": {
                            "isFull": false,
                            "backgroundColor": "#color",
                            "backgroundImage": "background-url"
                        },
                        "dueDate": null
                    }
                ],
                "style": {
                    "backgroundColor": "#color",
                }
            }
        ]
    };

    const labelColors = [
        '#174b35', '#533f03', '#702e00', '#5d1f1a', '#362c63', 
        '#206e4e', '#7f5f02', '#a64700', '#ae2e24', '#5e4db2',
        '#4cce97', '#e1b205', '#fea363', '#f87168', '#9f8fef',
        '#0a326c', '#154555', '#37471f', '#50253f', '#454f59', 
        '#0055cc', '#1f6a83', '#4d6b1f', '#943d73', '#596773',
        '#579dff', '#6cc3e0', '#94c747', '#e774bb', '#8c9baa'
    ];

    const groupColors = [
        '#04120d', '#344563', '#1A6ED8', '#a37d1f', 
        '#C26A3E', '#B84A45', '#3A8CA0', '#7B6CC1', 
        '#216e4e', '#3B7AC5'
    ];

    const taskColors = [
        '#206e4e', '#7f5f02', '#a64700', '#ae2e24', '#5e4db2',
        '#0055cc', '#1f6a83', '#4d6b1f', '#943d73', '#596773'
    ];

    const prompt = `Create a detailed board JSON for a "${title}" project. Ensure all titles, descriptions, and content are meaningful and related to the subject of "${title}". Strictly adhere to these requirements:

1. The project's style.background MUST be the most meaningful word or two words from the project's title.
2. The project must include at least 3 labels with colors from: ${labelColors.join(', ')}.
3. The project must include at least 4 groups.
4. Each group must contain between 4 to 12 tasks. **Every group must have at least 4 tasks**.
5. Each task must have:
   - A description key with an empty string as its value, except 3 tasks which must have short descriptions.
   - A dueDate key (if present, must be between 1723248000000 and 1735689600000, otherwise null).
   - A style object: with backgroundColor (from ${taskColors.join(', ')} for important tasks, and **one task must have a backgroundImage** which MUST be the most meaningful word or two words from the task's title that relates the most to the project's title.
   - labelsIds referencing the board's labels.
   - At least 3 tasks must have a non-empty checklist with 2 todos, and all todos MUST have isDone set to false.
6. Each group must have a style object with:
   - backgroundColor (from ${groupColors.join(', ')} or null).
   - isCollapse (false).

Ensure that no other keys with empty values (empty strings, empty arrays, empty objects, null values) are included in the response. Remove hardcoded keys like isStarred if they are false.

Ensure that all titles, descriptions, and other text fields are meaningful and relevant to the project subject "${title}".

Failure to meet ANY of these requirements will result in an incorrect response. Double-check your JSON before returning it.

Follow this structure exactly:
${JSON.stringify(structure, null, 2)}

Return ONLY the JSON object, no explanations.`;

    return prompt;
}