const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,  //so each post have users id who created that post
    ref: "user"
  },
  title: String,
  description: String,
  image: String,
});


module.exports = mongoose.model("post", postSchema);