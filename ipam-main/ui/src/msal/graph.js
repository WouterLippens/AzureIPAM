import { graphConfig } from "./authConfig";

/**
 * Attaches a given access token to a Microsoft Graph API call. Returns information about the user
 */
export async function callMsGraph(accessToken) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(graphConfig.graphMeEndpoint, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

export async function callMsGraphUsers(accessToken) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(graphConfig.graphUsersEndpoint, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

export async function callMsGraphUsersFilter(accessToken, nameFilter = "") {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  var endpoint = graphConfig.graphUsersEndpoint + "?";

  headers.append("Authorization", bearer);
  headers.append("ConsistencyLevel", "eventual");

  const options = {
    method: "GET",
    headers: headers,
  };

  if (nameFilter !== "") {
    endpoint += `$filter=startsWith(userPrincipalName,'${nameFilter}') OR startsWith(displayName, '${nameFilter}')&`;
  }

  endpoint += "$orderby=displayName&$count=true";

  return fetch(endpoint, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

// export async function callMsGraphUsersFilter(accessToken, search) {
//   const headers = new Headers();
//   const bearer = `Bearer ${accessToken}`;

//   headers.append("Authorization", bearer);
//   headers.append("ConsistencyLevel", "eventual");

//   const options = {
//     method: "GET",
//     headers: headers,
//   };

//   let filter = `?$filter=startsWith(userPrincipalName,'${search}') OR startsWith(displayName, '${search}')`

//   let sort = "&$orderby=displayName&$count=true";

//   return fetch((graphConfig.graphUsersEndpoint + filter + sort), options)
//     .then((response) => response.json())
//     .catch((error) => console.log(error));
// }

export async function callMsGraphPhoto(accessToken) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);
  headers.append("Content-Type", "image/jpeg");

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(graphConfig.graphMePhotoEndpoint, options)
    .then(response => {
      if(response.ok) {
        return response.blob();
      } else {
        throw new Error("Profile image not found");
      }
    })
    .then((imageBlob) => {
      const imageObjectURL = URL.createObjectURL(imageBlob);

      return imageObjectURL;
    })
    .catch((error) => {
      console.log(error)
    });
}
