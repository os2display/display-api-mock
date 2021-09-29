import fetch from 'node-fetch';
import jsonServer from 'json-server';

const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const v1Router = jsonServer.router('v1.json');

const hydraRender = (req, res) => {
  let { data } = res.locals;

  // This modifies the response from /v1/slidesPlaylist to match /v1/playlists/:playlistId/slides
  if (req.originalUrl.startsWith('/v1/slidesPlaylist?_expand=slide')) {
    data = data.map((sp) => sp.slide);
  }

  // This modifies the response from /v1/slidesPlaylist to match /v1/slides/:slideId/playlists
  if (req.originalUrl.startsWith('/v1/slidesPlaylist?_expand=playlist')) {
    data = data.map((sp) => sp.playlist);
  }

  // This modifies the response from /v1/playlistScreenRegion to match /v1/screens/:screenId/regions/:regionId
  if (req.originalUrl.startsWith('/v1/playlistScreenRegion?_expand=playlist')) {
    data = data.map((psr) => psr.playlist);
  }

  // This modifies the response from /v1/playlistScreenRegion to match /v1/playlists/:playlistId/screens
  if (req.originalUrl.startsWith('/v1/playlistScreenRegion?_expand=screen')) {
    data = data.map((psr) => psr.screen);
  }

  if (Array.isArray(data)) {
    const path = req.originalUrl;

    res.jsonp({
      '@id': path,
      '@type': 'hydra:Collection',
      'hydra:member': data,
      'hydra:totalItems': data.length,
      'hydra:view': {
        '@id': `${path}`,
        '@type': 'hydra:PartialCollectionView',
        'hydra:first': `${path}`,
        'hydra:last': `${path}`,
        'hydra:next': `${path}`,
      },
    });
  } else {
    res.jsonp(data);
  }
};

server.use('/v1/slides/:slideId/playlists', (req, res) => {
  getFromApi(`v1/slidesPlaylist?_expand=playlist&slideId=${req.params.slideId}`).then(
    (data) => res.send(data)
  ).catch((e) => {
    console.error(e)
  })
});

server.use('/v1/playlists/:playlistId/slides', (req, res) => {
  getFromApi(`v1/slidesPlaylist?_expand=slide&playlistId=${req.params.playlistId}`).then(
    (data) => res.send(data)
  ).catch((e) => {
    console.error(e)
  })
});

server.use('/v1/playlists/:playlistId/screens', (req, res) => {
  getFromApi(`/v1/playlistScreenRegion?_expand=screen&playlistId=${req.params.playlistId}`).then(
    (data) => res.send(data)
  ).catch((e) => {
    console.error(e)
  })
});

server.put('/v1/screens/:screenId/region/:regionId/playlists/:playlistId', (req, res) => {
  sendPostToApi('/v1/playlistScreenRegion/', {
    "playlistId": req.params.playlistId,
    "screenId": req.params.screenId,
    "region": req.params.regionId
  }).then(res.send(201)).catch((e) => console.error(e));
});

server.delete('/v1/screens/:screenId/region/:regionId/playlists/:playlistId', (req, res) => {
  console.log(req.method);
  res.send('@TODO: Implement DELETE');
});

server.use('/v1/screens/:screenId/region/:regionId/playlists', (req, res) => {
  getFromApi(`/v1/playlistScreenRegion?_expand=playlist&screenId=${req.params.screenId}&region=${req.params.regionId}`).then(
    (data) => res.send(data)
  ).catch((e) => {
    console.error(e)
  })
});

// @TODO: Handle PUT and DELETE.
server.use('/v1/playlists/:playlistId/slide/:slideId', (req, res) => {
  res.send('@TODO: Implement PUT and DELETE');
});

async function getFromApi(path) {
  const response = await fetch(`http://nginx/api/${path}`);
  return await response.json();
}

async function sendPostToApi(path) {
  const response = await fetch(`http://nginx/api/${path}`, {
    method: 'POST'
  });
  return await response.json();
}

async function sendPutToApi(path) {
  const response = await fetch(`http://nginx/api/${path}`, {
    method: 'PUT'
  });
  return await response.json();
}

async function sendDeleteToApi(path) {
  const response = await fetch(`http://nginx/api/${path}`, {
    method: 'DELETE'
  });
  return await response.json();
}

v1Router.render = hydraRender;

server.use(middlewares);
server.use('/v1', v1Router);

server.listen(3000, () => {});
