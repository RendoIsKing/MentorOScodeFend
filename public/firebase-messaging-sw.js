// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js");
// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "AIzaSyDbPIVbOf_X2DQS6AS86R0SDNOFTcXACgQ",
  authDomain: "nextjs-fcm-demo-93638.firebaseapp.com",
  projectId: "nextjs-fcm-demo-93638",
  storageBucket: "nextjs-fcm-demo-93638.appspot.com",
  messagingSenderId: "783185176641",
  appId: "1:783185176641:web:afd29d29e4d4e24bcfbec0",
  measurementId: "G-GSZMLEY3XK",
};

// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);
// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: "./logo.png",
    data: payload.data,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

const generateUrl = (notificationPayload) => {
  const type = notificationPayload.type;
  const baseUrl = self.location.origin;
  switch (type) {
    case "comment":
      return `${baseUrl}/post/${notificationPayload.actionTo}`;

    case "like_post":
      return `${baseUrl}/post/${notificationPayload.actionTo}`;

    case "like_comment":
      return `${baseUrl}/post/${notificationPayload.actionTo}`;

    case "follow":
      return `${baseUrl}/${notificationPayload.actionTo}`;

    case "like_story":
      return `${baseUrl}/${notificationPayload.actionTo}`;

    default:
      return `${baseUrl}`;
  }
};

self.addEventListener("notificationclick", async function (event) {
  // event.notification.close();
  const notificationData = event.notification.data;

  const urlToOpen = generateUrl(notificationData);

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      console.log("All clients", allClients);
      // Check if there is any focused client
      let focusedClient = allClients.find((client) => client.focused);

      if (focusedClient) {
        // If a focused client exists, navigate it to the specified URL
        // focusedClient.navigate(`${process.env.NEXT_PUBLIC_DOMAIN}`);
        focusedClient.navigate(`${urlToOpen}`);
      } else {
        // Otherwise, open a new window with the specified URL
        // await clients.openWindow(`${process.env.NEXT_PUBLIC_DOMAIN}`);
        await clients.openWindow(`${urlToOpen}`);
      }
    })()
  );
});
