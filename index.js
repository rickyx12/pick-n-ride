'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  request = require('request'),
  fetch = require('node-fetch'),
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


  let response,
      details,
      pickUp = [],
      dropOff = [];


  if(received_message.quick_reply) {
    
    if(received_message.quick_reply.payload == 'PASSENGER_YES') {
      startBooking(sender_psid);
    }else if(received_message.quick_reply.payload == 'GET_STARTED_PAYLOAD') {
      sendGetStarted(sender_psid);
    }else {
      noBooking(sender_psid);
    }

  }else if(received_message.text == "menu") {

    sendGetStarted(sender_psid);

  }else {
     
      if((received_message.text.includes('PU:')) || (received_message.text.includes('pu:')) && 
        (received_message.text.includes('DO:')) || (received_message.text.includes('do:')) && 
        (received_message.text.includes('F:')) || (received_message.text.includes('f:')) ) {
         
        response = {
          "text": received_message.text+"\u000A\u000ASearching driver for you 📱🔎🏍👌...."
        }

      }else {
        
        response = {
          "text": "Sorry, it seems you have an incorrect format.\u000APls check your format and try again =( "
        }
      
      }

      // Sends the response message
      callSendAPI(sender_psid, response).then(() => {
        typing(sender_psid);
      }); 
      
  }


}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

  let response;

  let payload = received_postback.payload;

  if(payload == 'GET_STARTED_PAYLOAD') {
    
    sendGetStarted(sender_psid);
  
  } else{

    console.log('No payload');

  }

}


function sendGetStarted(recipientId) {

    let response1,
        response2,
        response3;
 
      response1 = {
        "text":"Hello, How's your day? :)"
      }

      response2 = {
        "text":"We are Pick-N-Ride a transportation service for you. =) "
      }


      response3 = {
        "text": "Do you want us to find you a driver?",
        "quick_replies": [
          {
            "content_type":"text",
            "title":"Yes",
            "payload":"PASSENGER_YES"
          },
          {
            "content_type":"text",
            "title":"No",
            "payload":"PASSENGER_NO"
          }
        ]
      }


    callSendAPI(recipientId,response1).then(() => {
        return callSendAPI(recipientId,response2).then(() => {
          return callSendAPI(recipientId,response3);
        });
      });
}


function startBooking(recipientId) {

  let howToUseText1,
      howToUseText2,
      howToUseText3;
 
  howToUseText1 = {
    "text":"We need to know the\u000A\u000APickup:\u000ADropoff:\u000AFare:\u000A\u000Ato find you a driver."
  }

  howToUseText2 = {
    "text":"FORMAT \u000A\u000APU<colon>Pickup location\u000ADO<colon>Dropoff location\u000AF<colon>fare amount"
  }

  howToUseText3 = {
    "text":"EXAMPLE \u000A\u000APU:Tomas morato starbucks\u000ADO:Inoza Tower BGC\u000AF:150"
  }

  callSendAPI(recipientId,howToUseText1).then(() => {
    return callSendAPI(recipientId,howToUseText2).then(() => {
      return callSendAPI(recipientId,howToUseText3);
    });
  });

}

 function noBooking(recipientId) {
   
   let response;

   response = {
    "text": "Okay then, anyway if you change your mind just tap this 👇",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"Start Booking",
        "payload":"GET_STARTED_PAYLOAD"
      }
    ]
   }

   callSendAPI(recipientId,response);

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



function callSendAPI(sender_psid, response) {
  
  typing(sender_psid);

  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  const qs = 'access_token='+encodeURIComponent(accessToken);
  return fetch('https://graph.facebook.com/v2.6/me/messages?'+qs,{
    method:'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(request_body)
  });

}


