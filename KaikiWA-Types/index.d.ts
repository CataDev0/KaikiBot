// Data sent when requested for each guild
export type GETGuildBody = {
    guild: Omit<APIGuild, "ExcludeRole"> & {
        // Overwrites Guild ExcludedRole with data from bot cache
        ExcludeRole: APIRole | null;
        channels: { id: string; name: string }[];
        emojis: { id: string; name: string | null; url: string; animated: boolean | null }[];
        roles: APIRole[];
        statsCount: APIGuildStats
    },
    user: {
        userRole: APIRole | null;
    }
}

// Custom type for data coming from the Webserver
export type PUTDashboardBody = Omit<APIGuild, "Id" | "CreatedAt"> & APIGuildUsers & {
    ExcludeRole: string;
    ExcludeRoleName: string | null;
    UserRoleColor: string | null
    UserRoleIcon: string | null;
    UserRoleName: string | null;
    icon: string;
    name: string;
}

// Initial data sent to the dashboard
export type POSTUserGuildsBody = {
    // Used to filter available guilds
    guildDb: { Id: string }[];
    userData: {
        Amount: string,
        ClaimedDaily: boolean,
        DailyReminder: string | null,
        UserId: string
    } | null
}

export type Todo = {
    Id: string;
    UserId: string;
    String: string;
}
export type POSTUserTodoAddBody = Todo

export type POSTUserTodoDeleteBody = {
    todoIds: string[]
}

export type APIGuild = {
    Anniversary: boolean,
    ByeChannel: string | null,
    ByeMessage: string | null,
    ByeTimeout: number | null,
    CreatedAt: string,
    DadBot: boolean,
    ErrorColor: string,
    ExcludeRole: string,
    Id: string,
    OkColor: string,
    Prefix: string,
    StickyRoles: boolean,
    WelcomeChannel: string | null,
    WelcomeMessage: string | null,
    WelcomeTimeout: number | null
}

export type APIGuildUsers = {
    CreatedAt: string,
    GuildId: string,
    UserId: string,
    UserRole: string | null,
}

export type APIRole = { color: number; icon: string | null; id: string, name: string };

export type APIGuildStats = { bots: number, members: number, text: number, voice: number }
