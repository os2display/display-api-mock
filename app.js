import fetch from 'node-fetch';
import jsonServer from 'json-server';

const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const v1Router = jsonServer.router('v1.json');

const hydraRender = (req, res) => {
  let { data } = res.locals;

  // This modifies the response from /v1/playlistScreenRegion to match /v1/screens/:screenId/regions/:regionId
  if (req.originalUrl.startsWith('/v1/playlistScreenRegion')) {
    data = data.map((playlistScreenRegion) => playlistScreenRegion.playlist);
  }

  // This modifies the response from /v1/slidesPlaylist to match /v1/playlists/:playlistId/slides
  if (req.originalUrl.startsWith('/v1/slidesPlaylist')) {
    data = data.map((slidesPlaylist) => slidesPlaylist.slide);
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

async function getFromApi(path) {
  const response = await fetch(`http://nginx/api/${path}`);
  return await response.json();
}

server.use('/v1/playlists/:playlistId/slides', (req, res) => {
  getFromApi(`v1/slidesPlaylist?_expand=slide&playlist=${req.param.playlistId}`).then(
    (data) => res.send(data)
  ).catch((e) => {
    console.error(e)
  })
});

server.use('/v1/screens/:screenId/region/:regionId/playlists', (req, res) => {
  getFromApi(`/v1/playlistScreenRegion?_expand=playlist&screen=${req.params.screenId}&region=${req.params.regionId}`).then(
    (data) => res.send(data)
  ).catch((e) => {
    console.error(e)
  })
});

v1Router.render = hydraRender;

server.use(middlewares);
server.use('/v1', v1Router);

server.listen(3000, () => {});
