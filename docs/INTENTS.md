### Paths

-   [Readme](../README.md)
-   Docs
    -   [Guide](GUIDE.md)
    -   [.env setup](ENV.md)
    -   [Placeholders](PLACEHOLDERS.md)

# Discord privileged intents

If the bot reaches the 10k users threshold, then applying for priviliged intents is necessary for the bot to conitnue to function.

KaikiBot requires the **Message Content** privileged intent to function.
The **Presence** intent is **not required**, and should not be applied for.

## Message Content — why it is needed

**DONT MENTION PREFIX BASED COMMANDS**
1.  ~~**Prefix-based command system (core functionality).** KaikiBot's primary interaction model is per-guild configurable prefix commands. Each server can set its own custom prefix, and users invoke commands like `+daily`, `+info`, or `+config` by typing them in chat. Detecting the prefix and parsing arguments (including multi-word arguments such as search phrases for `+urban` or message templates for welcome messages) requires reading message content.~~


2.  **DadBot.** An opt-in per-guild joke feature: when a user writes a message starting with phrases like "I'm ...", the bot replies with a dad joke and can set the user's nickname accordingly. This depends entirely on parsing the content of ordinary, non-command chat messages.

3.  **Emote counting.** Per-server statistics that count how often each custom emoji is used. The bot must scan message content for custom emoji syntax (`<:name:id>`) to attribute usage counts per guild.

4.  **Emote reactions.** Server admins can define trigger strings (e.g. a word or phrase) so the bot automatically reacts with a chosen emoji when a message matches. Matching messages against these triggers requires reading message content.

**Privacy note:** Message content is processed in memory and transiently; it is never stored or logged. The bot only acts on messages in servers where the respective feature is explicitly enabled by an administrator.

### Condensed version (for the Developer Portal form)

> The bot's core feature is per-guild prefix commands (`+daily`, `+config`, `+info`), which require reading message content to detect each server's custom prefix and parse arguments. Additionally, server-admins can opt in to: (1) DadBot, which replies to "I'm ..." messages, (2) emote usage counters, which parse custom emoji from messages, and (3) emote reactions triggered by configurable keywords in messages. Content is processed in memory and never stored.

## Presence — why it is not needed

-   The bot only sets **its own** presence (rotating status), which does not require any intent.
-   The one command that reads another user's presence (`+info`) handles the absence of presence data gracefully — without the intent, `member.presence` is simply `null`.
-   Applying for extra privileged intents adds review scrutiny without benefit; KaikiBot has no feature that requires seeing other users' presence.

## Developer Portal form answers

For the Message Content intent application:

-   **Can users opt-out of having their message content data tracked?** — `Yes`. Every feature that reads non-command content is opt-in per server, DadBot additionally has a per-user opt-out (`+exclude`), and no message content is stored.
-   **Are you storing message content data off-platform?** — `No`. The database stores settings, currency, and aggregate emoji counts only — no message content tables or logs.
-   **Will the message content data be used to train machine learning or AI models?** — `No`.
-   **Why do you need the Message Content intent?** — see the condensed version above;

