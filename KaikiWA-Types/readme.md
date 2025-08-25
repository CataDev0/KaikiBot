### Endpoints
    GET /API/Guild

    Description: Fetch multiple guilds the bot is in + user data.

    Query: userId, ids (comma-separated)

    Response: { userData, guildDb }

    Errors: 400, 401, 404

GET /API/Guild/:id

    Description: Get full data for a specific guild.

    Query (optional): userId

    Response: { guild, user }

    Errors: 400, 401, 404

PATCH /API/Guild/:id

    Description: Update guild settings or user role.

    Body: Partial<PUTDashboardBody> (JSON-parsable strings)

    Response: 200 OK

    Errors: 400, 401, 404

DELETE /API/User/:id/todo

    Description: Delete user's to-do items.

    Body: { todoIds: bigint[] }

    Response: 200 OK or 500 Partial delete

    Errors: 400, 401

POST /API/User/:id/todo

    Not implemented


