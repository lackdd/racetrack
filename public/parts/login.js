const express = require('express');
const router = express.Router();

const accsessKeySafety = process.env.ACCESS_KEY_SAFETY;
const accsessKeyReception = process.env.ACCESS_KEY_RECEPTIONIST;

//Front-desk
router.post('/login', (req, res) => {
    const {accessKey} = req.body;
    console.log("key: " + accsessKeyReception);
    if (accessKey === accsessKeyReception) {
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
})

module.exports = router;
