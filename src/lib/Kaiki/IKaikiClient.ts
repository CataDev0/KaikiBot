import { PrismaClient } from "@prisma/client";
import { User } from "discord.js";
import KaikiCache from "../Cache/KaikiCache";
import Database from "../../struct/db/Database";
import DatabaseProvider from "../../struct/db/DatabaseProvider";
import AnniversaryRolesService from "../../services/AnniversaryRolesService";
import HentaiService from "../../services/HentaiService";
import PackageJSON from "../Interfaces/Common/PackageJSON";
import { MoneyService } from "../../services/MoneyService";
import { MusicService } from "../../services/MusicService";
import { GachaService } from "../../services/GachaService";
import { BattleService } from "../../services/BattleService";

export default interface IKaikiClient {
	anniversaryService: AnniversaryRolesService;
	botSettings: DatabaseProvider;
	cache: KaikiCache;

	dadBotChannels: DatabaseProvider;
	guildsDb: DatabaseProvider;
	money: MoneyService;
	orm: PrismaClient;
	db: Database;
	owner: User;
	package: PackageJSON;
	hentaiService: HentaiService;
	musicService?: MusicService;
	gachaService?: GachaService
	battleService?: BattleService

}
