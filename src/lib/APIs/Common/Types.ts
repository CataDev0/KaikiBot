import InteractionsImageData from "../../Interfaces/Common/InteractionsImageData";
import KawaiiAPI from "../KawaiiAPI";
import NekosLife from "../nekos.life";
import PurrBot from "../PurrBot";
import CataWaifuMoe from "../CataWaifu";
import NekosBest from "../NekosBest";

export type ImageAPIEndPointTypes<T extends string> = {
	[index in T]: InteractionsImageData;
};

export interface ImageAPIOptions<T extends string> {
	endPointData: ImageAPIEndPointTypes<T>;
	url: (endPoint: T, nsfw?: boolean) => string;
	objectIndex: string | string[];
	token?: string | undefined;
}

export type ClientImageAPIs = {
	KawaiiAPI: KawaiiAPI;
	NekosLife: NekosLife;
	PurrBot: PurrBot;
	CataWaifu: CataWaifuMoe;
	NekosBest: NekosBest;
};

export type APIs = keyof ClientImageAPIs;

