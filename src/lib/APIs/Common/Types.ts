import InteractionsImageData from "../../Interfaces/Common/InteractionsImageData";
import KawaiiAPI from "../KawaiiAPI";
import NekosLife from "../nekos.life";
import PurrBot from "../PurrBot";
import WaifuCataMoe from "../WaifuCataMoe";
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
	WaifuCataMoe: WaifuCataMoe;
	NekosBest: NekosBest;
};

export type APIs = keyof ClientImageAPIs;

