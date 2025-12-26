export interface MinecraftServerStatusResponse {
    version: {
        name: string;
        protocol: number;
    };
    players: {
        max: number;
        online: number;
        sample?: {
            name: string;
            id: string;
        }[];
    };
    description: string | {
        text: string;
        extra?: {
            text: string;
            color: string;
        }[];
    };
    favicon?: string;
}
