
export const openAiService = {
    getPrompt
}

function getPrompt(title) {
    const structure = {
        "title": "Project Title",
        "activities": [],
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
                        "style": null,
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
    const prompt = `Create a board JSON of a "${title}" project with the following requirements:
1. The project object should not have an _id key and no createdBy key.
2. The project must have a key named 'activities' which its value is an empty array.
3. The style object of the project should have a key named 'background' which has the most meaningful word from the project's title.
4. The project should have meaningful labels names with colors that match their titles.
5. All tasks should have a dueDate key which sometimes has a timestamp value inside and sometimes null.
6. Each task should always have a description, which is most of the time a string describing the task and sometimes an empty string.
7. All tasks should have a style object with either:
- isFull (boolean), and optionally backgroundImage (most meaningful word from the task's title), backgroundColor (random color), or
- null.
8. Each task must have an empty array of attachments.
9. Each task's members array must be empty.
10. Each task's byMember key must be an empty object.
11. Each task's labelsIds must be taken from the board's labels.
12. Each group must have a style object with keys:
- backgroundColor (random color or null),
- isCollapse (mostly false but sometimes true).
13. The board should have an empty array of members.
14. The board must have at least 4 groups, each containing at least 4 tasks. Ensure at least some tasks have checklists with todos.

Return just the JSON object.

Here is the structure you need to follow:
${JSON.stringify(structure, null, 2)}`;
    return prompt
}