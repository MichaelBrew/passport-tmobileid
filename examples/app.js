var express           = require('express'),
    passport          = require('passport'),
    qs                = require('qs'),
    TMobileIDStrategy = require('passport-tmobileid').Strategy;

var LOCAL_CALLBACK_URL    = "http://localhost:3000",
    TOKEN_URL             = 'https://token.tmus.net/oauth2/v1/token',
    TMOBILE_CLIENT_ID     = "A-HfuiP64-iz0",
    TMOBILE_CLIENT_SECRET = "Q3KtXkU9zB";

var params = {'access_type': 'ONLINE',
  'redirect_uri': LOCAL_CALLBACK_URL,
  'scope': 'TMO_ID_profile,associated_lines,billing_information,entitlements',
  'client_id': TMOBILE_CLIENT_ID,
  'response_type' : 'code'};

passport.use(new TMobileIDStrategy({
    redirect_uri : LOCAL_CALLBACK_URL,
    tokenURL : TOKEN_URL,
    clientID : TMOBILE_CLIENT_ID,
    clientSecret : TMOBILE_CLIENT_SECRET,
    passReqToCallback : true //to get the req back from passport
},
function(req, token, expiry, id, done){
    if (err) {
        return done(err);
    }
    if (!token) {
        return done(null, false);
    } //No token could be retrieved from the server
    if (id) {
        //A T-Mobile access token has been provided
        User.findOne({'user.tmobileid' : id}, function(err,user){
            if(user) {//a user with this id has been found in your database
                user.tmobile.access_token = token; //add the tmobile access token to this user
                user.save(function(err) {
                    //handle the error
                });
                return done(null, user); //success
            }
        });
    }
})
);

/***********/
/* Express */
/***********/

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(express.static(__dirname + '/public'));

/**********/
/* Routes */
/**********/

app.get('/', function(req, res){
    res.render('index', { user: req.user });
});

app.get('/login', function(req, res) {
    res.render('login', { user: req.user });
});

app.get('/profile', function(req, res) {
    res.render('profile', { user: req.user});
});

app.get('/auth/tmoid', function(req, res) {
    res.redirect('https://auth.tmus.net/oauth2/v1/auth?' + qs.stringify(params));
});

//Listen on port 3000
app.listen(3000);
