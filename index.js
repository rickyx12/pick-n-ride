'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  request = require('request'),
  dataUrl = "https://mindanaodailymirror.ph/index.php",
  accessToken = "EAADuLIY8BksBALxFZA9SuJ5vshC6UB1mBmbwnjie1fkf4sXXeVfmiUZAuJoZAbM5NYmyo6PMByeuUibI7vK5TAib5uGC2hzj4BfbXZAFEUlwNSZA5TcbzcnNCWTkVEqkuZAx26MkirY85dext2casBL0s4x5R9Mj9ttxpsQe1IxwZDZD",
  app = express().use(bodyParser.json()); // creates express http server




// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Start node server
app.listen( app.get( 'port' ), function() {
  console.log( 'Node server is running on port ' + app.get( 'port' ));
  });



// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);


      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);


      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }

    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});


// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "ricardo123"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});


// Handles messages events
function handleMessage(sender_psid, received_message) {


  let response;

  // if(received_message.quick_reply.payload != "") {
  //   console.log("business has beeeen clickedddd");

  //   getNewsByTopics(sender_psid,received_message.quick_reply.payload);
  
  // }else {

      response = {
        "text": "Hanap ka ng byahe boss?",
        "quick_replies": [
          {
            "content_type":"text",
            "title":"Oo",
            "payload":"YES"
          },
          {
            "content_type":"text",
            "title":"Hindi",
            "payload":"NO"
          }
        ]
      }

  // Sends the response message
  callSendAPI(sender_psid, response); 
  
  // }


}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

  let response;

  let payload = received_postback.payload;

  if(payload == 'GET_STARTED_PAYLOAD') {
    
    customerGreetings(sender_psid);
  
  }else if(payload == 'TOP_STORIES') {
   
    getTopStories(sender_psid);
  
  }else if(payload == 'TOPICS') {

    getTopics(sender_psid);

  }else{

  }

}


function customerGreetings(recipientId) {

  let request_body = {
    "recipient": {
      "id": recipientId
    },
    "message": "Hello How are you?"
  }

  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": accessToken },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      
        sendGetStarted(recipientId);

    } else {
      console.error("Unable to send message:" + err);
    }
  }); 

}

function sendGetStarted(recipientId) {

    let response;

      response = {
        "text": "Hanap ka ng byahe boss?",
        "quick_replies": [
          {
            "content_type":"text",
            "title":"Oo",
            "payload":"YES"
          },
          {
            "content_type":"text",
            "title":"Hindi",
            "payload":"NO"
          }
        ]
      }

  callSendAPI(recipientId,response);
}


