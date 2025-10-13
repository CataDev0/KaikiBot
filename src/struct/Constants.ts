// noinspection MagicNumberJS

import { BotSettings_ActivityType } from "@prisma/client";
import {
    ActivityType,
    ChannelType,
    GuildFeature,
    HexColorString,
    RGBTuple,
    UserFlagsString,
} from "discord.js";
import { ColorNames, KaikiRGBA } from "../lib/Types/KaikiColor";

export enum UndocumentedFeatures {
    ACTIVITIES_ALPHA = "ACTIVITIES_ALPHA",
    ACTIVITIES_EMPLOYEE = "ACTIVITIES_EMPLOYEE",
    ACTIVITIES_INTERNAL_DEV = "ACTIVITIES_INTERNAL_DEV",
    AUTOMOD_TRIGGER_KEYWORD_FILTER = "AUTOMOD_TRIGGER_KEYWORD_FILTER",
    AUTOMOD_TRIGGER_ML_SPAM_FILTER = "AUTOMOD_TRIGGER_ML_SPAM_FILTER",
    AUTOMOD_TRIGGER_SPAM_LINK_FILTER = "AUTOMOD_TRIGGER_SPAM_LINK_FILTER",
    AUTOMOD_TRIGGER_USER_PROFILE = "AUTOMOD_TRIGGER_USER_PROFILE",
    BFG = "BFG",
    BOT_DEVELOPER_EARLY_ACCESS = "BOT_DEVELOPER_EARLY_ACCESS",
    BOOSTING_TIERS_EXPERIMENT_MEDIUM_GUILD = "BOOSTING_TIERS_EXPERIMENT_MEDIUM_GUILD",
    BOOSTING_TIERS_EXPERIMENT_SMALL_GUILD = "BOOSTING_TIERS_EXPERIMENT_SMALL_GUILD",
    BURST_REACTIONS = "BURST_REACTIONS",
    CHANNEL_EMOJIS_GENERATED = "CHANNEL_EMOJIS_GENERATED",
    CHANNEL_ICON_EMOJIS_GENERATED = "CHANNEL_ICON_EMOJIS_GENERATED",
    CHANNEL_HIGHLIGHTS = "CHANNEL_HIGHLIGHTS",
    CHANNEL_HIGHLIGHTS_DISABLED = "CHANNEL_HIGHLIGHTS_DISABLED",
    CLYDE_DISABLED = "CLYDE_DISABLED",
    CLYDE_ENABLED = "CLYDE_ENABLED",
    CLYDE_EXPERIMENT_ENABLED = "CLYDE_EXPERIMENT_ENABLED",
    COMMUNITY_CANARY = "COMMUNITY_CANARY",
    COMMUNITY_EXP_LARGE_GATED = "COMMUNITY_EXP_LARGE_GATED",
    COMMUNITY_EXP_LARGE_UNGATED = "COMMUNITY_EXP_LARGE_UNGATED",
    COMMUNITY_EXP_MEDIUM = "COMMUNITY_EXP_MEDIUM",
    CREATOR_ACCEPTED_NEW_TERMS = "CREATOR_ACCEPTED_NEW_TERMS",
    CREATOR_MONETIZABLE = "CREATOR_MONETIZABLE",
    CREATOR_MONETIZABLE_DISABLED = "CREATOR_MONETIZABLE_DISABLED",
    CREATOR_MONETIZABLE_PENDING_NEW_OWNER_ONBOARDING = "CREATOR_MONETIZABLE_PENDING_NEW_OWNER_ONBOARDING",
    CREATOR_MONETIZABLE_RESTRICTED = "CREATOR_MONETIZABLE_RESTRICTED",
    CREATOR_MONETIZABLE_WHITEGLOVE = "CREATOR_MONETIZABLE_WHITEGLOVE",
    CREATOR_MONETIZATION_APPLICATION_ALLOWLIST = "CREATOR_MONETIZATION_APPLICATION_ALLOWLIST",
    DISCOVERABLE_DISABLED = "DISCOVERABLE_DISABLED",
    ENABLED_DISCOVERABLE_BEFORE = "ENABLED_DISCOVERABLE_BEFORE",
    EXPOSED_TO_ACTIVITIES_WTP_EXPERIMENT = "EXPOSED_TO_ACTIVITIES_WTP_EXPERIMENT",
    GUESTS_ENABLED = "GUESTS_ENABLED",
    GUILD_AUTOMOD_DEFAULT_LIST = "GUILD_AUTOMOD_DEFAULT_LIST",
    GUILD_COMMUNICATION_DISABLED_GUILDS = "GUILD_COMMUNICATION_DISABLED_GUILDS",
    GUILD_HOME_DEPRECATION_OVERRIDE = "GUILD_HOME_DEPRECATION_OVERRIDE",
    GUILD_HOME_OVERRIDE = "GUILD_HOME_OVERRIDE",
    GUILD_HOME_TEST = "GUILD_HOME_TEST",
    GUILD_MEMBER_VERIFICATION_EXPERIMENT = "GUILD_MEMBER_VERIFICATION_EXPERIMENT",
    GUILD_ONBOARDING = "GUILD_ONBOARDING",
    GUILD_ONBOARDING_ADMIN_ONLY = "GUILD_ONBOARDING_ADMIN_ONLY",
    GUILD_ONBOARDING_EVER_ENABLED = "GUILD_ONBOARDING_EVER_ENABLED",
    GUILD_ONBOARDING_HAS_PROMPTS = "GUILD_ONBOARDING_HAS_PROMPTS",
    GUILD_ROLE_SUBSCRIPTIONS = "GUILD_ROLE_SUBSCRIPTIONS",
    GUILD_ROLE_SUBSCRIPTION_PURCHASE_FEEDBACK_LOOP = "GUILD_ROLE_SUBSCRIPTION_PURCHASE_FEEDBACK_LOOP",
    GUILD_ROLE_SUBSCRIPTION_TRIALS = "GUILD_ROLE_SUBSCRIPTION_TRIALS",
    GUILD_SERVER_GUIDE = "GUILD_SERVER_GUIDE",
    GUILD_WEB_PAGE_VANITY_URL = "GUILD_WEB_PAGE_VANITY_URL",
    HAD_EARLY_ACTIVITIES_ACCESS = "HAD_EARLY_ACTIVITIES_ACCESS",
    HIDE_FROM_EXPERIMENT_UI = "HIDE_FROM_EXPERIMENT_UI",
    INCREASED_THREAD_LIMIT = "INCREASED_THREAD_LIMIT",
    INTERNAL_EMPLOYEE_ONLY = "INTERNAL_EMPLOYEE_ONLY",
    NEW_THREAD_PERMISSIONS = "NEW_THREAD_PERMISSIONS",
    MARKETPLACES_CONNECTION_ROLES = "MARKETPLACES_CONNECTION_ROLES",
    MEMBER_PROFILES = "MEMBER_PROFILES",
    MEMBER_SAFETY_PAGE_ROLLOUT = "MEMBER_SAFETY_PAGE_ROLLOUT",
    MEMBER_VERIFICATION_MANUAL_APPROVAL = "MEMBER_VERIFICATION_MANUAL_APPROVAL",
    MOBILE_WEB_ROLE_SUBSCRIPTION_PURCHASE_PAGE = "MOBILE_WEB_ROLE_SUBSCRIPTION_PURCHASE_PAGE",
    MORE_EMOJI = "MORE_EMOJI",
    PREMIUM_TIER_3_OVERRIDE = "PREMIUM_TIER_3_OVERRIDE",
    PRODUCTS_AVAILABLE_FOR_PURCHASE = "PRODUCTS_AVAILABLE_FOR_PURCHASE",
    RAID_ALERTS_DISABLED = "RAID_ALERTS_DISABLED",
    RESTRICT_SPAM_RISK_GUILDS = "RESTRICT_SPAM_RISK_GUILDS",
    ROLE_SUBSCRIPTIONS_ENABLED_FOR_PURCHASE = "ROLE_SUBSCRIPTIONS_ENABLED_FOR_PURCHASE",
    SHARD = "SHARD",
    SHARED_CANVAS_FRIENDS_AND_FAMILY_TEST = "SHARED_CANVAS_FRIENDS_AND_FAMILY_TEST",
    SOUNDBOARD = "SOUNDBOARD",
    SUMMARIES_ENABLED = "SUMMARIES_ENABLED",
    SUMMARIES_ENABLED_GA = "SUMMARIES_ENABLED_GA",
    SUMMARIES_DISABLED_BY_USER = "SUMMARIES_DISABLED_BY_USER",
    SUMMARIES_ENABLED_BY_USER = "SUMMARIES_ENABLED_BY_USER",
    TEXT_IN_STAGE_ENABLED = "TEXT_IN_STAGE_ENABLED",
    TEXT_IN_VOICE_ENABLED = "TEXT_IN_VOICE_ENABLED",
    THREADS_ENABLED = "THREADS_ENABLED",
    THREADS_ENABLED_TESTING = "THREADS_ENABLED_TESTING",
    THREADS_ONLY_CHANNEL = "THREADS_ONLY_CHANNEL",
    THREAD_DEFAULT_AUTO_ARCHIVE_DURATION = "THREAD_DEFAULT_AUTO_ARCHIVE_DURATION",
    THREE_DAY_THREAD_ARCHIVE = "THREE_DAY_THREAD_ARCHIVE",
    TICKETING_ENABLED = "TICKETING_ENABLED",
    VOICE_CHANNEL_EFFECTS = "VOICE_CHANNEL_EFFECTS",
    VOICE_IN_THREADS = "VOICE_IN_THREADS",
}

