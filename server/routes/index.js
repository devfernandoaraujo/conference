const express = require('express');

const router = express.Router();

const speakersRoute = require('./speakers');
const feedbackRoute = require('./feedback');

module.exports = (param)=>{

    const {speakersService} = param;

    router.get('/',async (req,res,next)=>{

        //Using this we have penalt in performance
        //const speakerList = await speakersService.getListShort();
        //const artwork = await speakersService.getAllArtwork();
        
        //Best way to do it

        try{
            const promises = [];
            promises.push(speakersService.getListShort()); 
            promises.push(speakersService.getAllArtwork());
            
            const results = await Promise.all(promises);

            return res.render('index',{
                page: 'Home',
                speakerList: results[0],
                artwork: results[1]
            });    
        }catch(err){
            return next(err);
        }  
    });

    router.use('/speakers',speakersRoute(param));
    router.use('/feedback',feedbackRoute(param));

    return router;
};