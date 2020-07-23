const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://social-ape-daa68.firebaseio.com",
    storageBucket: "social-ape-daa68.appspot.com"
});
const db = admin.firestore();

module.exports = {
    admin,
    db
};