export default class Constants {
    static readonly dadBotArray = ["i'm ", "im ", "i am ", "i’m "];

    static readonly anniversaryStrings = Object.freeze({
        ROLE_JOIN: "Join Anniversary",
        ROLE_CREATED: "Cake Day",
    });

    static readonly DEFAULTS = Object.freeze({
        BOT_CONFIG: {
            CUR_NAME: "Yen",
            CUR_SYMBOL: "💴",
        },
    });

    // Credit to https://github.com/Snitt/emojibotten/blob/master/commands/management/emoji.js
    static readonly emoteRegex = /<(a?)((!?\d+)|(:.+?:\d+))>/g;
    static readonly imgExtensionsRegex = /(?:jpg|gif|png|jpeg)/gi;

    static readonly guildFeatures: {
        [index in UndocumentedFeatures]: string;
    } & { [index in GuildFeature]: string } = Object.freeze({

        ACTIVITIES_ALPHA: "",
        ACTIVITIES_EMPLOYEE: "",
        ACTIVITIES_INTERNAL_DEV: "",
        ANIMATED_BANNER: "Animated banner",
        ANIMATED_ICON: "Animated icon",
        APPLICATION_COMMAND_PERMISSIONS_V2: "Application permissions v2",
        AUTOMOD_TRIGGER_KEYWORD_FILTER: "",
        AUTOMOD_TRIGGER_ML_SPAM_FILTER:
            "Given to guilds previously in the `2022-03_automod_trigger_ml_spam_filter` experiment overrides",
        AUTOMOD_TRIGGER_SPAM_LINK_FILTER: "",
        AUTOMOD_TRIGGER_USER_PROFILE:
            "Server has enabled AutoMod for user profiles.",
        AUTO_MODERATION: "Auto moderation",
        BANNER: "Banner",
        BFG: "",
        BOOSTING_TIERS_EXPERIMENT_MEDIUM_GUILD: "",
        BOOSTING_TIERS_EXPERIMENT_SMALL_GUILD: "",
        BOT_DEVELOPER_EARLY_ACCESS:
            "Early access features for bot and library developers enabled.",
        BURST_REACTIONS: "Burst reactions enabled",
        CHANNEL_EMOJIS_GENERATED: "Channel icon emojis populated",
        CHANNEL_HIGHLIGHTS: "",
        CHANNEL_HIGHLIGHTS_DISABLED: "",
        CHANNEL_ICON_EMOJIS_GENERATED: "Channel icon emojis populated",
        CLYDE_DISABLED:
            "Given when a server administrator disables ClydeAI for the guild",
        CLYDE_ENABLED: "",
        CLYDE_EXPERIMENT_ENABLED: "Enables ClydeAI for the guild",
        COMMUNITY: "Community",
        COMMUNITY_CANARY: "",
        COMMUNITY_EXP_LARGE_GATED: "",
        COMMUNITY_EXP_LARGE_UNGATED: "",
        COMMUNITY_EXP_MEDIUM: "",
        CREATOR_ACCEPTED_NEW_TERMS: "",
        CREATOR_MONETIZABLE:
            "Given to guilds that enabled role subscriptions through the manual approval system",
        CREATOR_MONETIZABLE_DISABLED: "",
        CREATOR_MONETIZABLE_PENDING_NEW_OWNER_ONBOARDING: "",
        CREATOR_MONETIZABLE_PROVISIONAL: "Creator monetization enabled",
        CREATOR_MONETIZABLE_RESTRICTED: "",
        CREATOR_MONETIZABLE_WHITEGLOVE: "",
        CREATOR_MONETIZATION_APPLICATION_ALLOWLIST: "",
        CREATOR_STORE_PAGE: "Creator store page",
        DEVELOPER_SUPPORT_SERVER: "Developer support server",
        DISCOVERABLE: "Visible in Server Discovery.",
        DISCOVERABLE_DISABLED:
            "Guild is permanently removed from Discovery by Discord.",
        ENABLED_DISCOVERABLE_BEFORE:
            "Given to servers that have enabled Discovery at any point.",
        ENHANCED_ROLE_COLORS: "Enhanced role colors",
        EXPOSED_TO_ACTIVITIES_WTP_EXPERIMENT:
            "Given to guilds previously in the `2021-11_activities_baseline_engagement_bundle` experiment overrides",
        FEATURABLE: "Can be featured",
        GUESTS_ENABLED: "Guild has used guest invites",
        GUILD_AUTOMOD_DEFAULT_LIST:
            "Given to guilds in the `2022-03_guild_automod_default_list` experiment overrides",
        GUILD_COMMUNICATION_DISABLED_GUILDS:
            "Given to guilds previously in the `2021-11_guild_communication_disabled_guilds` experiment overrides",
        GUILD_HOME_DEPRECATION_OVERRIDE: "Guild home deprecation override",
        GUILD_HOME_OVERRIDE:
            "Gives the guild access to the Home feature, enables Treatment 2 of the `2022-01_home_tab_guild` experiment overrides",
        GUILD_HOME_TEST:
            "Gives the guild access to the Home feature, enables Treatment 1 of the `2022-01_home_tab_guild` experiment",
        GUILD_MEMBER_VERIFICATION_EXPERIMENT:
            "Given to guilds previously in the `2021-11_member_verification_manual_approval` experiment",
        GUILD_ONBOARDING: "Guild has access to the Onboarding feature",
        GUILD_ONBOARDING_ADMIN_ONLY: "Onboarding only visible to guild admins",
        GUILD_ONBOARDING_EVER_ENABLED:
            "Guild has previously enabled the onboarding feature",
        GUILD_ONBOARDING_HAS_PROMPTS:
            "Guild has prompts configured in onboarding",
        GUILD_ROLE_SUBSCRIPTIONS:
            "Given to guilds previously in the `2021-06_guild_role_subscriptions` experiment overrides",
        GUILD_ROLE_SUBSCRIPTION_PURCHASE_FEEDBACK_LOOP:
            "Given to guilds previously in the `2022-05_mobile_web_role_subscription_purchase_page` experiment overrides",
        GUILD_ROLE_SUBSCRIPTION_TRIALS:
            "Given to guilds previously in the `2022-01_guild_role_subscription_trials` experiment overrides",
        GUILD_SERVER_GUIDE:
            "Guild has enabled [server guide](https://support.discord.com/hc/en-us/articles/13497665141655)",
        GUILD_TAGS: "Guild tags",
        GUILD_WEB_PAGE_VANITY_URL: "Web page vanity url",
        HAD_EARLY_ACTIVITIES_ACCESS:
            "Server previously had access to voice channel activities and can bypass the boost level requirement",
        HAS_DIRECTORY_ENTRY: "Guild is in a directory channel.",
        HIDE_FROM_EXPERIMENT_UI: "Hide from experiemtn UI",
        HUB: "[Student Hubs](https://dis.gd/studenthubs) contain a directory channel that let you find school-related, student-run servers for your school or university.",
        INCREASED_THREAD_LIMIT:
            "Allows the server to have 1,000+ active threads",
        INTERNAL_EMPLOYEE_ONLY:
            "Restricts the guild so that only users with the staff flag can join.",
        INVITES_DISABLED: "Disabled invites",
        INVITE_SPLASH:
            "Ability to set a background image that will display on all invite links.",
        LINKED_TO_HUB: "Linked to student hub",
        MARKETPLACES_CONNECTION_ROLES: "Marketplace connection roles",
        MEMBER_PROFILES:
            "Allows members to customize their avatar, banner and bio for that server.",
        MEMBER_SAFETY_PAGE_ROLLOUT:
            "Assigns the experiment of the `Member Safety` panel and lockdowns to the guild",
        MEMBER_VERIFICATION_GATE_ENABLED:
            "Has member verification gate enabled, requiring new users to pass the verification gate before interacting with the server.",
        MEMBER_VERIFICATION_MANUAL_APPROVAL:
            "Member verification with manual approval",
        MOBILE_WEB_ROLE_SUBSCRIPTION_PURCHASE_PAGE:
            "Given to guilds previously in the `2022-05_mobile_web_role_subscription_purchase_page` experiment overrides",
        MONETIZATION_ENABLED: "Monetization enabled",
        MORE_EMOJI:
            "Adds 150 extra emoji slots to each category (normal and animated emoji). Not used in server boosting.",
        MORE_SOUNDBOARD: "Increased custom soundboard sound slots",
        MORE_STICKERS:
            "Adds 60 total sticker slots no matter how many it had before. Not used in server boosting.",

        NEWS: "News",
        NEW_THREAD_PERMISSIONS:
            "Guild has [new thread permissions](https://support.discord.com/hc/en-us/articles/4403205878423#h_01FDGC4JW2D665Y230KPKWQZPN).",
        PARTNERED:
            "Partner badge near the server name and in mutual server lists.",
        PREMIUM_TIER_3_OVERRIDE: "Forces the server to server boosting level 3",
        PREVIEW_ENABLED:
            "Allows a user to view the server without passing membership gating.",
        PRIVATE_THREADS: "Private threads",
        PRODUCTS_AVAILABLE_FOR_PURCHASE:
            "Guild has server products available for purchase",
        RAID_ALERTS_DISABLED: "Guild is opt-out from raid alerts",
        RELAY_ENABLED:
            "Shards connections to the guild to different nodes that relay information between each other.",
        RESTRICT_SPAM_RISK_GUILDS: "Restrict spam risk",
        ROLE_ICONS: "Ability to set an image or emoji as a role icon.",
        ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE:
            "Allows servers members to purchase role subscriptions.",
        ROLE_SUBSCRIPTIONS_ENABLED: "Role subscription enabled",
        ROLE_SUBSCRIPTIONS_ENABLED_FOR_PURCHASE:
            "Monetizable role subscriptions enabled",
        SHARD: "Shard (?)",
        SHARED_CANVAS_FRIENDS_AND_FAMILY_TEST:
            "Given to guilds previously in the `2023-01_shared_canvas` experiment overrides",
        SOUNDBOARD:
            "Given to guilds previously in the `2021-12_soundboard` experiment overrides",
        SUMMARIES_DISABLED_BY_USER: "Summaries disbled",
        SUMMARIES_ENABLED:
            "Given to guilds in the `2023-02_p13n_summarization` experiment overrides",
        SUMMARIES_ENABLED_BY_USER: "Summaries enabled",
        SUMMARIES_ENABLED_GA:
            "Given to guilds in the `2023-02_p13n_summarization` experiment overrides",
        TEXT_IN_STAGE_ENABLED: "Text in stage enabled",
        TEXT_IN_VOICE_ENABLED: "Text in voice channels enabled.",
        THREADS_ENABLED: "Enabled threads early access.",
        THREADS_ENABLED_TESTING:
            "Threads-enabled testing. Used by bot developers to test their bots with threads in guilds with 5 or less members and a bot. ~~Also gives the premium thread features.~~",
        THREADS_ONLY_CHANNEL:
            "Threads-only channel. Given to guilds previously in the `2021-07_threads_only_channel` experiment overrides",
        THREAD_DEFAULT_AUTO_ARCHIVE_DURATION:
            "Unknown, presumably used for testing changes to the thread default auto archive duration.",
        THREE_DAY_THREAD_ARCHIVE:
            "Ability to have threads that archive after three days",
        TICKETED_EVENTS_ENABLED: "Ticketed events enabled",
        TICKETING_ENABLED: "Ticketing enabled",
        VANITY_URL:
            "Ability to set a vanity URL (custom discord.gg invite link).",
        VERIFIED:
            "Verification checkmark near the server name and in mutual server lists.",
        VIP_REGIONS:
            "~~Ability to use special voice regions with better stability: US East VIP, US West VIP, and Amsterdam VIP.~~ Deprecated, replaced with 384kbps max bitrate",
        VOICE_CHANNEL_EFFECTS:
            "Given to guilds previously in the `2022-06_voice_channel_effects` experiment overrides",
        VOICE_IN_THREADS: "Voice in threads",
        WELCOME_SCREEN_ENABLED: "Welcome screen enabled"
    });

