import _ from "underscore";
import fetch from "isomorphic-fetch";

export const API_URL = process.env.REACT_APP_API_SERVER_LINK;

export default async function callApi(endpoint, method = "get", body) {
  const api = API_URL + `/v2`;
  let payload = {
    method,
    headers: {
      "X-RS-AUTH-TOKEN": await localStorage.getItem(`accessToken`),
      "Content-Type": "application/json",
    },
  };

  if (_.includes(["post", "put", "patch"], method)) {
    _.extend(payload, { body: JSON.stringify(body) });
  }

  return fetch(`${api}/${endpoint}`, payload)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error(error);
    });
}
