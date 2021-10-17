const Task = require("../models/task");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const {
    name,
    startDate,
    endDate,
    note,
    users,
    parentId,
    todos,
    projectAdmin,
  } = req.body;

  const protask = new Task({
    name,
    startDate,
    endDate,
    note,
    users,
    parentId,
    todos,
    projectAdmin,
  });

  const createProtask = await protask.save();
  res.status(201).json(createProtask);
});

router.put("/:id", async (req, res) => {
  const { name, startDate, endDate, note, users, parentId, todos } = req.body;

  const protask = await Task.findById(req.params.id);

  if (protask) {
    (protask.name = name),
      (protask.startDate = startDate),
      (protask.endDate = endDate),
      (protask.note = note),
      (protask.users = users),
      (protask.parentId = parentId),
      (protask.todos = todos);

    const editProtask = await protask.save();
    res.json(editProtask);

    //Brise usera iz niza usera
    await Task.updateMany(
      { parentId: req.params.id },
      { $set: { users: req.body.users } }
    );
    //Brise usera iz niza usera u todos
    await Task.updateMany(
      { parentId: req.params.id },
      { $set: { "todos.users": req.body.todos.users } }
    );
  } else {
    res.status(404);
    throw new Error("Task/Projekt not found");
  }
});
router.get("/task", async (req, res) => {
  const protask = await Task.find({}).populate("users").populate("todos.users");

  res.json(protask);
});
router.get("/task/:id", async (req, res) => {
  const protask = await Task.findById()
    .populate("users")
    .populate("todos.users");

  res.json(protask);
});

router.delete("/delete/:id", async (req, res) => {
  console.log("delte");
  const protask = await Task.findByIdAndRemove(req.params.id);
  if (protask) {
    if (protask.parentId == "0") {
      console.log("PROJEKT", protask.parentId);
      const tasks = await Task.deleteMany({ parentId: req.params.id });
      res.json({ message: "Projekt  removed" });
    } else {
      console.log("TASK", protask.parentId);
      await protask.remove();
      res.json({ message: "Task removed" });
    }
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

//Dohvacanje svih user-a od projekta/taska
router.get("/getUsersByProject/:id", async (req, res) => {
  const usersByProject = await Task.findById(req.params.id).select("users");
  if (usersByProject) {
    res.json(usersByProject);
  } else {
    res.status(404);
    throw new Error("project not found");
  }
});

module.exports = router;
