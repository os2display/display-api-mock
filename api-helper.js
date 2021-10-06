import fetch from "node-fetch";
import url from "url";
import querystring from "querystring";

const getPath = (req) => {
  return new url.parse(req.originalUrl).pathname;
};

const getQuery = (req) => {
  const parsedUrl = url.parse(req.originalUrl);
  const newQuery = { ...querystring.parse(parsedUrl.query) };
  if (newQuery.page !== undefined) {
    newQuery.page = parseInt(newQuery.page, 10);
  }
  if (newQuery.itemsPerPage !== undefined) {
    newQuery.itemsPerPage = parseInt(newQuery.itemsPerPage, 10);
  }

  return newQuery;
};

/**
 * Gets from the API.
 *
 * @param {string} path Path to the resource.
 * @returns {object} Json.
 */
async function getFromApi(path) {
  const response = await fetch(`http://nginx/api/${path}`);
  return response.json();
}

/**
 * Posts to the API.
 *
 * @param {string} path Path to the resource.
 * @param {object} data The data to send.
 * @returns {object} Json.
 */
async function sendPostToApi(path, data) {
  const response = await fetch(`http://nginx/api/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Puts to the API.
 *
 * @param {string} path Path to the resource.
 * @returns {object} Json.
 */
async function sendPutToApi(path) {
  const response = await fetch(`http://nginx/api/${path}`, {
    method: "PUT",
  });
  return response.json();
}

/**
 * Deletes to the API.
 *
 * @param {string} path Path to the resource.
 * @returns {object} Json.
 */
async function sendDeleteToApi(path) {
  const response = await fetch(`http://nginx/api/${path}`, {
    method: "DELETE",
  });
  return response.json();
}

export {
  getFromApi,
  sendPutToApi,
  sendDeleteToApi,
  sendPostToApi,
  getPath,
  getQuery,
};
