import fetch from "node-fetch";
import { RequestInit } from "node-fetch";

// the following is the GraphQL query to obtain viewer info from GitHub's API v4
// https://developer.github.com/v4/query/
const VIEWER_QUERY = `{
  viewer {
    id
    login
    avatarUrl
    email
  }
}`;

const request = async (url: string, params: RequestInit) => {
  const res = await fetch(url, params);
  if (res.status < 200 || res.status >= 300) throw new Error("fetch failed");
  return res.json();
};

export const GitHub = {
  authUrl: `https://github.com/login/oauth/authorize?client_id=${process.env.GH_CLIENT_ID}&scope=read:user`,
  logIn: async (code: string) => {
    // perform GitHub log in here
  }
};
