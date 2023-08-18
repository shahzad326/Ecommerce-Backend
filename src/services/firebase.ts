import admin, { ServiceAccount } from "firebase-admin";

const serviceAccountConfig: ServiceAccount = require("./firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountConfig),
});

export default admin;
