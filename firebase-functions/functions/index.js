//usar firebase setup:emulators:firestore en la consola para descargar emuladores
//luego firebase emulators:start para iniciarlos
const functions = require('firebase-functions');
const { authUser } = require('./util/auth');
const { db } = require('./util/admin');
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

const {
  getAllScreams,
  getOneScream,
  createScream,
  commentOnScream,
  likeScream,
  unlikeScream,
  deleteScream,
} = require('./handlers/screams');

const {
  signUp,
  signIn,
  uploadImage,
  addUserDetails,
  getAuthUserDetails,
  getUserDetails,
} = require('./handlers/users');

//screams
app.get('/screams', getAllScreams);
app.post('/scream', authUser, createScream);
app.get('/scream/:screamId', getOneScream);
app.delete('/scream/:screamId', authUser, deleteScream);
app.get('/scream/:screamId/like', authUser, likeScream);
app.get('/scream/:screamId/unlike', authUser, unlikeScream);
app.post('/scream/:screamId/comment', authUser, commentOnScream);

//user
app.post('/user/signup', signUp);
app.post('/user/login', signIn);
app.post('/user/image', authUser, uploadImage);
app.post('/user', authUser, addUserDetails);
app.get('/user', authUser, getAuthUserDetails);
app.get('/user/:handle', getUserDetails);

exports.api = functions.https.onRequest(app);