    static readonly categories: { [category: string]: string } = Object.freeze({
        Administration: "For server admins. Manage bans and channels.",
        Anime: "Search anime, manga and quotes.",
        Emotes: "Steal or create new emotes",
        Fun: "Silly commands. Has avatar manipulation, games and more",
        Gambling: "Try your game at betting. Gain and lose. Lose a lot",
        Interactions:
            "Put your feelings on display with kiss, or just hug, or something else?",
        Images: "Spawn cute anime waifus!",
        Moderation: "Moderate the chat with clear, kick and savechat",
        NSFW: "🔞",
        "Owner only":
            "**Bot owner only.** Manage the bot and execute dangerous commands",
        Roles: "Create, edit and manage server roles, personal roles and more",
        "Server settings": "Configure the bot for your server",
        Utility: "Info, color, search, ping and much more.",
    });

    static readonly channelTypes: {
        [type in keyof typeof ChannelType]: string;
    } = Object.freeze({
        AnnouncementThread: "Announcement thread",
        DM: "DM",
        GroupDM: "GroupDM",
        GuildAnnouncement: "Guild announcements",
        GuildCategory: "Category",
        GuildDirectory: "Guild directory",
        GuildForum: "Guild forum",
        GuildMedia: "Guild media",
        GuildNews: "News",
        GuildNewsThread: "News thread",
        GuildPrivateThread: "Private thread",
        GuildPublicThread: "Public thread",
        GuildStageVoice: "Stage",
        GuildText: "Text",
        GuildVoice: "Voice",
        PrivateThread: "Private thread",
        PublicThread: "Public thread",
    });

