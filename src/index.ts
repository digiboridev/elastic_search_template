import { Person } from "./entity/person";
import { PersonSearchServiceESImpl } from "./services/person.search.service";

(async function init() {
  try {
    console.log("Hello Worlds");

    const search = new PersonSearchServiceESImpl({ url: "http://127.0.0.1:9200" });

    await search.deleteIndex();
    await search.createIndex();

    const persons: Person[] = [
      {
        id: "uid1",
        firstName: "John",
        lastName: "Doe",
        interests: ["hiking", "biking", "swimming"],
        age: 32,
        job: "Software Engineer",
        location: {
          lat: 47.377,
          lon: 8.539,
        },
      },
      {
        id: "uid2",
        firstName: "Jane",
        lastName: "Doe",
        interests: ["hiking", "biking", "singing"],
        age: 30,
        job: "Teacher",
        location: {
          lat: 33.37,
          lon: 33.53,
        },
      },
    ];

    await search.indexPersons(persons);

    // Wait for data to be indexed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const hikingPeoplesNearby = await search.matchInterestedPersonsNearby({
      interests: ["swimming"],
      location: {
        lat: 47.377,
        lon: 8.539,
      },
      distanceKm: 10000,
    });

    console.log(hikingPeoplesNearby);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
