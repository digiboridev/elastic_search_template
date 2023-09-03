## Elastic search template
Template for setup of elastic search cluster with Docker compose and typescript client for nodejs. 
Implements basic needs for search and indexing of documents.

#### Main purpose
* Multi-match full text search
* Geo search with distance filter
* Compound queries
* Pagination
* Sorting

#### Building ES containers
```
docker compose build
```


#### Start ES server
```
docker compose up
```

#### Run client example
```
npm run build & npm run start
```