    static readonly flags: { [index in UserFlagsString]: string } =
        Object.freeze({
            ActiveDeveloper: "Active developer",
            BotHTTPInteractions: "Bot interactions",
            BugHunterLevel1: "Bug Hunter (Level 1) 🐛",
            BugHunterLevel2: "Bug Hunter (Level 2) 🐛",
            CertifiedModerator: "Certified Moderator",
            HypeSquadOnlineHouse1: "House of Bravery 🏠",
            HypeSquadOnlineHouse2: "House of Brilliance 🏠",
            HypeSquadOnlineHouse3: "House of Balance 🏠",
            Hypesquad: "HypeSquad Events Member 🎊",
            Partner: "Partnered Server Owner ❤️",
            PremiumEarlySupporter: "Nitro Early Supporter 👍",
            Quarantined: "Quarantined/Disabled user ☣",
            Spammer: "Identified spammer ⚠",
            Staff: "Discord Employee 👨‍💼",
            TeamPseudoUser: "Team User 🏁",
            VerifiedBot: "Verified Bot ☑️",
            VerifiedDeveloper: "Early Verified Developer ✅",
            MFASMS: "MFASMS",
            PremiumPromoDismissed: "Premium promotion disabled",
            HasUnreadUrgentMessages: "Unread urgent messages",
            DisablePremium: "Disabled premium",
            Collaborator: "Collaborator",
            RestrictedCollaborator: "Restricted Collaborator",
        });

