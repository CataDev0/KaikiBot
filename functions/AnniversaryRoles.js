// Fuck this
// 5/8/2020 DDMMYYYY
const { timeToMidnight } = require("./functions"),
	RoleNameJoin = "Join Anniversary",
	RoleNameCreated = "Cake Day";
function DateObject() {
	const d = new Date();
	const Month = d.getMonth();
	const Day = d.getDate();
	return { d, Month, Day };
}
let ListUserCreatedAt = [],
	ListUserJoinedAt = [];

async function ReAssignBirthdays(client) {
	console.log("🟩 Birthday-Role service: Checking dates-");
	await Promise.all(await client.guilds.cache.map(async (guild) => {
		await GuildCheckRolesExist(guild);
		if (guild.me.hasPermission("MANAGE_ROLES")) {
			const { AnniversaryRoleC, AnniversaryRoleJ } = await GuildCheckRolesExist(guild);
			await Promise.all(await guild.members.cache.map(async (member) => {
				await MemberCheckAnniversary(member, AnniversaryRoleC, AnniversaryRoleJ);
			}));
		}
	}));
	// What a long line
	console.log(`🟩 Cake Day:${ListUserJoinedAt.length ? " Users added: " + ListUserJoinedAt.join(", ") : " No users were added to Join Anniversary."}\n🟩 Join Anniversary:${ListUserCreatedAt.length ? " Users added: " + ListUserCreatedAt.join(", ") : " No users were added to Cake Day."}\n🟩 Birthday-Role service: Finished checking dates.`);
	ListUserJoinedAt = [],
	ListUserCreatedAt = [];
	setTimeout(async () => {
		await ReAssignBirthdays(client);
	}, timeToMidnight());
}

async function GuildOnAddBirthdays(guild) {
	console.log("🟩 Birthday-Role service: Checking new user!");
	await GuildCheckRolesExist(guild);
	if (guild.me.hasPermission("MANAGE_ROLES")) {
		const { AnniversaryRoleC, AnniversaryRoleJ } = await GuildCheckRolesExist(guild);
		guild.members.cache.forEach(async (member) => {
			await MemberCheckAnniversary(member, AnniversaryRoleC, AnniversaryRoleJ);
		});
	}
}

async function GuildCheckRolesExist(guild) {
	if (!guild.me.hasPermission("MANAGE_ROLES")) {
		return console.log(guild.name + " can't add anniversary roles due to missing permissions: 'MANAGE_ROLES'");
	}
	if (!guild.roles.cache.some(r => r.name === RoleNameJoin)) {
		await guild.roles.create({
			data: { name: RoleNameJoin },
			reason: "Role didn't exist yet",
		}).catch(err => console.log(err));
	}
	if (!guild.roles.cache.some(r => r.name === RoleNameCreated)) {
		await guild.roles.create({
			data: { name: RoleNameCreated },
			reason: "Role didn't exist yet",
		}).catch(err => console.log(err));
	}
	const AnniversaryRoleJ = await guild.roles.cache.find((r => r.name === RoleNameJoin));
	const AnniversaryRoleC = await guild.roles.cache.find((r => r.name === RoleNameCreated));

	return { AnniversaryRoleC, AnniversaryRoleJ };
}
// Checks all roles
// Add role when date is right
// Removes role when date isn't right
// Its a cluster fuck
// Fixed ? I think so 19/08/2020
// OFC NOT.
// REWRITE AS OF 15/09/2020

async function MemberCheckAnniversary(member, AnniversaryRoleC, AnniversaryRoleJ) {

	const { Day, Month } = DateObject();
	if (member.user.createdAt.getMonth() === DateObject().Month) {
		if ([Day, Day - 1, Day + 1].includes(member.user.createdAt.getDate())) {
			if (!member.roles.cache.has(AnniversaryRoleC.id)) {
				ListUserCreatedAt.push(member.user.tag);
				await member.roles.add(AnniversaryRoleC);
			}
		}
		else {
			await member.roles.remove(AnniversaryRoleC).catch(err => console.log(err));
		}
	}
	else {
		await member.roles.remove(AnniversaryRoleC).catch(err => console.log(err));
	}
	if (member.joinedAt.getMonth() === Month) {
		if ([Day, Day - 1, Day + 1].includes(member.joinedAt.getDate())) {
			if (!member.roles.cache.has(AnniversaryRoleJ.id)) {
				ListUserJoinedAt.push(member.user.tag);
				return member.roles.add(AnniversaryRoleJ);
			}
		}
		else {
			return member.roles.remove(AnniversaryRoleJ).catch(err => console.log(err));
		}
	}
	else {
		return member.roles.remove(AnniversaryRoleJ).catch(err => console.log(err));
	}
}

module.exports = {
	ReAssignBirthdays, GuildOnAddBirthdays,
};
