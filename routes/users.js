const mongoose = require('mongoose');
// const passport = require('passport');
const plm = require('passport-local-mongoose')


// const connectDB = async () =>{
//   try {
//    const conn = await mongoose.connect("mongodb+srv://tejasnavadkar:tejas@cluster0.3qgh0ao.mongodb.net/pin?retryWrites=true&w=majority&appName=Cluster0");
//    console.log(`MongoDB Connected:${conn.connection.host}`)
//   } catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
// }

// connectDB()



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
