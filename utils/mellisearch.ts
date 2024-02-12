import { MeiliSearch } from "meilisearch";

const searchClient = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILI_HOST as string,
  apiKey: process.env.NEXT_PUBLIC_MEILI_SEARCH_KEY,
});

// update settings to search by name attribute
searchClient.getIndex("users").then((index) => {
  if (index.uid !== "users") {
    searchClient.index("users").updateSettings({
      searchableAttributes: ["name"],
      sortableAttributes: ["name"],
    });
  }
}).catch(_ => console.log());

export default searchClient;
