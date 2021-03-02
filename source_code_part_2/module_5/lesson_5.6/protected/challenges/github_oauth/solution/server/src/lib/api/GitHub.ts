import fetch from "node-fetch";
import { RequestInit } from "node-fetch";

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
    /* eslint-disable @typescript-eslint/camelcase */
    const { access_token } = await request(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          client_id: process.env.GH_CLIENT_ID,
          client_secret: process.env.GH_CLIENT_SECRET,
          code
        })
      }
    );

    if (!access_token) throw new Error("missing access_token");

    const { data } = await request("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `token ${access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: VIEWER_QUERY })
    });

    if (!data || !data.viewer) throw new Error("!viewer");

    return { user: { ...data.viewer } };
    /* eslint-enable @typescript-eslint/camelcase */
  }
};
