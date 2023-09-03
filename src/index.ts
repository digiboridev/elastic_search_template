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

    // Test multiparameter filter with location
    const interestPersonsNearby = await search.matchByInterestNearby({
      interests: ["hiking"],
      // interests: ["swimming"],
      // interests: ["smoking", "drinking"],
      location: {
        lat: 20.377,
        lon: 1.539,
      },
      // distanceKm: 1000
      // distanceKm: 10000,
      distanceKm: 100000,
    });

    console.log(interestPersonsNearby);

    // Test text search
    const foundedByTextPersons = await search.searchPersons({
      query: "hiking",
      // query: "security",
      // query: "smoking artur",
      // query: "gangsta poop",
    });

    console.log(foundedByTextPersons);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
