import { VoiceBasedChannel } from "discord.js";
import { spawn } from "child_process";
import { Readable } from "stream";
import { container } from "@sapphire/framework";

// @ts-ignore
type VoiceLib = typeof import("@discordjs/voice");

interface Track {
    url: string;
    title: string;
    requestedBy: string;
}

export class MusicService {
    // @ts-ignore
    private connection: import("@discordjs/voice").VoiceConnection | null = null;
    // @ts-ignore
    private player: import("@discordjs/voice").AudioPlayer | null = null;
    private queue: Track[] = [];
    private currentTrack: Track | null = null;
    private isPlaying: boolean = false;
    private voiceLib: VoiceLib | null = null;

    public async init(): Promise<void> {
        const voice = await this.loadVoice();
        if (!voice) return;

        this.player = voice.createAudioPlayer();
        this.player.on(voice.AudioPlayerStatus.Idle, () => this.playNext());
        this.player.on(voice.AudioPlayerStatus.Playing, () => (this.isPlaying = true));
        this.player.on("error", (err: Error) => {
            container.logger.error(`AudioPlayer error: ${err.message}`);
            this.isPlaying = false;
            this.currentTrack = null;
            this.playNext();
        });
    }
    private async loadVoice(): Promise<VoiceLib | null> {
        if (this.voiceLib) return this.voiceLib;
        try {
            // @ts-ignore
            this.voiceLib = await import("@discordjs/voice");
            return this.voiceLib;
        } catch {
            container.logger.warn("Music features disabled: @discordjs/voice not installed.");
            return null;
        }
    }

    public async join(channel: VoiceBasedChannel): Promise<void> {
        const voice = await this.loadVoice();
        if (!voice) throw new Error("Voice support unavailable");

        if (this.connection && this.connection.joinConfig.channelId === channel.id) return;

        this.connection = voice.joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        try {
            await voice.entersState(this.connection, voice.VoiceConnectionStatus.Ready, 30_000);
        } catch {
            this.connection.destroy();
            this.connection = null;
            throw new Error("Failed to join voice channel within 30 seconds");
        }

        this.connection.on(voice.VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    voice.entersState(this.connection!, voice.VoiceConnectionStatus.Signalling, 5_000),
                    voice.entersState(this.connection!, voice.VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch {
                this.connection?.destroy();
                this.connection = null;
            }
        });

        this.connection.subscribe(this.player!);
    }
    

    public async play(url: string, requestedBy: string): Promise<string> {
        if (!this.voiceLib) throw new Error("Voice support unavailable");

        if (this.isPlaying || this.player?.state.status === this.voiceLib.AudioPlayerStatus?.Playing) {
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
        if (!this.voiceLib) throw new Error("Voice support unavailable");

        try {
            const { stream, title } = await this.createAudioStream(track.url);
            track.title = title;
            const resource = this.voiceLib.createAudioResource(stream, {
                inputType: this.voiceLib.StreamType.OggOpus,
            });
            
            this.player?.play(resource);
            await this.voiceLib.entersState(this.player!, this.voiceLib.AudioPlayerStatus.Playing, 10_000);
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
        if (!this.voiceLib) throw new Error("Voice support unavailable");
      
        if (!this.isPlaying && this.player?.state.status !== this.voiceLib.AudioPlayerStatus.Playing) {
            return false;
        }

        this.player?.stop();
        return this.queue.length > 0;
    }

    public disconnect(): void {
        this.player?.stop();
        this.connection?.destroy();
        this.connection = null;
        this.queue = [];
        this.currentTrack = null;
        this.isPlaying = false;
    }

    public isConnected(): boolean {
        if (!this.voiceLib) throw new Error("Voice support unavailable");
      
        return this.connection !== null && 
               this.connection.state.status !== this.voiceLib.VoiceConnectionStatus.Disconnected &&
               this.connection.state.status !== this.voiceLib.VoiceConnectionStatus.Destroyed;
    }

    public getCurrentTrack(): Track | null {
        return this.currentTrack;
    }

    public getQueue(): Track[] {
        return this.queue;
    }
}
