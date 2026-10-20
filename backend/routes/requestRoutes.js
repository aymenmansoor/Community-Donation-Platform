const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

router.get('/', async (req, res) => {
    try {
        const allRequests = await Request.find().populate('itemId');
        res.json(allRequests);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
    try {
        const newRequest = new Request(req.body);
        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/user/:userId', async (req, res) => {
    const requests = await Request.find({ requesterId: req.params.userId }).populate('itemId');
    res.json(requests);
});

router.get('/donor/:email', async (req, res) => {
    const requests = await Request.find().populate('itemId');
    const filtered = requests.filter(r => r.itemId && r.itemId.donorEmail === req.params.email);
    res.json(filtered);
});

router.put('/:id', async (req, res) => {
    const updated = await Request.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
});

module.exports = router;