    static readonly activityTypes: {
        [index in BotSettings_ActivityType]: Exclude<
            ActivityType,
            ActivityType.Custom
        >;
    } = Object.freeze({
        PLAYING: ActivityType.Playing,
        STREAMING: ActivityType.Streaming,
        LISTENING: ActivityType.Listening,
        WATCHING: ActivityType.Watching,
        COMPETING: ActivityType.Competing,
    });

    static readonly MAGIC_NUMBERS = Object.freeze({
        CACHE: {
            FIFTEEN_MINUTES_MS: 900000,
        },
        CMDS: {
            ADMIN: {
                SB_MSG_DEL_SECONDS: 604800,
            },
            ANIME: {},
            EMOTES: {
                ADD_EMOTE: {
                    NAME_MAX_LENGTH: 32,
                },
                DELETE_EMOTE: {
                    DELETE_DELAY: 3500,
                },

                EMOTE_COUNT: {
                    MIN_PR_PAGE: 25,
                    MAX_PR_PAGE: 50,
                },
                MAX_FILESIZE: 25600,
                MAX_WIDTH_HEIGHT: 128,
            },
            ETC: {
                BOT_MENTION: {
                    DELETE_TIMEOUT: 10000,
                },
                DAD_BOT: {
                    DADBOT_NICK_LENGTH: 32,
                    DADBOT_MAX_LENGTH: 256,
                },
            },
            FUN: {
                NAMES: {
                    NAMES_PR_PAGE: 60,
                },
                NEOFETCH: {
                    DISTROS_PR_PAGE: 150,
                },
                REDDIT: {
                    NSFW_DEL_TIMEOUT: 7500,
                },
            },
            GAMBLING: {
                BET_ROLL: {
                    TWO_TIMES_ROLL: 66,
                    FOUR_TIMES_ROLL: 90,
                    TEN_TIMES_ROLL: 100,
                },
                CUR_TRS: {
                    BIGINT_ZERO: 0n,
                    TRANS_PR_PAGE: 15,
                },
                SLOTS: {
                    EDIT_AFTER_1_SEC: 1000,
                    // * Almost two seconds.
                    EDIT_AFTER_2_SEC: 2100,
                },
            },
            MODERATION: {
                CLEAR: {
                    DELETE_TIMEOUT: 1500,
                },
            },
            OWNER_ONLY: {
                BOT_CONFIG: {
                    DAILY_AMOUNT: 250,
                },
                EVAL: {
                    MAX_STRING: 1990,
                    MAX_ERROR_STRING: 1960,
                },
                SQL: {
                    MESSAGE_LIMIT_JSON: 1960,
                },
                UPDATE: {
                    DESC_STR_LIMIT: 4048,
                    TIMEOUT: 300000,
                },
            },
            ROLES: {
                IN_ROLE: {
                    ROLES_PR_PAGE: 40,
                },
                ROLE_LIST: {
                    ROLES_PR_PAGE: 50,
                },
                USER_ROLES: {
                    ROLE_PR_PAGE: 20,
                },
            },
            SERVER_SETTINGS: {
                EMOTES: {
                    EMOTE_TRIGGERS_PR_PAGE: 15,
                },
            },
            UTILITY: {
                COLOR: {
                    CLR_NAMES_PR_PAGE: 15,
                },
                SERVER_LIST: {
                    GUILDS_PER_PAGE: 15,
                },
                TODO: {
                    INPUT_MAX_LENGTH: 204,
                },
            },
        },
        COMMON: {
            NAME_LIMIT: 32,
        },
        EMBED_LIMITS: {
            AUTHOR_NAME: 256,
            DESCRIPTION: 4096,
            FIELD: {
                NAME: 256,
                VALUE: 1024,
            },
            FOOTER: {
                TEXT: 2048,
            },
            TITLE: 256,
        },

        LIB: {
            GAMES: {
                TTT: {
                    MSG_DEL_TIMEOUT: 4500,
                },
            },
            HENTAI: {
                HENTAI_SERVICE: {
                    FULL_CACHE_SIZE: 200,
                    MEDIUM_CACHE_SIZE: 50,
                },
            },
            KAIKI: {
                KAIKI_ARGS: {
                    MAX_COLOR_VALUE: 0xffffff,
                    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
                    MAX_INT: 0x7fffffffffffffffn,
                    // ABSOLUTE ZERO IN BINARY
                    MIN_INT: 0b0,
                },
                PRESENCE_UPDATE_TIMEOUT: 300000,
            },
            MONEY: {
                MONEY_SERVICE: {
                    BIGINT_ZERO: 0n,
                },
            },
            UTILITY: {
                // [R,G,B]
                ERR_CLR: [255, 0, 0] as RGBTuple,
                HRS_DAY: 24,
                OK_CLR: [0, 255, 0] as RGBTuple,
                // #ea580c
                KAIKI_CLR: [234, 88, 12] as RGBTuple,
            },
        },
        SERVICES: {
            DBL_POST_INTERVAL_MS: 3600000
        }
    });

