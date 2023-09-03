import { Client } from "@elastic/elasticsearch";
import { Person } from "../entity/person";
import { GeoLocation } from "../entity/location";

export type MatchNearbyParams = {
  interests: string[];
  location: GeoLocation;
  distanceKm?: number;
  from?: number;
  size?: number;
};

export type SearchParams = {
  query: string;
  from?: number;
  size?: number;
};

export interface PersonSearchService {
  /**
   * Searches persons by interests nearby
   * @param params
   * @returns Promise<Person[]>
   * @throws Error
   * @example
   * const interestPersonsNearby = await search.matchByInterestNearby({
   *  interests: ["hiking"],
   *  location: {
   *    lat: 47.377,
   *    lon: 8.539,
   *  },
   *  distanceKm: 100000,
   * });
   */
  matchByInterestNearby(params: MatchNearbyParams): Promise<Person[]>;

  /**
   * Searches persons by text
   * @param params
   * @returns Promise<Person[]>
   * @throws Error
   * @example
   * const foundedByTextPersons = await search.searchPersons({
   *  query: "hiking",
   * });
   */
  searchPersons(params: SearchParams): Promise<Person[]>;
}

// Elasticsearch implementation
export class PersonSearchServiceESImpl implements PersonSearchService {
  private readonly client: Client;

  constructor({ url }: { url: string }) {
    this.client = new Client({ node: url });
  }

  private async _createIndex() {
    await this.client.indices.create({
      index: "persons",

      body: {
        mappings: {
          properties: {
            id: { type: "keyword" },
            firstName: { type: "text" },
            lastName: { type: "text" },
            interests: { type: "keyword" },
            age: { type: "integer" },
            job: { type: "text" },
            location: { type: "geo_point" },
          },
        },
      },
    });
  }

  private async _deleteIndex() {
    await this.client.indices.delete({ index: "persons" }).catch(() => {
      console.log("Index does not exist");
    });
  }

  async setupIndex(cleanUp: boolean = false) {
    const indexExists: boolean = await this.client.indices.exists({ index: "persons" });
    if (cleanUp && indexExists) await this._deleteIndex();
    if (!indexExists || cleanUp) await this._createIndex();
  }

  async indexPersons(persons: Person[]) {
    await this.client.bulk({
      operations: persons.flatMap((person) => [{ index: { _index: "persons", _id: person.id } }, person]),
    });
  }

  async removePerson(id: string) {
    await this.client.delete({ index: "persons", id: id });
  }

  async matchByInterestNearby({ interests, location, distanceKm = 1, from = 0, size = 10 }: MatchNearbyParams): Promise<Person[]> {
    const result = await this.client.search<Person>({
      index: "persons",
      from: from,
      size: size,
      sort: [
        {
          _geo_distance: {
            location: location,
            order: "desc",
            unit: "km",
            distance_type: "plane",
          },
        },
      ],
      body: {
        query: {
          bool: {
            must: [
              ...interests.map((interest) => ({
                match: {
                  interests: {
                    query: interest,
                  },
                },
              })),
            ],
            filter: {
              geo_distance: {
                distance: `${distanceKm}km`,
                location: location,
              },
            },
          },
        },
      },
    });

    return result.hits.hits.map((hit) => hit._source!);
  }

  async searchPersons({ query, from = 0, size = 10 }: SearchParams): Promise<Person[]> {
    const result = await this.client.search<Person>({
      index: "persons",
      from: from,
      size: size,
      body: {
        query: {
          multi_match: {
            query: query,
            fields: ["firstName", "lastName", "interests", "job"],
          },
        },
      },
    });

    return result.hits.hits.map((hit) => hit._source!);
  }
}
