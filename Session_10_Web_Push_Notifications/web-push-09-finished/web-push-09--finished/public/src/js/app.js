
var deferredPrompt;
//Selectiong the DOM elements
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

//Lesson 141  - Creating notifications

// function displayConfirmNotification() {
//   var options = {
//     body: 'You successfully subscribed to our Notification service!'
//   };
//   new Notification('Successfully subscribed!', options);
// }


function displayConfirmNotification() {
  if ('serviceWorker' in navigator) {

 //Not every phone is supporting options, so body and first text message are the most important!   
 var options = {
      body: 'You successfully subscribed to our Notification service!',                         
      icon: '/src/images/icons/app-icon-96x96.png',                         //Add an icon to the notification
      image: '/src/images/sf-boat.jpg',                                     //Will add an extra image to the notification
      dir: 'ltr',                                                           //direction of the text
      lang: 'en-US', // BCP 47,                                             //default language
      vibrate: [100, 50, 200],                                              //how it should vibrate, [viber,pause,viber]
      badge: '/src/images/icons/app-icon-96x96.png',                        //WHat showing up in the notification bar on androd
      tag: 'confirm-notification',                                          //Allows you, to assign a tag to the notification, it acts like an id for the notification
      //if tag is used the notifications are stacked on each other, if not it will shown beneath eachoter.
      renotify: true,                                                       //Make sure that the notificaiton with the same tage will vibrate, and stuff
      //This might not be displayed since the browsers might not support it!
      actions: [
        { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png' },
        { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
      ]
    };

    //At this service worker registration, we can call soo many functions,
    //showNotification, will show our configured notification
    navigator.serviceWorker.ready
      .then(function(swreg) {
        swreg.showNotification('Successfully subscribed!', options);
      });
  }
}

function configurePushSub() {
  //We can only use push notificaiton only if we have a service worker.
  if (!('serviceWorker' in navigator)) {
    return;
  }

  var reg;        //We are storing the the service worker registration
  //1. Get the subscription <Promise>
  navigator.serviceWorker.ready
    .then(function(swreg) {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
 //2.Check the subcription     
    .then(function(sub) {
      if (sub === null) {
        // Create a new subscription
        //VAPID KEYS.
        //0. There is an endpoint, to the web browser server, and everybody with that endpoint could forward messages to our user
        //1. Public key: --> Can be visible in our javascript
        //2. Private key: --> It is connected tot the public one, but can't be derived from it and it is only stored at the backend server
        var vapidPublicKey = 'BKapuZ3XLgt9UZhuEkodCrtnfBo9Smo-w1YXCIH8YidjHOFAU6XHpEnXefbuYslZY9vtlEnOAmU7Mc-kWh4gfmE';
        var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          //Push notifications sent from the server, should be visible only to our user.
          //+ Have a unique identifiaction, so webbrowser server will recognize our server with this key
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey
        });
      } else {
        // We have a subscription
      }
    })
//When we have the new subscription, we want to store it on our firebase server. 
    .then(function(newSub) {
      return fetch('https://pwagram-99adf.firebaseio.com/subscriptions.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newSub)
      })
    })
//We will create a new notification, if we were able to store the data in our firebase    
    .then(function(res) {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}

//Will use the available global object of "Notification object"
function askForNotificationPermission() {
  Notification.requestPermission(function(result) {
    console.log('User Choice', result);
    if (result !== 'granted') {
      console.log('No notification permission granted!');
    } else {
      configurePushSub();
      // displayConfirmNotification();
    }
  });
}

//First, check if the browser supports it and if yes, add a "click" event listener to ask for permission.
if ('Notification' in window && 'serviceWorker' in navigator) {
  for (var i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
  }
}