    static readonly errorColor = Constants.MAGIC_NUMBERS.LIB.UTILITY.ERR_CLR;

    static readonly okColor = Constants.MAGIC_NUMBERS.LIB.UTILITY.OK_CLR;

    static readonly kaikiOrange = Constants.MAGIC_NUMBERS.LIB.UTILITY.KAIKI_CLR;

    static readonly KaikiBotASCII =
        "__/\\\\\\________/\\\\\\___________________________________________/\\\\\\\\\\\\\\\\\\\\\\\\\\_______________________________        \n" +
		" _\\/\\\\\\_____/\\\\\\//________________________/\\\\\\_______________\\/\\\\\\/////////\\\\\\_____________________________       \n" +
		"  _\\/\\\\\\__/\\\\\\//_____________________/\\\\\\_\\/\\\\\\__________/\\\\\\_\\/\\\\\\_______\\/\\\\\\___________________/\\\\\\______      \n" +
		"   _\\/\\\\\\\\\\\\//\\\\\\______/\\\\\\\\\\\\\\\\\\____\\///__\\/\\\\\\\\\\\\\\\\____\\///__\\/\\\\\\\\\\\\\\\\\\\\\\\\\\\\______/\\\\\\\\\\_____/\\\\\\\\\\\\\\\\\\\\\\_     \n" +
		"    _\\/\\\\\\//_\\//\\\\\\____\\////////\\\\\\____/\\\\\\_\\/\\\\\\////\\\\\\___/\\\\\\_\\/\\\\\\/////////\\\\\\___/\\\\\\///\\\\\\__\\////\\\\\\////__    \n" +
		"     _\\/\\\\\\____\\//\\\\\\_____/\\\\\\\\\\\\\\\\\\\\__\\/\\\\\\_\\/\\\\\\\\\\\\\\\\/___\\/\\\\\\_\\/\\\\\\_______\\/\\\\\\__/\\\\\\__\\//\\\\\\____\\/\\\\\\______   \n" +
		"      _\\/\\\\\\_____\\//\\\\\\___/\\\\\\/////\\\\\\__\\/\\\\\\_\\/\\\\\\///\\\\\\___\\/\\\\\\_\\/\\\\\\_______\\/\\\\\\_\\//\\\\\\__/\\\\\\_____\\/\\\\\\_/\\\\__  \n" +
		"       _\\/\\\\\\______\\//\\\\\\_\\//\\\\\\\\\\\\\\\\/\\\\_\\/\\\\\\_\\/\\\\\\_\\///\\\\\\_\\/\\\\\\_\\/\\\\\\\\\\\\\\\\\\\\\\\\\\/___\\///\\\\\\\\\\/______\\//\\\\\\\\\\___ \n" +
		"        _\\///________\\///___\\////////\\//__\\///__\\///____\\///__\\///__\\/////////////_______\\/////_________\\/////____";

