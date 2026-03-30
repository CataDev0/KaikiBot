import { Collection } from "discord.js";

export abstract class Provider {
    public items: Collection<string, any>;

    protected constructor() {
        /**
		 * Cached entries.
		 * @type {Collection<string, Object>}
		 */
        this.items = new Collection();
    }

	/**
	 * Initializes the provider.
	 * @abstract
	 * @returns {Promise<void>}
	 */
	abstract init(): Promise<void>;

	/**
	 * Gets a value.
	 * @abstract
	 * @param {string} id - ID of entry.
	 * @param {string} key - The key to get.
	 * @param {any} [defaultValue] - Default value if not found or null.
	 * @returns {any}
	 */
	abstract get<T>(id: string, key: string, defaultValue?: any): T;

	/**
	 * Sets a value.
	 * @abstract
	 * @param {string} id - ID of entry.
	 * @param {string} key - The key to set.
	 * @param {any} value - The value.
	 * @returns {any}
	 */
	abstract set(
		id: string,
		key: string,
		value: any
	): Promise<any>;

	/**
	 * Deletes a value.
	 * @abstract
	 * @param {string} id - ID of entry.
	 * @param {string} key - The key to delete.
	 * @returns {any}
	 */
	abstract delete(id: string, key: string): any;

	/**
	 * Clears an entry.
	 * @abstract
	 * @param {string} id - ID of entry.
	 * @returns {any}
	 */
	abstract clear(id: string): any;
}

/**
 * Options to use for providers.
 */
export type ProviderOptions = {
	idColumn: string | "Id";
	dataColumn?: string;
};
