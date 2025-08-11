if (!process.env.CLIENT_ID_DEV || !process.env.CLIENT_SECRET_DEV || !process.env.TOKEN_ENDPOINT_DEV) {
  throw new Error("Environment variables CLIENT_ID_DEV, CLIENT_SECRET_DEV, and TOKEN_ENDPOINT_DEV must be set.");
}

module.exports = {
  clientId: process.env.CLIENT_ID ,
  clientSecret: process.env.CLIENT_SECRET,
  tokenEndpoint: process.env.TOKEN_ENDPOINT ,
  tokenFile: "./token.json"
};