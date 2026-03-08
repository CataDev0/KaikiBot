export type SafebooruData = SafebooruPost[];

export interface SafebooruPost {
    id: number;
    file_url: string;
    sample_url: string;
    preview_url: string;
    tags: string;
    source: string;
    rating: string;
    width: number;
    height: number;
    score: number | null;
    owner: string;
    has_notes: boolean;
    comment_count: number;
}
