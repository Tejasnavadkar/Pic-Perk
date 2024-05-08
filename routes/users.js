const mongoose = require('mongoose');
// const passport = require('passport');
const plm = require('passport-local-mongoose')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URL);


const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  passport: String,
  profileImage: String,
  contact: Number,
  boards:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "board"
    }
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post"
    }
  ]
});

userSchema.plugin(plm); // now we can use serialize and deserialzeuser

module.exports = mongoose.model("user",userSchema);


// const app = require('../app')
// const cors = require('cors')
// const corsConfig = {
//     origin:"*",
//     credential: true,
//     methods:["GET","POST","PUT","DELETE"],
// };
// app.options("",cors(corsConfig));
// app.use(cors(corsConfig));
