
var functions = require('firebase-functions');
var admin = require('firebase-admin');                //Will give access to our firebase database
var cors = require('cors')({origin: true});           //Send the right headers, for sending request from different server

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

//You have to download the service key from  project/settings/service-accounts
var serviceAccount = require("./udemypwa_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://udemypwa.firebaseio.com/'       //location of the database
});

//1.it is the url name for the API root/storePostData
//'https://udemypwa.firebaseio.com/storePostData'
//2. We are waiting an https request
//3. onRequest, this will be executed when our endpoint is activated
exports.storePostData = functions.https.onRequest(function(request, response) {
//4. Will configure the right headers for us
 cors(request, response, function() {
//5. Will put a new post to our database posts dataTable
   admin.database().ref('posts').push({
     id: request.body.id,
     title: request.body.title,
     location: request.body.location,
     image: request.body.image
   })
//6. configure our response   
     .then(function() {
       response.status(201).json({message: 'Data stored', id: request.body.id});
     })
     .catch(function(err) {
       response.status(500).json({error: err});
     });
 });
});
