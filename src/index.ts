import { PersonSearchServiceESImpl } from "./services/person.search.service";
import { personsDataSet } from "./utils/datasets";

(async function main() {
  try {
    const search = new PersonSearchServiceESImpl({ url: "http://127.0.0.1:9200" });

    // Wipe and recreate index
    await search.deleteIndex();
    await search.createIndex();
    await search.indexPersons(personsDataSet);

    // Wait until index is ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Search for persons with interests
    const interestPeoplesNearby = await search.matchInterestedPersonsNearby({
      // interests: ["hiking"],
      // interests: ["swimming"],
      interests: ["smoking", "drinking"],
      location: {
        lat: 47.377,
        lon: 8.539,
      },
      // distanceKm: 1000
      // distanceKm: 10000,
      distanceKm: 100000,
    });

    console.log(interestPeoplesNearby);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
