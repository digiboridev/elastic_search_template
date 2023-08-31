import { Client } from "@elastic/elasticsearch";
import { Person } from "../entity/person";
import { GeoLocation } from "../entity/location";

export class PersonSearchServiceESImpl {
    private readonly client: Client;
  
    constructor({ url }: { url: string }) {
      this.client = new Client({ node: url });
    }
  
    async createIndex() {
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
  
    async deleteIndex() {
      await this.client.indices.delete({ index: "persons" }).catch(() => {
        console.log("Index does not exist");
      });
    }
  
    async indexPersons(persons: Person[]) {
      await this.client.bulk({
        operations: persons.flatMap((person) => [{ index: { _index: "persons", _id: person.id } }, person]),
      });
    }
  
    async matchInterestedPersonsNearby({
      interests,
      location,
      distanceKm = 10,
    }: {
      interests: string[];
      location: GeoLocation;
      distanceKm?: number;
    }): Promise<Person[]> {
      const result = await this.client.search<Person>({
        index: "persons",
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
  }