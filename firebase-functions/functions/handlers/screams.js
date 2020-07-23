const { db } = require('../util/admin');

exports.getAllScreams = async (req, res) => {
  try {
    const data = await db
      .collection('screams')
      .orderBy('createdAt', 'desc')
      .get();
    let screams = [];
    data.forEach(doc =>
      screams.push({
        screamId: doc.id,
        ...doc.data()
      })
    );
    return res.status(200).json(screams);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getOneScream = async (req, res) => {
  try {
    let screamData = {};
    const doc = await db.doc(`/screams/${req.params.screamId}`).get();
    if (!doc.exists) return res.status(404).json({ error: 'Scream not found' });

    screamData = doc.data();
    screamData.screamId = doc.id;
    screamData.comments = [];

    const data = await db
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .where('screamId', '==', req.params.screamId)
      .get();

    data.forEach(doc => screamData.comments.push(doc.data()));
    return res.status(200).json(screamData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.code });
  }
};

exports.createScream = async (req, res) => {
  if (!req.body.body)
    return res.status(400).json({ comment: `Can't be empty` });

  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    createdAt: new Date().toISOString(),
    userImage: req.user.imageUrl,
    likeCount: 0,
    commentCount: 0
  };

  try {
    const doc = await db.collection('screams').add(newScream);
    const resScream = newScream;
    resScream.screamId = doc.id;
    return res.json(resScream);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

exports.commentOnScream = async (req, res) => {
  if (req.body.body.trim() === '')
    return res.status(400).json({ comment: 'Must not be empty' });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };

  try {
    const doc = await db.doc(`/screams/${req.params.screamId}`).get();
    if (!doc.exists) return res.status(404).json({ error: 'Scream not found' });

    await doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    await db.collection('comments').add(newComment);
    return res.status(200).json(newComment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

exports.likeScream = async (req, res) => {
  /* It's more efficient to spread the propierties of a document
    across different collections instead of keeping everything in the 
    same file, because if we don't, every time we need a propierty
    we would have to query the whole file, making the process very slow. */

  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', req.user.handle)
    .where('screamId', '==', req.params.screamId)
    .limit(1);

  try {
    const screamDocument = await db
      .doc(`/screams/${req.params.screamId}`)
      .get();
    if (screamDocument.exists) {
      let screamData = screamDocument.data();
      screamData.screamId = screamDocument.id;
      const data = await likeDocument.get();
      if (data.empty) {
        await db.collection('likes').add({
          screamId: req.params.screamId,
          userHandle: req.user.handle
        });
        screamData.likeCount++;
        await screamDocument.ref.update({ likeCount: screamData.likeCount });
        return res.status(200).json(screamData);
      } else return res.status(400).json({ error: 'Scream already liked' });
    } else return res.status(404).json({ error: 'Scream not found' });
  } catch (err) {
    console.log(err);
    res.status(400).json(err.message);
  }
};

exports.unlikeScream = async (req, res) => {
  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', req.user.handle)
    .where('screamId', '==', req.params.screamId)
    .limit(1);

  try {
    const screamDocument = await db
      .doc(`/screams/${req.params.screamId}`)
      .get();
    if (screamDocument.exists) {
      let screamData = screamDocument.data();
      screamData.screamId = screamDocument.id;
      const data = await likeDocument.get();
      if (data.empty)
        return res.status(400).json({ error: 'Scream not liked' });
      else {
        await db.doc(`/likes/${data.docs[0].id}`).delete();
        screamData.likeCount--;
        await screamDocument.ref.update({ likeCount: screamData.likeCount });
        return res.status(200).json(screamData);
      }
    } else return res.status(404).json({ error: 'Scream not found' });
  } catch (err) {
    console.log(err);
    res.status(400).json(err.message);
  }
};

exports.deleteScream = async (req, res) => {
  const document = db.doc(`/screams/${req.params.screamId}`);

  try {
    const doc = await document.get();
    if (!doc.exists) return res.status(404).json({ error: 'Scream not found' });
    if (doc.data().userHandle !== req.user.handle)
      return res.status(403).json({ error: 'Unauthorized' });
    else {
      await document.delete();
      res.status(200).json({ message: 'Scream deleted successfully' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.code });
  }
};
