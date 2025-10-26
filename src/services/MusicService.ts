import {
    AudioPlayer,
    AudioPlayerStatus,
    VoiceConnection,
    VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
    entersState,
    joinVoiceChannel,
    StreamType,
} from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";
import { spawn } from "child_process";
import { Readable } from "stream";
import { container } from "@sapphire/framework";

interface Track {
    url: string;
    title: string;
    requestedBy: string;
}

export class MusicService {
    private connection: VoiceConnection | null = null;
    private player: AudioPlayer;
    private queue: Track[] = [];
    private currentTrack: Track | null = null;
    private isPlaying: boolean = false;

    constructor() {
        this.player = createAudioPlayer();
        this.setupPlayerHandlers();
    }

    private setupPlayerHandlers() {
        this.player.on(AudioPlayerStatus.Idle, () => {
            this.isPlaying = false;
            this.currentTrack = null;
            this.playNext();
        });

        this.player.on(AudioPlayerStatus.Playing, () => {
            this.isPlaying = true;
        });

        this.player.on("error", (error) => {
            container.logger.error(`AudioPlayer error: ${error.message}`);
            this.isPlaying = false;
            this.currentTrack = null;
            this.playNext();
        });
    }

    public async join(channel: VoiceBasedChannel): Promise<void> {
        if (this.connection && this.connection.joinConfig.channelId === channel.id) {
            return;
        }

        this.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        try {
            await entersState(this.connection, VoiceConnectionStatus.Ready, 30_000);
        } catch {
            this.connection.destroy();
            this.connection = null;
            throw new Error("Failed to join voice channel within 30 seconds");
        }

        this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(this.connection!, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(this.connection!, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch {
                this.connection?.destroy();
                this.connection = null;
            }
        });

        this.connection.subscribe(this.player);
    }

    public async play(url: string, requestedBy: string): Promise<string> {
        if (this.isPlaying || this.player.state.status === AudioPlayerStatus.Playing) {
            const track: Track = { url, title: "Loading...", requestedBy };
            this.queue.push(track);
            return `Added to the queue (Position: ${this.queue.length})`;
        }

        const track: Track = { url, title: "Loading...", requestedBy };
        this.currentTrack = track;
        const actualTitle = await this.playTrack(track);
        return `Now playing: **${actualTitle}**`;
    }

    private async playTrack(track: Track): Promise<string> {
        try {
            const { stream, title } = await this.createAudioStream(track.url);
            track.title = title;
            const resource = createAudioResource(stream, {
                inputType: StreamType.OggOpus,
            });
            
            this.player.play(resource);
            await entersState(this.player, AudioPlayerStatus.Playing, 10_000);
            return title;
        } catch (error) {
            container.logger.error(`Failed to play track: ${error}`);
            this.currentTrack = null;
            this.isPlaying = false;
            this.playNext();
            throw error;
        }
    }

    private async createAudioStream(url: string): Promise<{ stream: Readable; title: string }> {
        return new Promise((resolve, reject) => {
            const ytdlp = spawn("yt-dlp", [
                "-f", "bestaudio/best",
                "--no-playlist",
                "--print-json",
                "--extract-audio",
                "--audio-format", "opus",
                "--audio-quality", "0",
                "-o", "-",
                url,
            ]);

            const ffmpeg = spawn("ffmpeg", [
                "-i", "pipe:0",
                "-analyzeduration", "0",
                "-loglevel", "error",
                "-f", "opus",
                "-ar", "48000",
                "-ac", "2",
                "pipe:1",
            ]);

            let resolved = false;
            let errored = false;
            let title = "Unknown Track";
            let jsonBuffer = "";

            ytdlp.stdout.on("error", (error: NodeJS.ErrnoException) => {
                if (error.code === "EPIPE" || error.code === "ECONNRESET") {
                    return;
                }
                if (!errored && !resolved) {
                    container.logger.error(`yt-dlp stdout error: ${error.message}`);
                }
            });

            const pipe = ytdlp.stdout.pipe(ffmpeg.stdin);
            
            pipe.on("error", (error: NodeJS.ErrnoException) => {
                if (error.code === "EPIPE" || error.code === "ECONNRESET") {
                    return;
                }
                if (!errored && !resolved) {
                    errored = true;
                    reject(new Error(`Pipe error: ${error.message}`));
                }
            });

            ytdlp.stderr.on("data", (data) => {
                const message = data.toString();
                
                if (message.includes("{") || jsonBuffer.length > 0) {
                    jsonBuffer += message;
                    try {
                        const json = JSON.parse(jsonBuffer);
                        if (json.title) {
                            title = json.title;
                        }
                        jsonBuffer = "";
                    } catch {
                        // Suppress, continue to buffer
                    }
                } else if (message.trim() && !resolved && message.includes("ERROR")) {
                    container.logger.error(`yt-dlp: ${message.trim()}`);
                }
            });

            ffmpeg.stderr.on("data", (data) => {
                const message = data.toString().trim();
                if (!resolved && !message.includes("Connection reset")) {
                    container.logger.error(`ffmpeg: ${message}`);
                }
            });

            ytdlp.on("error", (error) => {
                if (!errored && !resolved) {
                    errored = true;
                    reject(new Error(`yt-dlp process error: ${error.message}`));
                }
            });

            ffmpeg.on("error", (error) => {
                if (!errored && !resolved) {
                    errored = true;
                    reject(new Error(`ffmpeg process error: ${error.message}`));
                }
            });

            ffmpeg.stdout.once("readable", () => {
                if (!resolved && !errored) {
                    resolved = true;
                    resolve({ stream: ffmpeg.stdout, title });
                }
            });

            ffmpeg.on("close", (code) => {
                if (code !== 0 && code !== null && !resolved && !errored) {
                    errored = true;
                    reject(new Error(`ffmpeg exited with code ${code}`));
                }
            });

            ytdlp.on("close", (code) => {
                if (code !== 0 && code !== null && !resolved && !errored) {
                    errored = true;
                    reject(new Error(`yt-dlp exited with code ${code}`));
                }
            });
        });
    }

    private playNext(): void {
        if (this.queue.length === 0) {
            this.currentTrack = null;
            this.isPlaying = false;
            return;
        }

        const nextTrack = this.queue.shift();
        if (nextTrack) {
            this.currentTrack = nextTrack;
            this.playTrack(nextTrack).catch((error) => {
                container.logger.error(`Failed to play next track: ${error}`);
                this.playNext();
            });
        }
    }

    public skip(): boolean {
        if (!this.isPlaying && this.player.state.status !== AudioPlayerStatus.Playing) {
            return false;
        }

        this.player.stop();
        return this.queue.length > 0;
    }

    public disconnect(): void {
        this.player.stop();
        this.connection?.destroy();
        this.connection = null;
        this.queue = [];
        this.currentTrack = null;
        this.isPlaying = false;
    }

    public isConnected(): boolean {
        return this.connection !== null && 
               this.connection.state.status !== VoiceConnectionStatus.Disconnected &&
               this.connection.state.status !== VoiceConnectionStatus.Destroyed;
    }

    public getCurrentTrack(): Track | null {
        return this.currentTrack;
    }

    public getQueue(): Track[] {
        return this.queue;
    }
}
