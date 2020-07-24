const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://my-thought-cloud.firebaseio.com',
  storageBucket: 'my-thought-cloud.appspot.com',
});
const db = admin.firestore();

module.exports = {
  admin,
  db,
};
