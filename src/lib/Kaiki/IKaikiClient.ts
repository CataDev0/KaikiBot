import { PrismaClient } from "@prisma/client";
import { User } from "discord.js";
import { Pool } from "mysql2/promise";
import KaikiCache from "../Cache/KaikiCache";
import Database from "../../struct/db/Database";
import DatabaseProvider from "../../struct/db/DatabaseProvider";
import AnniversaryRolesService from "../../services/AnniversaryRolesService";
import HentaiService from "../../services/HentaiService";
import PackageJSON from "../Interfaces/Common/PackageJSON";
import { MoneyService } from "../../services/MoneyService";

export default interface IKaikiClient {
	anniversaryService: AnniversaryRolesService;
	botSettings: DatabaseProvider;
	cache: KaikiCache;
	connection: Pool;
	dadBotChannels: DatabaseProvider;
	guildsDb: DatabaseProvider;
	money: MoneyService;
	orm: PrismaClient;
	db: Database;
	owner: User;
	package: PackageJSON;
	hentaiService: HentaiService;
}
