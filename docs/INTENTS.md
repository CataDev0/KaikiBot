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

## Disclaimer
This document word for word is not guaranteed in any way to get your application approved for any intents

## Message Content — Why it is needed

**Do not mention prefix based commands**

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

## Application Details

### What does your application do? Please be as detailed as possible, and feel free to include links to image or video examples.

 > KaikiBot is a multifunctional general purpose Discord Bot. It is being developed as an open source project on Github (CataDev0/KaikiBot). 

 > Kaiki's main purpose is to be a social enhancement tool, by having features that create social interactions and fun moments in the chat. At the same time it is a general purpose bot and is outfitted with many useful commands for users and admins alike.

 ### Do you have a public Privacy Policy telling your users about their data usage?

 >Yes
 #### Where is your Privacy Policy available?
 > The privacy policy is available on the bot's official website, and in the bot's help command.

 #### Please share a link to your Privacy Policy.
 > https://kaikibot.xyz/privacy

 ## Privileged Gateway Intents
### Which intents are you applying for, if any? (Leave blank if you do not need any of these)

Presence Intent

✅ Message Content Intent

You have the following limited intents and may apply for their full intents: Message Content Intent.

## Message Content Intent
### Can users opt-out of having their message content data tracked?
>Yes
### Are you storing message content data off-platform (outside of Discord)?
>No
### Will the message content data be used to train machine learning or AI Models?
If yes, please explain how in the text box below, including how such models would be used.
>No
### Why do you need the Message Content intent?
> KaikiBot requires Message Content intent for multiple purposes that CAN NOT be performed with Slash Commands, Context Menu Commands, or AutoMod.

These are:

Emote/Emoji statistics - A mostly admin feature which shows the count that each emote/emoji has been used in messages (since the start of counting). It is useful to see what emotes/emojis users dont like, and can safely replace them. 
The only way for this feature to work is to count emotes/emojis is to parse every message and scan it for emotes/emojis - requiring the priviliged message content intent.

Emote/Emoji server specific auto reactions - Another admin feature that allows servers to set themselves apart by defining any number of words that the bot can add emote/emoji reactions to when it is detected in a user message.

Dad response Feature - A fan favorite feature, and the main reason KaikiBot grew past the point of requiring me to request priviliged message content intent. 
The feature itself requires works by scanning each message for a pattern that matches a regular expression (regex), it will then respond to whoever invoked the unique pattern. The feature is not invoked deliberately by users and thus cannot be invoked by any Slash Commands or other non message content alternative.

Message content is processed in memory and transiently, it is never stored or logged. The bot only acts on messages in servers where the respective feature is explicitly enabled by an administrator.

### Please provide links to screenshots and/or videos that demonstrate your use case
>