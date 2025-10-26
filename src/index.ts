 
import "@sapphire/plugin-logger/register";
// Load extensions
import "./extensions/Discord";
import "./extensions/Sapphire";
import "./struct/ErrorHandler";
import KaikiSapphireClient from "./lib/Kaiki/KaikiSapphireClient";
import "source-map-support/register";
import { config } from "dotenv";

// Load .env
config();

// Start the bot
new KaikiSapphireClient();