    static readonly colorTable: { [index in keyof ColorNames]: KaikiRGBA } =
        Object.freeze({
            aliceblue: "rgba(240,248,255,1)",
            antiquewhite: "rgba(250,235,215,1)",
            aqua: "rgba(0,255,255,1)",
            aquamarine: "rgba(127,255,212,1)",
            azure: "rgba(240,255,255,1)",
            beige: "rgba(245,245,220,1)",
            bisque: "rgba(255,228,196,1)",
            black: "rgba(0,0,1,1)",
            blanchedalmond: "rgba(255,235,205,1)",
            blue: "rgba(0,0,255,1)",
            blueviolet: "rgba(138,43,226,1)",
            brown: "rgba(165,42,42,1)",
            burlywood: "rgba(222,184,135,1)",
            cadetblue: "rgba(95,158,160,1)",
            chartreuse: "rgba(127,255,0,1)",
            chocolate: "rgba(210,105,30,1)",
            coral: "rgba(255,127,80,1)",
            cornflowerblue: "rgba(100,149,237,1)",
            cornsilk: "rgba(255,248,220,1)",
            crimson: "rgba(220,20,60,1)",
            cyan: "rgba(0,255,255,1)",
            darkblue: "rgba(0,0,139,1)",
            darkcyan: "rgba(0,139,139,1)",
            darkgoldenrod: "rgba(184,134,11,1)",
            darkgray: "rgba(169,169,169,1)",
            darkgreen: "rgba(0,100,0,1)",
            darkgrey: "rgba(169,169,169,1)",
            darkkhaki: "rgba(189,183,107,1)",
            darkmagenta: "rgba(139,0,139,1)",
            darkolivegreen: "rgba(85,107,47,1)",
            darkorange: "rgba(255,140,0,1)",
            darkorchid: "rgba(153,50,204,1)",
            darkred: "rgba(139,0,0,1)",
            darksalmon: "rgba(233,150,122,1)",
            darkseagreen: "rgba(143,188,143,1)",
            darkslateblue: "rgba(72,61,139,1)",
            darkslategray: "rgba(47,79,79,1)",
            darkslategrey: "rgba(47,79,79,1)",
            darkturquoise: "rgba(0,206,209,1)",
            darkviolet: "rgba(148,0,211,1)",
            deeppink: "rgba(255,20,147,1)",
            deepskyblue: "rgba(0,191,255,1)",
            dimgray: "rgba(105,105,105,1)",
            dimgrey: "rgba(105,105,105,1)",
            dodgerblue: "rgba(30,144,255,1)",
            firebrick: "rgba(178,34,34,1)",
            floralwhite: "rgba(255,250,240,1)",
            forestgreen: "rgba(34,139,34,1)",
            fuchsia: "rgba(255,0,255,1)",
            gainsboro: "rgba(220,220,220,1)",
            ghostwhite: "rgba(248,248,255,1)",
            gold: "rgba(255,215,0,1)",
            goldenrod: "rgba(218,165,32,1)",
            gray: "rgba(128,128,128,1)",
            green: "rgba(0,128,0,1)",
            greenyellow: "rgba(173,255,47,1)",
            grey: "rgba(128,128,128,1)",
            honeydew: "rgba(240,255,240,1)",
            hotpink: "rgba(255,105,180,1)",
            indianred: "rgba(205,92,92,1)",
            indigo: "rgba(75,0,130,1)",
            ivory: "rgba(255,255,240,1)",
            khaki: "rgba(240,230,140,1)",
            lavender: "rgba(230,230,250,1)",
            lavenderblush: "rgba(255,240,245,1)",
            lawngreen: "rgba(124,252,0,1)",
            lemonchiffon: "rgba(255,250,205,1)",
            lightblue: "rgba(173,216,230,1)",
            lightcoral: "rgba(240,128,128,1)",
            lightcyan: "rgba(224,255,255,1)",
            lightgoldenrodyellow: "rgba(250,250,210,1)",
            lightgray: "rgba(211,211,211,1)",
            lightgreen: "rgba(144,238,144,1)",
            lightgrey: "rgba(211,211,211,1)",
            lightpink: "rgba(255,182,193,1)",
            lightsalmon: "rgba(255,160,122,1)",
            lightseagreen: "rgba(32,178,170,1)",
            lightskyblue: "rgba(135,206,250,1)",
            lightslategray: "rgba(119,136,153,1)",
            lightslategrey: "rgba(119,136,153,1)",
            lightsteelblue: "rgba(176,196,222,1)",
            lightyellow: "rgba(255,255,224,1)",
            lime: "rgba(0,255,0,1)",
            limegreen: "rgba(50,205,50,1)",
            linen: "rgba(250,240,230,1)",
            magenta: "rgba(255,0,255,1)",
            maroon: "rgba(128,0,0,1)",
            mediumaquamarine: "rgba(102,205,170,1)",
            mediumblue: "rgba(0,0,205,1)",
            mediumorchid: "rgba(186,85,211,1)",
            mediumpurple: "rgba(147,112,219,1)",
            mediumseagreen: "rgba(60,179,113,1)",
            mediumslateblue: "rgba(123,104,238,1)",
            mediumspringgreen: "rgba(0,250,154,1)",
            mediumturquoise: "rgba(72,209,204,1)",
            mediumvioletred: "rgba(199,21,133,1)",
            midnightblue: "rgba(25,25,112,1)",
            mintcream: "rgba(245,255,250,1)",
            mistyrose: "rgba(255,228,225,1)",
            moccasin: "rgba(255,228,181,1)",
            navajowhite: "rgba(255,222,173,1)",
            navy: "rgba(0,0,128,1)",
            oldlace: "rgba(253,245,230,1)",
            olive: "rgba(128,128,0,1)",
            olivedrab: "rgba(107,142,35,1)",
            orange: "rgba(255,165,0,1)",
            orangered: "rgba(255,69,0,1)",
            orchid: "rgba(218,112,214,1)",
            palegoldenrod: "rgba(238,232,170,1)",
            palegreen: "rgba(152,251,152,1)",
            paleturquoise: "rgba(175,238,238,1)",
            palevioletred: "rgba(219,112,147,1)",
            papayawhip: "rgba(255,239,213,1)",
            peachpuff: "rgba(255,218,185,1)",
            peru: "rgba(205,133,63,1)",
            pink: "rgba(255,192,203,1)",
            plum: "rgba(221,160,221,1)",
            powderblue: "rgba(176,224,230,1)",
            purple: "rgba(128,0,128,1)",
            rebeccapurple: "rgba(102,51,153,1)",
            red: "rgba(255,0,0,1)",
            rosybrown: "rgba(188,143,143,1)",
            royalblue: "rgba(65,105,225,1)",
            saddlebrown: "rgba(139,69,19,1)",
            salmon: "rgba(250,128,114,1)",
            sandybrown: "rgba(244,164,96,1)",
            seagreen: "rgba(46,139,87,1)",
            seashell: "rgba(255,245,238,1)",
            sienna: "rgba(160,82,45,1)",
            silver: "rgba(192,192,192,1)",
            skyblue: "rgba(135,206,235,1)",
            slateblue: "rgba(106,90,205,1)",
            slategray: "rgba(112,128,144,1)",
            slategrey: "rgba(112,128,144,1)",
            snow: "rgba(255,250,250,1)",
            springgreen: "rgba(0,255,127,1)",
            steelblue: "rgba(70,130,180,1)",
            tan: "rgba(210,180,140,1)",
            teal: "rgba(0,128,128,1)",
            thistle: "rgba(216,191,216,1)",
            tomato: "rgba(255,99,71,1)",
            transparent: "rgba(0,0,0,0)",
            turquoise: "rgba(64,224,208,1)",
            violet: "rgba(238,130,238,1)",
            wheat: "rgba(245,222,179,1)",
            white: "rgba(255,255,255,1)",
            whitesmoke: "rgba(245,245,245,1)",
            yellow: "rgba(255,255,0,1)",
            yellowgreen: "rgba(154,205,50,1)",
        });

