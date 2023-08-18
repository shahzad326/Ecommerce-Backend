import admin from "./firebase";

export function sendNotification(message: any) {
  try {
    admin
      .messaging()
      .send(message)
      .then((response: any) => {
        console.log("Notification sent successfully:", response);
        return true;
      })
      .catch((error: any) => {
        console.log("Error sending notification:", error);
        return false;
      });
  } catch (err) {
    console.log(err);
  }
}
