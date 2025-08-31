const express = require("express");
const router = express.Router();
const Roadmap = require("../models/Roadmap");

router.get("/", async (req, res) => {
  const roadmaps = await Roadmap.find().populate("courses");
  res.json(roadmaps);
});

router.get("/:id", async (req, res) => {
  const roadmap = await Roadmap.findById(req.params.id).populate("courses");
  res.json(roadmap);
});

module.exports = router; 