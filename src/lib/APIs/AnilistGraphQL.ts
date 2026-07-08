// Here we define our query as a multi-line string

import { Message } from "discord.js";
import KaikiEmbeds from "../Kaiki/KaikiEmbeds";

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

    static characterQuery = `
query ($search: String) {
  Character(search: $search) {
    image {
      medium
    }
  }
}
`;

    static async fetchCharacterImage(name: string): Promise<string | null> {
        try {
            const res = await fetch("https://graphql.anilist.co", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    query: AnilistGraphQL.characterQuery,
                    variables: { search: name },
                }),
            });
            const json = await AnilistGraphQL.handleResponse(res);
            return (json?.data?.Character?.image?.medium as string) ?? null;
        }
        catch {
            return null;
        }
    }

    static async handleResponse(response: {
    json: () => Promise<any>;
    ok: any;
  }) {
        const json = await response.json();
        return await (response.ok ? json : Promise.reject(json));
    }

    static handleError = async (message: Message, error: any) => {
        if (error) {
            console.error(error);
        }
        
        let errorMessage = "No data received";
        // Check if the error object contains a 403 status (common in Anilist GraphQL rejection JSON)
        if (error && (error.status === 403 || (error.errors && error.errors.some((e: any) => e.status === 403)))) {
            errorMessage = `\`\`\`json\n${JSON.stringify(error.errors[0]?.message, null, 2)}\n\`\`\``;
        }

        await message.reply({ embeds: [KaikiEmbeds.embedFail(message, errorMessage)] });
    };
}
