import jsonServer from "json-server";
import {
  getFromApi,
  sendDeleteToApi,
  sendPostToApi,
  getPath,
  getQuery,
} from "./api-helper.js";

const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const v1Router = jsonServer.router("v1.json");

const addHydra = (data, path, query) => {
  if (Array.isArray(data)) {
    // Custom pagination.
    const { page = 1, itemsPerPage = 10 } = query;
    const lastPage = Math.ceil(data.length / itemsPerPage);
    const nextPage = page + 1;

    const currentItems = [];
    for (
      let i = (page - 1) * itemsPerPage;
      i < Math.min(page * itemsPerPage, data.length);
      i += 1
    ) {
      currentItems.push(data[i]);
    }

    const itemsPerPageQuery =
      itemsPerPage !== 10 ? `&itemsPerPage=${itemsPerPage}` : "";

    const result = {
      "@id": path,
      "@type": "hydra:Collection",
      "hydra:member": currentItems,
      "hydra:totalItems": data.length,
      "hydra:view": {
        "@id": `${path}`,
        "@type": "hydra:PartialCollectionView",
        "hydra:first": `${path}?page=1${itemsPerPageQuery}`,
        "hydra:last": `${path}?page=${lastPage}${itemsPerPageQuery}`,
      },
    };

    // Add next if this is not the last page.
    if (lastPage > page) {
      result["hydra:view"][
        "hydra:next"
      ] = `${path}?page=${nextPage}${itemsPerPageQuery}`;
    }

    return result;
  }
  return data;
};

const hydraRender = (req, res) => {
  const { data } = res.locals;
  let newData;

  // This modifies the response from /v1/slidesPlaylist to match /v1/playlists/:playlistId/slides
  if (req.originalUrl.startsWith("/v1/slidesPlaylist?_expand=slide")) {
    newData = data.map((sp) => sp.slide);
  }
  // This modifies the response from /v1/slidesPlaylist to match /v1/slides/:slideId/playlists
  else if (req.originalUrl.startsWith("/v1/slidesPlaylist?_expand=playlist")) {
    newData = data.map((sp) => sp.playlist);
  }
  // This modifies the response from /v1/playlistScreenRegion to match /v1/screens/:screenId/regions/:regionId
  else if (
    req.originalUrl.startsWith("/v1/playlistScreenRegion?_expand=playlist")
  ) {
    newData = data.map((psr) => psr.playlist);
  }
  // This modifies the response from /v1/playlistScreenRegion to match /v1/playlists/:playlistId/screens
  else if (
    req.originalUrl.startsWith("/v1/playlistScreenRegion?_expand=screen")
  ) {
    newData = data.map((psr) => psr.screen);
  }
  // Not a custom request.
  else {
    newData = addHydra(data, getPath(req), getQuery(req));
  }

  res.jsonp(newData);
};

// Custom routes.

server.get("/v1/slides/:slideId/playlists", (req, res) => {
  const path = getPath(req);
  getFromApi(
    `/v1/slidesPlaylist?_expand=playlist&slideId=${req.params.slideId}`
  )
    .then((data) => {
      const hydraData = addHydra(data, path, req.query);
      res.send(hydraData);
    })
    .catch((e) => res.send(e));
});

server.get("/v1/playlists/:playlistId/slides", (req, res) => {
  const path = getPath(req);
  getFromApi(
    `/v1/slidesPlaylist?_expand=slide&playlistId=${req.params.playlistId}`
  )
    .then((data) => {
      const hydraData = addHydra(data, path, req.query);
      res.send(hydraData);
    })
    .catch((e) => res.send(e));
});

server.get("/v1/playlists/:playlistId/screens", (req, res) => {
  const path = getPath(req);
  getFromApi(
    `/v1/playlistScreenRegion?_expand=screen&playlistId=${req.params.playlistId}`
  )
    .then((data) => {
      const hydraData = addHydra(data, path, req.query);
      res.send(hydraData);
    })
    .catch((e) => res.send(e));
});

server.put(
  "/v1/screens/:screenId/region/:regionId/playlists/:playlistId",
  (req, res) => {
    sendPostToApi("/v1/playlistScreenRegion/", {
      playlistId: req.params.playlistId,
      screenId: req.params.screenId,
      region: req.params.regionId,
    })
      .then(() => {
        res.send(201);
      })
      .catch((e) => res.send(e));
  }
);

server.delete(
  "/v1/screens/:screenId/region/:regionId/playlists/:playlistId",
  (req, res) => {
    getFromApi(
      `/v1/playlistScreenRegion?screenId=${req.params.screenId}&region=${req.params.regionId}&playlistId=${req.params.playlistId}`
    )
      .then((data) => {
        if (data["hydra:member"]?.length > 0) {
          sendDeleteToApi(
            `/v1/playlistScreenRegion/${data["hydra:member"][0].id}`
          )
            .then(res.send(204))
            .catch((e) => res.send(e));
        } else {
          res.send(404);
        }
      })
      .catch((e) => res.send(e));
  }
);

server.get("/v1/screens/:screenId/region/:regionId/playlists", (req, res) => {
  const path = getPath(req);
  getFromApi(
    `/v1/playlistScreenRegion?_expand=playlist&screenId=${req.params.screenId}&region=${req.params.regionId}`
  )
    .then((data) => {
      const hydraData = addHydra(data, path, req.query);
      res.send(hydraData);
    })
    .catch((e) => res.send(e));
});

server.put("/v1/playlists/:playlistId/slide/:slideId", (req, res) => {
  // @TODO: Avoid duplicates.

  sendPostToApi("/v1/slidesPlaylist", {
    playlistId: req.params.playlistId,
    slideId: req.params.slideId,
  })
    .then(() => {
      res.send(201);
    })
    .catch((e) => res.send(e));
});

server.delete("/v1/playlists/:playlistId/slide/:slideId", (req, res) => {
  getFromApi(
    `/v1/slidesPlaylist?playlistId=${req.params.playlistId}&slideId=${req.params.slideId}`
  )
    .then((data) => {
      if (data.length > 0) {
        sendDeleteToApi(`/v1/slidesPlaylist/${data[0].id}`)
          .then(res.send(204))
          .catch((e) => res.send(e));
      } else {
        res.send(404);
      }
    })
    .catch((e) => res.send(e));
});

v1Router.render = hydraRender;
server.use(middlewares);
server.use("/v1", v1Router);

server.listen(3000, () => {});
