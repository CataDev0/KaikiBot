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
    UserRoleColor: bigint | null
    UserRoleIcon: string | null;
    UserRoleName: string | null;
    icon: string;
    name: string;
}

// Initial data sent to the dashboard
export type POSTUserGuildsBody = {
    // Used to filter available guilds
    guildDb: { Id: bigint }[];
    userData: {
        Amount: bigint,
        ClaimedDaily: boolean,
        DailyReminder: Date | null,
        UserId: bigint
    } | null
}

export type Todo = {
    Id: bigint;
    UserId: bigint;
    String: string;
}
export type POSTUserTodoAddBody = Todo

export type POSTUserTodoDeleteBody = {
    todoIds: bigint[]
}

export type APIGuild = {
    Anniversary: boolean,
    ByeChannel: bigint | null,
    ByeMessage: string | null,
    ByeTimeout: number | null,
    CreatedAt: Date,
    DadBot: boolean,
    ErrorColor: bigint,
    ExcludeRole: bigint,
    Id: bigint,
    OkColor: bigint,
    Prefix: string,
    StickyRoles: boolean,
    WelcomeChannel: bigint | null,
    WelcomeMessage: string | null,
    WelcomeTimeout: number | null
}

export type APIGuildUsers = {
    CreatedAt: Date,
    GuildId: bigint,
    UserId: bigint,
    UserRole: bigint | null,
}

export type APIRole = { color: number; icon: string | null; id: string, name: string };

export type APIGuildStats = { bots: number, members: number, text: number, voice: number }
