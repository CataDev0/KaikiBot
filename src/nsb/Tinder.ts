import db from "quick.db";
const Tinder = new db.table("Tinder");
import { timeToMidnight, msToTime } from "./functions";
import { editMessageWithPaginatedEmbeds } from "@cataclym/discord.js-pagination-ts-nsb";
import { MessageEmbed, Message, User } from "discord.js";

export interface tinderDataStructure {
	rolls: number,
	likes: number,
	datingIDs: string[],
	likeIDs: string[],
	dislikeIDs: string[],
	marriedIDs: string[],
	temporary: string[]
}

async function tinderDBService(user: User): Promise<void> {

	let tinderData: tinderDataStructure = Tinder.get(user.id);

	if (tinderData?.likes) return Promise.resolve();

	tinderData = {
		rolls: 15,
		likes: 3,
		datingIDs: [user.id],
		likeIDs: [user.id],
		dislikeIDs: [user.id],
		marriedIDs: [user.id],
		temporary: [],
	};

	Tinder.set(user.id, tinderData);
	return Promise.resolve();
}
function NoLikes(): string {
	return "You don't have any more likes!\nLikes and rolls reset in: " + msToTime(timeToMidnight());
}
async function NoRolls(): Promise<string> {
	return "You don't have any more rolls!\nLikes and rolls reset in: " + msToTime(timeToMidnight());
}

/**
  * Function to return a specific tinder list.
  *
  * @param {Message} message Context
  * @param {string[]} Item User's specific tinder array
  * @param {string} ListName Embed title
  * @return {Message} editMessageWithPaginatedEmbeds
  */
async function SeparateTinderList(message: Message, Item: string[], ListName = "Tinder list"): Promise<Message> {

	Item.shift();
	// Remove self
	if (!Item.length) { return message.reply("There doesn't seem to be anyone here"); }

	const pages = [];
	for (let i = 30, p = 0; p < Item.length; i = i + 30, p = p + 30) {
		const dEmbed = new MessageEmbed()
			.setTitle(ListName)
			.setColor(await message.getMemberColorAsync())
			.setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
			// Edited for 30 items pr page with correct index number
			.setDescription(Item.slice(p, i).length ? Item.map((item, itemIndex) => `**${+itemIndex + 1}**. ${message.client.users.cache.find(member => member.id === item) ? message.client.users.cache.find(member => member.id === item)?.username : "`User has left guild`"}`).slice(p, i) : "There doesn't seem to be anyone here");
		pages.push(dEmbed);
	}
	return editMessageWithPaginatedEmbeds(message, pages, {});
}

const allListMap = async (message: Message, DataAndID: string[]) => {
	return DataAndID.slice(1, 21).map((item, i) => `${+i + 1}. ${message.client.users.cache.find(_user => _user.id === item) ? message.client.users.cache.find(_user => _user.id === item)?.username : "User left guild"}`).join("\n");
};

async function fetchUserList(message: Message, user: User): Promise<Message> {

	await tinderDBService(user);

	const embed = new MessageEmbed()
		.setTitle(user.username + "'s tinder list")
		.setColor(await message.getMemberColorAsync());

	const { datingIDs, marriedIDs, dislikeIDs, likeIDs }: tinderDataStructure = Tinder.get(user.id);

	embed.addFields(
		{ name: "Liked 👍", value: likeIDs?.length > 1 ? await allListMap(message, likeIDs) : "N/A", inline: true },
		{ name: "Disliked ❌", value: dislikeIDs?.length > 1 ? await allListMap(message, dislikeIDs) : "N/A", inline: true },
		{ name: "Dating ❤️", value: datingIDs?.length > 1 ? await allListMap(message, datingIDs) : "N/A", inline: true });

	if (marriedIDs?.length > 1) {
		embed.addFields(
			{ name: "\u200B", value: "\u200B", inline: true },
			{ name: "Married 🌟", value: await allListMap(message, marriedIDs) + "\u200B", inline: true },
			{ name: "\u200B", value: "\u200B", inline: true },
		);
	}
	return message.channel.send(embed);
}

