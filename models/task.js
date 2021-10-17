const mongoose = require("mongoose"); // Node Tool for MongoDB
mongoose.Promise = global.Promise; // Configure Mongoose Promises
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    required: true,
    ref: "User",
  },
});

const taskSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  startDate: Date,
  endDate: Date,
  note: String,
  users: [
    {
      type: Schema.ObjectId,
      ref: "User",
    },
  ],
  parentId: String,
  projectAdmin: {
    type: Schema.ObjectId,
    ref: "User",
  },
  todos: {
    name: String,
    order: String,
    users: [
      {
        type: Schema.ObjectId,
        ref: "User",
      },
    ],
    title: Boolean,
    checked: Boolean,
    note: String,
  },
});

module.exports = mongoose.model("Task", taskSchema);
