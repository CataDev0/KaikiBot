// Here we define our query as a multi-line string
// Storing it in a separate .graphql/.gql file is also possible

import { container } from "@sapphire/pieces";
import { Message } from "discord.js";
import KaikiEmbeds from "../Kaiki/KaikiEmbeds";
import { err } from "@sapphire/framework";

export default class AnilistGraphQL {
  static aniQuery = `
query ($page: Int, $perPage: Int, $search: String, $type: MediaType) {
          Page(page: $page, perPage: $perPage) {
            media(search: $search, type: $type) {
              idMal
              title {
                romaji
                english
              }
              coverImage {
                large
                color
              }
              description
              bannerImage
              format
              status
              type
              meanScore
              startDate {
                year
                month
                day
              }
              endDate {
                year
                month
                day
              }
              duration
              source
              episodes
              chapters
              volumes
              studios {
                nodes {
                  name
                }
              }
              synonyms
              genres
              trailer {
                id
                site
              }
              externalLinks {
                site
                url
              }
              siteUrl
              isAdult
              nextAiringEpisode {
                episode
                timeUntilAiring
              }
            }
          }
        }
`;

  static mangaQuery = `
query ($page: Int, $perPage: Int, $search: String, $type: MediaType) {
          Page(page: $page, perPage: $perPage) {
            media(search: $search, type: $type) {
              idMal
              title {
                romaji
                english
              }
              coverImage {
                large
                color
              }
              description
              bannerImage
              format
              status
              type
              meanScore
              startDate {
                year
                month
                day
              }
              endDate {
                year
                month
                day
              }
              duration
              source
              episodes
              chapters
              volumes
              synonyms
              genres
              trailer {
                id
                site
              }
              externalLinks {
                site
                url
              }
              siteUrl
              isAdult
              nextAiringEpisode {
                episode
                timeUntilAiring
              }
            }
          }
        }
`;

  static async handleResponse(response: {
    json: () => Promise<any>;
    ok: any;
  }) {
    const json = await response.json();
    return await (response.ok ? json : Promise.reject(json));
  }

  static handleError = async (message: Message, error: never) => {
    AnilistGraphQL.logError(error);
    await message.reply({ embeds: [KaikiEmbeds.embedFail(message, "No data received")] });
    throw new Error(error);
  };
  static logError = (error: never) => container.logger.error(error);
}