function pressRelease(recipientId) {

  let response;

  response = {"attachment":{"type":"template","payload":{"template_type":"generic","image_aspect_ratio":"square","elements":[{"title":"Cagayan De Oro shows support for fellow Mindanaoan Bong Go and PDP-Laban bets","image_url":"http://kuyabonggo.ph/uploads/c389669be29df2e6999433857a003489.jpg","subtitle":"kuyabonggo.ph","buttons":[{"type":"web_url","url":"http://kuyabonggo.ph/press-release/Cagayan-De-Oro-shows-support-for-fellow-Mindanaoan-Bong-Go-and-PDP-Laban-bets","title":"Read"}]},{"title":"Bong Go and PDP bets consolidate strength in South Cotabato, vows to continue development in Mindanao","image_url":"http://kuyabonggo.ph/uploads/2095cd77984044702a1ce6fd08f484af.jpg","subtitle":"kuyabonggo.ph","buttons":[{"type":"web_url","url":"http://kuyabonggo.ph/press-release/Bong-Go-and-PDP-bets-consolidate-strength-in-South-Cotabato-vows-to-continue-development-in-Mindanao","title":"Read"}]},{"title":"Bong Go says President Duterte won\u2019t spare anyone in fight against illegal drugs","image_url":"http://kuyabonggo.ph/uploads/a121f12c27d5099060d16056a8de2ae7.jpg","subtitle":"kuyabonggo.ph","buttons":[{"type":"web_url","url":"http://kuyabonggo.ph/press-release/Bong-Go-says-President-Duterte-wont-spare-anyone-in-fight-against-illegal-drugs","title":"Read"}]},{"title":"Bong Go goes around Caloocan; draws similar warm welcome like Duterte\u2019s 2016 campaign ","image_url":"http://kuyabonggo.ph/uploads/991334eb5db026723c47d3aee069ebaa.jpg","subtitle":"kuyabonggo.ph","buttons":[{"type":"web_url","url":"http://kuyabonggo.ph/press-release/Bong-Go-goes-around-Caloocan-draws-similar-warm-welcome-like-Dutertes-2016-campaign-","title":"Read"}]},{"title":"Bong Go promotes Marikina-made footwear, vows support for local industries","image_url":"http://kuyabonggo.ph/uploads/f1e696a60eaaf0a7d84826a75b0e639a.jpg","subtitle":"kuyabonggo.ph","buttons":[{"type":"web_url","url":"http://kuyabonggo.ph/press-release/Bong-Go-promotes-Marikina-made-footwear-vows-support-for-local-industries","title":"Read"}]},{"title":"Latest Pulse Asia Survey shows Bong Go in Top 3 of Senatorial Polls","image_url":"http://kuyabonggo.ph/uploads/0823b1d6ac4d628df25bba54f3ca6d69.jpg","subtitle":"kuyabonggo.ph","buttons":[{"type":"web_url","url":"http://kuyabonggo.ph/press-release/Latest-Pulse-Asia-Survey-shows-Bong-Go-in-Top-3-of-Senatorial-Polls","title":"Read"}]},{"title":"Bong Go visits Eastern Visayas, vows to push for programs to improve the quality of life in the region ","image_url":"http://kuyabonggo.ph/uploads/ff083a966ddda7631a850381a1fa26a1.jpg","subtitle":"kuyabonggo.ph","buttons":[{"type":"web_url","url":"http://kuyabonggo.ph/press-release/Bong-Go-visits-Eastern-Visayas-vows-to-push-for-programs-to-improve-the-quality-of-life-in-the-region-","title":"Read"}]},{"title":"Bong Go: performance in Service more important than performance in surveys","image_url":"http://kuyabonggo.ph/uploads/73a85702aaab98636342600971c6f879.jpg","subtitle":"kuyabonggo.ph","buttons":[{"type":"web_url","url":"http://kuyabonggo.ph/press-release/Bong-Go-performance-in-Service-more-important-than-performance-in-surveys","title":"Read"}]}]}}};


  callSendAPI(recipientId,response);

}

 function getTopStories(recipientId) {

  // let response;

  // response = {"attachment":{"type":"template","payload":{"template_type":"generic","image_aspect_ratio":"horizontal","elements":[{"title":"Duterte: Run after judge's killers","image_url":"https://mindanaodailymirror.ph/assets/img/news/0a8a89e87206420c95d2a0508455f2df.jpg","subtitle":"President Rodrigo Duterte has ordered the Philippine National Police (PNP) to run after the killers of Ozamiz City Executive Judge Edmundo Pintac and bring them to justice at the soonest possible time.","buttons":[{"type":"web_url","url":"http://localhost/mdm/press-release/","title":"Read"}]},{"title":"Sara calls ACT-Davao \u2018liars\u2019 and \u2018terrorists\u2019","image_url":"https://mindanaodailymirror.ph/assets/img/news/0a8a89e87206420c95d2a0508455f2df.jpg","subtitle":"A word war has erupted between Mayor Sara Duterte and the Alliance of Concerned Teachers (ACT)-Davao City Chapter after the mayor reacted negatively to an Instagram post by ACT-Davao that alleged Davao is the only big city in the Philippines that does not give allowances to teachers.","buttons":[{"type":"web_url","url":"http://localhost/mdm/press-release/","title":"Read"}]},{"title":"SWS survey shows 84% believe PH democracy works","image_url":"https://mindanaodailymirror.ph/assets/img/news/0a8a89e87206420c95d2a0508455f2df.jpg","subtitle":"According to the 2018 SWS third quarter survey held from September 15-23, 2018, the number has increased from 78 percent in March 2018 and nearly tied the record-high 86 percent registered in September 2016.","buttons":[{"type":"web_url","url":"http://localhost/mdm/press-release/","title":"Read"}]}]}}}

   request({
    // "uri":"https://jsonblob.com/api/e3435125-55d7-11e9-bd46-a1e9950e4543",
    "uri":dataUrl+"/Bot/getTopStories",
    "method":"GET"
   },(err,res,body) => {
      
      console.log(body);
      callSendAPI(recipientId,body);

   });

   // callSendAPI(recipientId,response);

 }

 function getTopics(recipientId) {


  request({
    "uri":"https://mindanaodailymirror.ph/index.php/Bot/showCategories",
    "method":"GET"
  },(err,res,body) => {

    callSendAPI(recipientId,body);

  });

 }

 function getNewsByTopics(recipientId,topics) {

  request({
    "uri": "https://jsonblob.com/api/ace99841-5690-11e9-af37-390da9f9cb42",
    "qs": { "topics":topics },
    "method": "GET"
  },(err,res,body) => {

    callSendAPI(recipientId,body);

  });

 }

function typing(sender_psid) {
  
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "sender_action":"typing_on"
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": accessToken },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 

}


// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  
  typing(sender_psid);

  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": accessToken },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 


}