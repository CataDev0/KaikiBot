 

// INB4 this changes randomly

export default interface RedditAPIData {
	kind: string;
	data: RedditDatumData;
}

export interface RedditDatumData {
	modhash: string;
	dist: number | null;
	children: PurpleChild[];
	after: null;
	before: null;
}

export interface PurpleChild {
	kind: string;
	data: PurpleData;
}

export interface PurpleData {
	approved_at_utc: null;
	subreddit: string;
	selftext?: string;
	user_reports: any[];
	saved: boolean;
	mod_reason_title: null;
	gilded: number;
	clicked?: boolean;
	title?: string;
	link_flair_richtext?: FlairRichtext[];
	subreddit_name_prefixed: string;
	hidden?: boolean;
	pwls?: number;
	link_flair_css_class?: string;
	downs: number;
	thumbnail_height?: null;
	top_awarded_type: null;
	parent_whitelist_status?: string;
	hide_score?: boolean;
	name: string;
	quarantine?: boolean;
	link_flair_text_color?: string;
	upvote_ratio?: number;
	author_flair_background_color: null | string;
	subreddit_type: string;
	ups: number;
	total_awards_received: number;
	media_embed?: Gildings;
	thumbnail_width?: null;
	author_flair_template_id: null | string;
	is_original_content?: boolean;
	author_fullname: string;
	secure_media?: null;
	is_reddit_media_domain?: boolean;
	is_meta?: boolean;
	category?: null;
	secure_media_embed?: Gildings;
	link_flair_text?: string;
	can_mod_post: boolean;
	score: number;
	approved_by: null;
	author_premium: boolean;
	thumbnail?: string;
	edited: boolean | number;
	author_flair_css_class: null | string;
	author_flair_richtext: FlairRichtext[];
	gildings: Gildings;
	post_hint?: string;
	content_categories?: null;
	is_self?: boolean;
	mod_note: null;
	created: number;
	link_flair_type?: string;
	wls?: number;
	removed_by_category?: null;
	banned_by: null;
	author_flair_type: string;
	domain?: string;
	allow_live_comments?: boolean;
	selftext_html?: string;
	likes: null;
	suggested_sort?: null;
	banned_at_utc: null;
	view_count?: null;
	archived: boolean;
	no_follow: boolean;
	is_crosspostable?: boolean;
	pinned?: boolean;
	over_18?: boolean;
	preview?: Preview;
	all_awardings: any[];
	awarders: any[];
	media_only?: boolean;
	link_flair_template_id?: string;
	can_gild: boolean;
	spoiler?: boolean;
	locked: boolean;
	author_flair_text: null | string;
	treatment_tags: any[];
	visited?: boolean;
	removed_by?: null;
	num_reports: null;
	distinguished: null;
	subreddit_id: string;
	mod_reason_by: null;
	removal_reason: null;
	link_flair_background_color?: string;
	id: string;
	is_robot_indexable?: boolean;
	num_duplicates?: number;
	report_reasons: null;
	author: string;
	discussion_type?: null;
	num_comments?: number;
	send_replies: boolean;
	media?: null;
	contest_mode?: boolean;
	author_patreon_flair: boolean;
	author_flair_text_color: null | string;
	permalink: string;
	whitelist_status?: string;
	stickied: boolean;
	url?: string;
	subreddit_subscribers?: number;
	created_utc: number;
	num_crossposts?: number;
	mod_reports: any[];
	is_video?: boolean;
	comment_type?: null;
	link_id?: string;
	replies?: Replies;
	parent_id?: string;
	body?: string;
	is_submitter?: boolean;
	collapsed?: boolean;
	body_html?: string;
	collapsed_reason?: null;
	associated_award?: null;
	score_hidden?: boolean;
	controversiality?: number;
	depth?: number;
	collapsed_because_crowd_control?: null;
}

export interface FlairRichtext {
	e: string;
	t: string;
}

export interface Gildings {
	[index: string]: any;
}

export interface Preview {
	images: Image[];
	enabled: boolean;
}

export interface Image {
	source: Source;
	resolutions: Source[];
	variants: Gildings;
	id: string;
}

export interface Source {
	url: string;
	width: number;
	height: number;
}

export interface Replies {
	kind: string;
	data: RepliesData;
}

export interface RepliesData {
	modhash: string;
	dist: null;
	children: FluffyChild[];
	after: null;
	before: null;
}

export interface FluffyChild {
	kind: string;
	data: FluffyData;
}

export interface FluffyData {
	total_awards_received: number;
	approved_at_utc: null;
	comment_type: null;
	awarders: any[];
	mod_reason_by: null;
	banned_by: null;
	ups: number;
	author_flair_type: string;
	removal_reason: null;
	link_id: string;
	author_flair_template_id: null;
	likes: null;
	replies: string;
	user_reports: any[];
	saved: boolean;
	id: string;
	banned_at_utc: null;
	mod_reason_title: null;
	gilded: number;
	archived: boolean;
	no_follow: boolean;
	author: string;
	can_mod_post: boolean;
	send_replies: boolean;
	parent_id: string;
	score: number;
	author_fullname: string;
	report_reasons: null;
	approved_by: null;
	all_awardings: any[];
	subreddit_id: string;
	collapsed: boolean;
	body: string;
	edited: boolean;
	author_flair_css_class: null;
	is_submitter: boolean;
	downs: number;
	author_flair_richtext: any[];
	author_patreon_flair: boolean;
	body_html: string;
	gildings: Gildings;
	collapsed_reason: null;
	associated_award: null;
	stickied: boolean;
	author_premium: boolean;
	subreddit_type: string;
	can_gild: boolean;
	top_awarded_type: null;
	author_flair_text_color: null;
	score_hidden: boolean;
	permalink: string;
	num_reports: null;
	locked: boolean;
	name: string;
	created: number;
	subreddit: string;
	author_flair_text: null;
	treatment_tags: any[];
	created_utc: number;
	subreddit_name_prefixed: string;
	controversiality: number;
	depth: number;
	author_flair_background_color: null;
	collapsed_because_crowd_control: null;
	mod_reports: any[];
	mod_note: null;
	distinguished: null;
}
