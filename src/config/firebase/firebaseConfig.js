const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/**
 * @function : create sendNotification function.
 * @description : sendNotification function used to send notification to a singal user.
 */

  const sendNotification = async () => {
    try {
        const payload = {
            notification: {
                title: "Hello",
                body: "Message jaaye to btao yarrrrrrrrrr",
                image: "https://miro.medium.com/v2/resize:fit:828/format:webp/0*yed0XaNxZDGuYweQ.jpg", // Replace with your image URL
            },
            webpush: {
                fcm_options: {
                    link: "https://example.com/link", // Replace with your link URL
                },
            },
            token: "d2OhfxxlTPC2mBZj3NHOiE:APA91bF_nTHhQSUsRuGIQJXyw0ggG8VxWnweoGAjcr2fyL9rSs0L5LyEP3Szo9C78XdYtPOFX74IaNdzglAY87JGkrw1MLBC-rDbodFVenXp1usl4ZijE1Ernj9C7yaej_EMcOBdUE77",
        };

        const response = await admin.messaging().send(payload);
        console.log('Successfully sent message:', response);
    } catch (error) {
        console.error('Error sending message:', error);
    }
};


const sendNotificationToAll = async (msgtitle, msgmsgbody, msgimage, receiveTokens, msgUrl) => {
  try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: receiveTokens,
        notification: {
          title: msgtitle,
          body: msgmsgbody,
          image: msgimage,
          
        },
        data: {
          customData: " ", // Correct key-value structure
          url: `${msgUrl}`
        }
      });

      console.log('Successfully sent messages:', response.successCount);
      console.log('Failed messages:', response.failureCount);

  } catch (error) {
      console.error('Error sending message : ', error);
  }
};


// const sendNotificationToAll = async (msgtitle, msgmsgbody, msgimage, receiveTokens, msgUrl) => {
//   try {
//       const response = await admin.messaging().sendEachForMulticast({
//         tokens: receiveTokens,
//         notification: {
//           title: msgtitle,
//           body: msgmsgbody,
//           image: msgimage
//         },
//         data: {
//           customData: " ", // Existing key-value pair
//           url: msgUrl // Adding the deep link
//         }
//       });

//       console.log('Successfully sent messages:', response.successCount);
//       console.log('Failed messages:', response.failureCount);

//   } catch (error) {
//       console.error('Error sending message : ', error);
//   }
// };





module.exports = {
  sendNotification,
  sendNotificationToAll
};
