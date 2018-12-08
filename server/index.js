const express = require('express');
//Including http-errors help
const createError = require('http-errors');
//Include some features to help programmers
const path = require('path');

const bodyParser = require('body-parser');

//Including the configs
const configs = require('./config');

const SpeakerService = require('./services/SpeakerService');
const FeedbackService = require('./services/FeedbackService');

const app = express();

//loading the correct environment
const config = configs[app.get('env')];

//Instance of SpeakersService
const speakersService = new SpeakerService(config.data.speakers);
//Instance of FeedbackService
const feedbackService = new FeedbackService(config.data.feedback);

//Declaring engine of html
app.set('view engine', 'pug');

//if in development show the decompressed code
if(app.get('env') ==='development'){
    app.locals.pretty = true;
}

//Path located all views 
app.set('views',path.join(__dirname,'./views'));

//Global variables
app.locals.title = config.sitename;

//It is avaliable for each request.
/*app.use((req,res,next) => {
    res.locals.rendertime = new Date();
    return next();
});*/

const routes = require('./routes');
//Map all css, js or images inside this path
app.use(express.static('public'));

//bodyParser
app.use(bodyParser.urlencoded({extended: true}));

app.get('/favicon.ico',(req,res,next)=>{
    //Retun no Content
    return res.sendStatus(204);
});

//Global list of speakers for all request
app.use(async (req,res,next)=>{
    try{
        const names = await speakersService.getNames();
        res.locals.speakerNames = names;
        return next();
    }
    catch(err){
        return next(err);
    }
});

app.use('/',routes({
    speakersService,
    feedbackService
}));

//Route error - must be the last route
app.use((req,res,next)=>{
    return next(createError(404,'File not found'));
});

app.use((err,req,res,next)=> {
    res.locals.message = err.message;
    const status = err.status || 500;
    res.locals.status = status;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(status);
    return res.render('error');
});


app.listen(3000, function(){
    console.log("Server listening on port 3000");           
});

module.export = app;
