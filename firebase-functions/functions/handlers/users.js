const { db, admin } = require('../util/admin');

const { validateSignUpData, validateLoginData, reduceUserDetails } = require('../util/validators');

const firebaseConfig = require('../firebase-config.json');
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

exports.signUp = async (req, res) => {
    const userData = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };
    const { valid, errors } = validateSignUpData(userData);
    if (!valid) return res.status(400).json(errors);

    try {
        const doc = await db.doc(`/users/${userData.handle}`).get();
        if (doc.exists) return res.status(500).json({ error: "Handle already exists." });

        const newUser = await firebase
            .auth()
            .createUserWithEmailAndPassword(userData.email, userData.password);
        const token = await newUser.user.getIdToken();

        const noImg = 'no-img.png';
        const userCredentials = {
            handle: userData.handle,
            email: userData.email,
            createdAt: new Date().toISOString(),
            imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
            userId: newUser.user.uid
        };

        await db.doc(`/users/${userData.handle}`).set(userCredentials);
        return res.status(200).json({ token });
    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ error: err.message });
    }
}

exports.signIn = async (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };
    const { valid, errors } = validateLoginData(user);
    if (!valid) return res.status(400).json(errors);

    try {
        const data = await firebase
            .auth()
            .signInWithEmailAndPassword(user.email, user.password);
        const token = await data.user.getIdToken();
        return res.status(200).json({ token });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
};

exports.uploadImage = (req, res) => {
    const Busboy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');
    const busboy = new Busboy({ headers: req.headers });
    let imageFilename;
    let imageToBeUploaded = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png')
            return res.status(500).json({ error: 'wrong file type submitted' });

        const imageExtension = filename.split('.').pop();
        imageFilename = `${Math.round(Math.random() * 1000000000)}.${imageExtension}`;

        const filepath = path.join(os.tmpdir(), imageFilename);
        imageToBeUploaded = {
            filepath,
            mimetype
        };
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', async () => {
        try {
            await admin.storage().bucket().upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata: { contentType: imageToBeUploaded.mimetype }
            });

            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFilename}?alt=media`;
            await db.doc(`/users/${req.user.handle}`).update({ imageUrl });
            return res.status(200).json({ message: 'image uploaded succesfully' });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: err.code });
        }
    });

    busboy.end(req.rawBody);
};

exports.addUserDetails = async (req, res) => {
    let userDetails = reduceUserDetails(req.body);

    try {
        await db.doc(`/users/${req.user.handle}`).update(userDetails);
        return res.json({ message: 'Details added successfully' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.code });
    }
};

exports.getAuthUserDetails = async (req, res) => {
    let userData = {};
    try {
        const doc = await db.doc(`/users/${req.user.handle}`).get();

        if (doc.exists) {
            userData.credentials = doc.data();
            userData.likes = [];

            const likeData = await db
                .collection('likes')
                .where('userHandle', '==', req.user.handle)
                .get();
            likeData.forEach((doc) => userData.likes.push(doc.data()));
            return res.json(userData);
        }

        else return res.status(404).json({ errror: 'User not found' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.code });
    }
};

exports.getUserDetails = async (req, res) => {
    let userData = {};
    try {
        const doc = await db.doc(`/users/${req.params.handle}`).get();
        if (doc.exists) {
            userData.user = doc.data();
            userData.screams = [];

            const data = await db
                .collection('screams')
                .where('userHandle', '==', req.params.handle)
                .orderBy('createdAt', 'desc')
                .get();

            data.forEach((doc) => {
                userData.screams.push({
                    body: doc.data().body,
                    createdAt: doc.data().createdAt,
                    userHandle: doc.data().userHandle,
                    userImage: doc.data().userImage,
                    likeCount: doc.data().likeCount,
                    commentCount: doc.data().commentCount,
                    screamId: doc.id
                });
            });

            return res.json(userData);

        } else return res.status(404).json({ errror: 'User not found' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.code });
    }
};