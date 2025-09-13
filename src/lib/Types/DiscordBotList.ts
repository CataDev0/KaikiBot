export interface VoteBody {
    admin: boolean // If the user is a site administrator
    avatar?: string // The avatar hash of the user
    username: string // The username of the user who voted
    id: string // The ID of the user who voted
}

// Bot stats to be displayed on DBL.
export interface BotStats {
    guilds: number;
    shard_id?: number;
    users?: number;
    voice_connections?: number;
}