async function NormalLike(message: Message, SentMsg: Message, genericEmbed: MessageEmbed, newHasRolls: number, hasLikes: number, randomUsr: User): Promise<Message> {
	if (hasLikes > 0) {
		--hasLikes;
		// Updates leftover likes/rolls in real-time /s
		const NewRollsLikes = `${newHasRolls} rolls, ${hasLikes} likes remaining.`;

		const newEmbed = new MessageEmbed(genericEmbed)
			.setAuthor("❤️❤️❤️")
			.setTitle(randomUsr.username)
			.setFooter(NewRollsLikes);

		Tinder.set(`${message.author.id}.likes`, hasLikes);

		if (Tinder.has(`${randomUsr.id}.likeIDs`)) {
			// Prevents choke
			const checkLikeIDs = Tinder.get(`${randomUsr.id}.likeIDs`);
			// Theoretically this part should work
			if (checkLikeIDs.includes(`${message.author.id}`)) {
				Tinder.push(`${message.author.id}.datingIDs`, randomUsr.id);
				Tinder.push(`${randomUsr.id}.datingIDs`, message.author.id);
				const edited = await SentMsg.edit(newEmbed
					.setColor("#ff00ff")
					.setDescription("It's a match! Congratulations!"));
				if (message.guild?.me?.hasPermission("MANAGE_MESSAGES")) await SentMsg.reactions.removeAll();
				return edited;
			}
		}
		await tinderDBService(randomUsr);
		Tinder.push(`${message.author.id}.likeIDs`, randomUsr.id);

		const edited = await SentMsg.edit(newEmbed
			.setColor("#00FF00")
			.setDescription("has been added to likes!"));
		if (message.guild?.me?.hasPermission("MANAGE_MESSAGES")) await SentMsg.reactions.removeAll();
		return edited;
	}
	else {
		SentMsg.reactions.removeAll();
		return message.channel.send(NoLikes());
	}
}

async function Dislike(message: Message, SentMsg: Message, genericEmbed: MessageEmbed, newHasRolls: number, hasLikes: number, randomUsr: User): Promise<Message> {
	Tinder.push(`${message.author.id}.dislikeIDs`, randomUsr.id);
	const NewRollsLikes = `${newHasRolls} rolls, ${hasLikes} likes remaining.`;
	if (message.guild?.me?.hasPermission("MANAGE_MESSAGES")) await SentMsg.reactions.removeAll();
	return SentMsg.edit(new MessageEmbed(genericEmbed)
		.setAuthor("❌❌❌")
		.setColor("#00FF00")
		.setTitle(randomUsr.username)
		.setDescription("has been added to dislikes.")
		.setFooter(NewRollsLikes));
}

async function SuperLike(message: Message, SentMsg: Message, genericEmbed: MessageEmbed, hasLikes: number, randomUsr: User): Promise<Message> {
	if (hasLikes > 0) {
		const zero = 0;
		Tinder.push(`${message.author.id}.datingIDs`, randomUsr.id);
		Tinder.push(`${randomUsr.id}.datingIDs`, message.author.id);
		Tinder.set(`${message.author.id}.rolls`, zero);
		Tinder.set(`${message.author.id}.likes.`, zero);
		if (message.guild?.me?.hasPermission("MANAGE_MESSAGES")) await SentMsg.reactions.removeAll();
		return SentMsg.edit(new MessageEmbed(genericEmbed)
			.setAuthor("❤️🌟❤️")
			.setColor("#FFFF00")
			.setTitle(randomUsr.username)
			.setDescription("Is now dating you!")
			.setFooter("You have no rolls or likes remaining."));
	}
	else {
		await SentMsg.reactions.removeAll();
		return message.channel.send(NoLikes());
	}
}

export {
	tinderDBService, NoLikes, NoRolls, SeparateTinderList, fetchUserList,
	Dislike, NormalLike, SuperLike,
	// tinderNodeCanvasImage,
};