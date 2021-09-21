# display-api-mock

Api mock for OS2Display based on json-server: https://github.com/typicode/json-server.

## Setup

```
docker-compose up -d
docker-compose run json-server npm install
docker-compose restart
docker-compose open
```

## Adding to json-server

To add a new fixture that can be loaded in the client do the following:

Add a new screen to v1.json, replacing [NEXT_ID] with the next unique id:
```
{
    "id": "497f6eca-6276-1596-bfeb-53ceb40000[NEXT ID]",
    "@context": "/contexts/Screen",
    "@id": "/v1/screens/497f6eca-6276-1596-bfeb-53ceb40000[NEXT ID]",
    "title": "Screen Fixture [#] - [Fixture name],
    "description": "[Describe screen]",
    "size": 50,
    "dimensions": {
        "width": 1920,
        "height": 1080
    },
    "layout": "/v1/layouts/497f6ecf-642-4883-cfeb-53cbf3bf82a0",
    "location": "-",
    "regions": [
        "/v1/playlistScreenRegion?_expand=playlist&screenId=497f6eca-6276-1596-bfeb-53ceb40000[NEXT ID]&region=region1"
    ],
    "inScreenGroups": "/v1/screens/497f6eca-6276-1596-bfeb-53ceb40000[NEXT ID]/groups",
    "modified": "2021-09-21T14:02:00Z",
    "created": "2021-07-21T10:25:00Z",
    "modifiedBy": "Jens Jensen",
    "createdBy": "Ole Olesen"
}
```

Add a new playlist to v1.json, replacing [NEXT_ID] with the next unique id:

```
{
    "id": "29ff6eca-8778-6789-bfeb-53e4bf0000[NEXT_ID]",
    "@context": "/contexts/playlist",
    "@id": "/v1/playlists/29ff6eca-8778-6789-bfeb-53e4bf0000[NEXT_ID]",
    "title": "Playlist - [Name of fixture]",
    "description": "This is a fixture playlist",
    "modified": "2021-09-21T17:32:28Z",
    "created": "2021-09-21T17:00:01Z",
    "modifiedBy": "Jens Jensen",
    "createdBy": "Ole Olesen",
    "slides": "/v1/slidesPlaylist?_expand=slide&playlistId=29ff6eca-8778-6789-bfeb-53e4bf0000[NEXT_ID]",
    "onScreens": "/v1/playlists/29ff6eca-8778-6789-bfeb-53e4bf0000[NEXT_ID]/screens",
    "published": {
        "from": "2021-09-21T17:00:01Z",
        "to": "2021-07-22T17:00:01Z"
    }
}
```

Add a new slide to v1.json, replacing [NEXT_ID] with the next unique id and [TEMPLATE_ID] with the id of the template:

```
{
    "id": "a97f6ec4-5278-4993-bfeb-53cded0000[NEXT_ID]",
    "@context": "/contexts/Slide",
    "@id": "/v1/slides/a97f6ec4-5278-4993-bfeb-53cded0000[NEXT_ID]",
    "title": "image-text 1",
    "description": "This is the first slide named one",
    "modified": "2012-09-03T12:21:56Z",
    "created": "2021-09-01T10:04:00Z",
    "modifiedBy": "Ole Olesen",
    "createdBy": "Jens Jensen",
    "template": {
        "@id": "/v1/templates/[TEMPLATE_ID]",
        "options": []
    },
    "onScreens": "/v1/screens?slideId=a97f6ec4-5278-4993-bfeb-53cded0000[NEXT_ID]",
    "onPlaylists": "/v1/playlists?slideId=a97f6ec4-5278-4993-bfeb-53cded0000[NEXT_ID]",
    "duration": 5000,
    "published": 1622555123,
    "content": {
        [CONTENT_FOR_SLIDE]
    }
}
```

If this is a new template add a new template to v1.json, replacing [NEXT_ID] with the next unique id:

```
{
    "id": "457d6ecb-6378-4299-bfcb-53cbaaaa6f[NEXT_ID]",
    "@id": "/v1/template/457d6ecb-6378-4299-bfcb-53cbaaaa6f[NEXT_ID]",
    "templateKey": "template-[UNIQUE_TEMPLATE_KEY]",
    "title": "[TEMPLATE_NAME]",
    "description": "[TEMPLATE_DESCRIPTION]",
    "modified": "2021-09-03T10:04:59Z",
    "created": "2021-08-21T11:22:00Z",
    "modifiedBy": "Jens Jensen",
    "createdBy": "Ole Olensen",
    "icon": "http://templates.itkdev.dk/image/icon.png",
    "resources": {
        "admin": "http://templates.itkdev.dk/image/form.json",
        "schema": "http://templates.itkdev.dk/image/schema.json",
        "component": "http://templates.itkdev.dk/image/image.js",
        "assets": [
            {
                "type": "css",
                "url": "http://templates.itkdev.dk/image/image.css"
            }
        ],
        "options": {
            "fade": true
        },
        "content": {}
    }
}
```

Next link the slide with the playlist by adding to slidesPlaylist of v1.json:

```
{
    "playlistId": "[PLAYLIST_ID]",
    "slideId": "[SLIDE_ID]"
},
```

Next link the playlist to a region of the screen by adding to playlistScreenRegion of v1.json:

```
{
    "playlistId": "[PLAYLIST_ID]",
    "screenId": "[SCREEN_ID]",
    "region": "[REGION_ID]"
}
```

If the layout used for the screen is "/v1/layouts/497f6ecf-642-4883-cfeb-53cbf3bf82a0" the name of the region is "region1".

If a new screen layout is needed, add to the layouts of v1.json in the same way as with the other entities.
