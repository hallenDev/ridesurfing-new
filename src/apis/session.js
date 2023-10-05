import callApi from "../util/apiCaller";

export const socialLogin = async (social_type, token, email) => {
  return await callApi(`sessions/check_provider.json`, "post", {
    social_type,
    token,
    email,
  });
};

export const getGooglePeople = async (googleId, accessToken) => {
  const url = `https://people.googleapis.com/v1/people/${googleId}?personFields=birthdays,genders&access_token=${accessToken}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};
