var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const boardModel = require('./boards')
const passport = require('passport');
const port = "3000"

const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));
const upload = require('./multer');


router.get('/', function(req, res, next) {
  res.render('index',{Nav:false,error:req.flash('error')});
});


router.get('/register', function(req, res, next) { // this is for render page
  res.render('register',{Nav:false});
});

router.get('/profile', isLoggedIn ,async function(req, res, next) { 
  const user = await userModel.findOne({username: req.session.passport.user}).populate("posts").populate("boards")
 
  res.render('profile',{user,Nav:true});
});

router.get('/add', isLoggedIn ,async function(req, res, next) { 
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('add',{user ,Nav:true});
}); 

router.get('/show/posts', isLoggedIn ,async function(req, res, next) { 
  const user = await userModel.findOne({username: req.session.passport.user}).populate("posts")
  res.render('show',{user ,Nav:true});
});

router.get('/saved/pins', isLoggedIn ,async function(req, res, next) { 
  const user = await userModel.findOne({username: req.session.passport.user}).populate("boards")
  res.render('savedpins',{user ,Nav:true});
});

//------------------------delete post----------------------------------------------------------------------------------

router.get('/delete/:postid', isLoggedIn, async function(req, res, next) { 
  try {

    const postId = req.params.postid;
    
    // Find the post
    const post = await postModel.findById(postId);
    
    // Check if the post exists and if the user is the creator
    if (!post) {
      return res.status(404).send("Post not found");
    }
    if (post.user.toString() === req.user._id.toString()) {
      // Remove the post from the user's posts array
      await userModel.findByIdAndUpdate(req.user._id, { $pull: { posts: postId } });
      
      // Delete the post
      await postModel.findByIdAndDelete(postId);
      
      return res.redirect("/show/posts");
    } else {
      return res.status(403).send("You are not authorized to delete this post");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
//--------------------------------------save pin-------------------------------------------------------------------------------
router.get('/save/:postid', isLoggedIn ,async function(req, res, next) { 
  const postid = req.params.postid;
  const post = await postModel.findById(postid);
  const user = await userModel.findOne({username: req.session.passport.user})

const board = await boardModel.create({
    user:post.user,
    title:post.title,
    description:post.description,
    image:post.image,
  })
  user.boards.push(board._id)
  await user.save()

  res.redirect('/feed');
  
});


router.get('/feed', isLoggedIn ,async function(req, res, next) { 
  const user = await userModel.findOne({username: req.session.passport.user})
  const posts = await postModel.find().populate("user")

  res.render('feed',{user,posts, Nav:true});

});

router.get('/post/:postid', isLoggedIn ,async function(req, res, next) { 
  // const user = await userModel.findOne({username: req.session.passport.user})
 const postdata= req.params.postid
//  console.log(postdata)
 const posts = await postModel.findOne({_id:postdata})
  
  // res.render('feed',{user,posts, Nav:true});
    res.render('post', {posts, Nav:true})
});

router.get('/board/:boardid', isLoggedIn ,async function(req, res, next) { 
  // const user = await userModel.findOne({username: req.session.passport.user})
 const boarddata= req.params.boardid
//  console.log(postdata)
 const boards = await boardModel.findOne({_id:boarddata})
  
  // res.render('feed',{user,posts, Nav:true});
    res.render('showboard', {boards, Nav:true})
});

router.get('/download/:postid', isLoggedIn ,async function(req, res, next) { 
  const postdata= req.params.postid
  const posts = await postModel.findOne({_id:postdata})

  const filePath = `./public/images/uploads/${posts.image}`
  res.download(filePath, 'image.jpg');
 
});

router.get('/downloads/:boardid', isLoggedIn ,async function(req, res, next) { 
  const boarddata= req.params.boardid
  const boards = await boardModel.findOne({_id:boarddata})

  const filePath = `./public/images/uploads/${boards.image}`
  res.download(filePath, 'image.jpg');
 
});

router.get('/removepin/:boardid', isLoggedIn, async function(req, res, next) { 
  try {

    const boardid = req.params.boardid;
    
    // Find the post
    const board = await boardModel.findById(boardid);
    const user = await userModel.find({username: req.session.passport.user})
    
    
    if (board.user.toString() === req.user._id.toString()) {
      // Remove the post from the user's boards array
      await userModel.findByIdAndUpdate(req.user._id, { $pull: { boards: boardid } });
      
    
      
      
      return res.redirect("/saved/pins");
    } else {
      return res.status(403).send("You are not authorized to delete this post");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


router.post('/createpost', isLoggedIn, upload.single("postimage") ,async function(req, res, next) { 
  const user = await userModel.findOne({username: req.session.passport.user});
 const post = await postModel.create({
    user:user._id,
    title:req.body.title,
    description:req.body.description,
    image:req.file.filename
  
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");

 
});

router.post('/register', function(req, res, next) { // this is for handle register form data 
  const data = new userModel({  // here we pass all data that is coming from register form.
    name: req.body.fullname,
    username: req.body.username,
    email:req.body.email,
    contact:req.body.contact
  })

  userModel.register(data,req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/feed");
    })
  })
});


router.post('/login',passport.authenticate("local", {
  successRedirect:"/feed",
  failureRedirect:"/",
  failureFlash:true
} ) ,function(req, res, next) { });

router.post('/fileupload', isLoggedIn, upload.single("image") ,async function(req, res, next) {  // image becoz we set image as a name in form input 
 const user = await userModel.findOne({username: req.session.passport.user});
 user.profileImage = req.file.filename; // image ka naam req.file.filename me hota hai
 await user.save(); //kyoki hamane haat se changes kiye hai
 res.redirect("/profile")
});

router.get('/logout', function(req, res, next) { 
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect("/")

}


module.exports = router;