    static readonly hexColorTable: {
        [index in keyof ColorNames]: HexColorString;
    } = Object.freeze({
        aliceblue: "#f0f8ff",
        antiquewhite: "#faebd7",
        aqua: "#00ffff",
        aquamarine: "#7fffd4",
        azure: "#f0ffff",
        beige: "#f5f5dc",
        bisque: "#ffe4c4",
        black: "#000001",
        blanchedalmond: "#ffebcd",
        blue: "#0000ff",
        blueviolet: "#8a2be2",
        brown: "#a52a2a",
        burlywood: "#deb887",
        cadetblue: "#5f9ea0",
        chartreuse: "#7fff00",
        chocolate: "#d2691e",
        coral: "#ff7f50",
        cornflowerblue: "#6495ed",
        cornsilk: "#fff8dc",
        crimson: "#dc143c",
        cyan: "#00ffff",
        darkblue: "#00008b",
        darkcyan: "#008b8b",
        darkgoldenrod: "#b8860b",
        darkgray: "#a9a9a9",
        darkgreen: "#006400",
        darkgrey: "#a9a9a9",
        darkkhaki: "#bdb76b",
        darkmagenta: "#8b008b",
        darkolivegreen: "#556b2f",
        darkorange: "#ff8c00",
        darkorchid: "#9932cc",
        darkred: "#8b0000",
        darksalmon: "#e9967a",
        darkseagreen: "#8fbc8f",
        darkslateblue: "#483d8b",
        darkslategray: "#2f4f4f",
        darkslategrey: "#2f4f4f",
        darkturquoise: "#00ced1",
        darkviolet: "#9400d3",
        deeppink: "#ff1493",
        deepskyblue: "#00bfff",
        dimgray: "#696969",
        dimgrey: "#696969",
        dodgerblue: "#1e90ff",
        firebrick: "#b22222",
        floralwhite: "#fffaf0",
        forestgreen: "#228b22",
        fuchsia: "#ff00ff",
        gainsboro: "#dcdcdc",
        ghostwhite: "#f8f8ff",
        gold: "#ffd700",
        goldenrod: "#daa520",
        gray: "#808080",
        green: "#008000",
        greenyellow: "#adff2f",
        grey: "#808080",
        honeydew: "#f0fff0",
        hotpink: "#ff69b4",
        indianred: "#cd5c5c",
        indigo: "#4b0082",
        ivory: "#fffff0",
        khaki: "#f0e68c",
        lavender: "#e6e6fa",
        lavenderblush: "#fff0f5",
        lawngreen: "#7cfc00",
        lemonchiffon: "#fffacd",
        lightblue: "#add8e6",
        lightcoral: "#f08080",
        lightcyan: "#e0ffff",
        lightgoldenrodyellow: "#fafad2",
        lightgray: "#d3d3d3",
        lightgreen: "#90ee90",
        lightgrey: "#d3d3d3",
        lightpink: "#ffb6c1",
        lightsalmon: "#ffa07a",
        lightseagreen: "#20b2aa",
        lightskyblue: "#87cefa",
        lightslategray: "#778899",
        lightslategrey: "#778899",
        lightsteelblue: "#b0c4de",
        lightyellow: "#ffffe0",
        lime: "#00ff00",
        limegreen: "#32cd32",
        linen: "#faf0e6",
        magenta: "#ff00ff",
        maroon: "#800000",
        mediumaquamarine: "#66cdaa",
        mediumblue: "#0000cd",
        mediumorchid: "#ba55d3",
        mediumpurple: "#9370db",
        mediumseagreen: "#3cb371",
        mediumslateblue: "#7b68ee",
        mediumspringgreen: "#00fa9a",
        mediumturquoise: "#48d1cc",
        mediumvioletred: "#c71585",
        midnightblue: "#191970",
        mintcream: "#f5fffa",
        mistyrose: "#ffe4e1",
        moccasin: "#ffe4b5",
        navajowhite: "#ffdead",
        navy: "#000080",
        oldlace: "#fdf5e6",
        olive: "#808000",
        olivedrab: "#6b8e23",
        orange: "#ffa500",
        orangered: "#ff4500",
        orchid: "#da70d6",
        palegoldenrod: "#eee8aa",
        palegreen: "#98fb98",
        paleturquoise: "#afeeee",
        palevioletred: "#db7093",
        papayawhip: "#ffefd5",
        peachpuff: "#ffdab9",
        peru: "#cd853f",
        pink: "#ffc0cb",
        plum: "#dda0dd",
        powderblue: "#b0e0e6",
        purple: "#800080",
        rebeccapurple: "#663399",
        red: "#ff0000",
        rosybrown: "#bc8f8f",
        royalblue: "#4169e1",
        saddlebrown: "#8b4513",
        salmon: "#fa8072",
        sandybrown: "#f4a460",
        seagreen: "#2e8b57",
        seashell: "#fff5ee",
        sienna: "#a0522d",
        silver: "#c0c0c0",
        skyblue: "#87ceeb",
        slateblue: "#6a5acd",
        slategray: "#708090",
        slategrey: "#708090",
        snow: "#fffafa",
        springgreen: "#00ff7f",
        steelblue: "#4682b4",
        tan: "#d2b48c",
        teal: "#008080",
        thistle: "#d8bfd8",
        tomato: "#ff6347",
        transparent: "#000000",
        turquoise: "#40e0d0",
        violet: "#ee82ee",
        wheat: "#f5deb3",
        white: "#ffffff",
        whitesmoke: "#f5f5f5",
        yellow: "#ffff00",
        yellowgreen: "#9acd32",
    });

    static readonly LINKS = Object.freeze({
        REPO_URL: "https://github.com/cataDev0/KaikiBot.git",
        GUIDE: "https://github.com/cataDev0/KaikiBot/blob/master/docs/GUIDE.md",
        PRIVACY_POLICY: "https://kaikibot.xyz/privacy",
        TERMS_OF_USE: "https://kaikibot.xyz/terms"
    });
    // eslint-disable-next-line no-control-regex
    static NeoFetchRegExp = new RegExp(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g);
}
