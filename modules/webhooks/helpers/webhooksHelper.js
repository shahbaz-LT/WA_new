import WhatsappCloudAPI from "whatsappcloudapi_wrapper";

class WebhooksHelper {

  initiliazeWhatsApp() {
    try {
      const Whatsapp = new WhatsappCloudAPI({
        accessToken: token,
        senderPhoneNumberId: process.env.Meta_WA_SenderPhoneNumberId,
        WABA_ID: process.env.Meta_WA_wabaId,
        graphAPIVersion: 'v15.0'
      });

      console.log("Whatsapp Cloud API Warpper Working");
      return Whatsapp;
    }
    catch (err) {
      console.log("Error in Initiliasing WhatsApp: " + err.message);
      console.log(JSON.stringify(err));
    }
  }
}


export default new WebhooksHelper();
