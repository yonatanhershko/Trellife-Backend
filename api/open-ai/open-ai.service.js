export const openAiService = {
    getPrompt
}

function getPrompt(title) {
    const structure = {
        "title": "Project Title",
        "activities": [],
        "isStarred": false,
        "createdBy": {},
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
        "members": [],
        "groups": [
            {
                "id": "group-id",
                "title": "Group Title",
                "tasks": [
                    {
                        "id": "task-id",
                        "title": "Task Title",
                        "description": "Task description",
                        "isDone": false,
                        "priority": "Priority Level",
                        "checklists": [
                            {
                                "id": "checklist-id",
                                "title": "Checklist Title",
                                "todos": [
                                    {
                                        "id": "todo-id",
                                        "title": "Todo Title",
                                        "isDone": false
                                    }
                                ]
                            }
                        ],
                        "membersIds": [],
                        "labelsIds": ["label-id"],
                        "byMember": {},
                        "style": {
                            "isFull": true,
                            "backgroundImage": "task-title",
                            "backgroundColor": "#color"
                        },
                        "attachments": [],
                        "dueDate": null,
                    }
                ],
                "style": {
                    "backgroundColor": "#color", 
                    "isCollapse": false,
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

1. The project object should not have an _id key and no createdBy key.
2. The project object must have a createdBy key which its value is an empty object.
3. MUST include an empty array for 'activities'.
4. The project's style.background MUST be the most meaningful word from the project's title.
5. MUST include at least 4 labels with colors from: ${labelColors.join(', ')}.
6. MUST include at least 4 groups.
7. Each group MUST contain between 4 to 12 tasks. **Every group should have at least 4 tasks**.
8. At least 6 tasks MUST have detailed checklists with 4-8 todos. All todos MUST have isDone set to false.
9. Each task MUST have:
   - A description (can be an empty string)
   - A dueDate (if present, MUST be between 1723248000000 and 1725158400000, otherwise null)
   - A style object with isFull (boolean), and either backgroundImage (task's title) or backgroundColor (from ${taskColors.join(', ')}), or null if neither
   - Empty arrays for attachments and membersIds
   - An empty object for byMember
   - labelsIds referencing the board's labels
10. Each group MUST have a style object with:
   - backgroundColor (from ${groupColors.join(', ')} or null)
   - isCollapse (false)
11. The board MUST have an empty array for members.

Ensure that all titles, descriptions, and other text fields are meaningful and relevant to the project subject "${title}".

Failure to meet ANY of these requirements will result in an incorrect response. Double-check your JSON before returning it.

Follow this structure exactly:
${JSON.stringify(structure, null, 2)}

Return ONLY the JSON object, no explanations.`;

    return prompt;
}