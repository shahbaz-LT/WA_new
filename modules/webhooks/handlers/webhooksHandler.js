import axios from "axios";
import "dotenv/config";
import WhatsappCloudAPI from "whatsappcloudapi_wrapper";


const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

const Whatsapp = new WhatsappCloudAPI({
  accessToken: token,
  senderPhoneNumberId: process.env.Meta_WA_SenderPhoneNumberId,
  WABA_ID: process.env.Meta_WA_wabaId,
  graphAPIVersion: 'v15.0'
});

let firstMessage = false;
let isCustomer = false;
let isPlacingOrder = false;
let isCheckingOrderStatus = false;
let isBroker = false;
let isUpdatingOrderStatus = false;

class WebhooksHandler {
  verifyCallback(req, res, next) {
    let mode = req.query["hub.mode"];
    let challange = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];
    if (mode && token) {
      if (mode === "subscribe" && token === mytoken) {
        res.status(200).send(challange);
        next();
      } else {
        res.status(403);
      }
    }
  }

  receiveMessage(req, res, next) {
    let body_param = req.body;
    console.log(JSON.stringify(body_param, null, 2));
    if (body_param.object) {
      console.log("inside body param");
      if (body_param.entry &&
        body_param.entry[0].changes &&
        body_param.entry[0].changes[0].value.messages &&
        body_param.entry[0].changes[0].value.messages[0]
      ) {
        let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
        let from = body_param.entry[0].changes[0].value.messages[0].from;
        let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

        console.log("phone number " + phon_no_id);
        console.log("from " + from);
        console.log("boady param " + msg_body);

        axios({
          method: "POST",
          url: "https://graph.facebook.com/v15.0/" + phon_no_id + "/messages?access_token=" + token,
          data: {
            messaging_product: "whatsapp",
            to: from,
            text: {
              body: "Hi, this is Railway Project Management ChatBot, your message that you just sent is " + msg_body
            }
          },
          headers: {
            "Content-Type": "application/json"
          }

        });

        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    }
  }

  async chatbot(req, res, next) {
    try {
      console.log('POST: Someone is pinging me!');

      let data = Whatsapp.parseMessage(req.body);

      if (data?.isMessage) {
        let incomingMessage = data.message;

        // extract the phone number of sender
        let recipientPhone = incomingMessage.from.phone;

        //extract the name of the sender
        let recipientName = incomingMessage.from.name;

        // extract the type of message (some are text, others are images, others are responses to buttons etc...)
        let typeOfMsg = incomingMessage.type;

        // extract the message id
        let message_id = incomingMessage.message_id;

        if (typeOfMsg === 'text_message') {

          // check if user is already registered as customer/broker
          if (!firstMessage) {

            firstMessage = true;
            await Whatsapp.sendSimpleButtons({
              message: `Hey ${recipientName},
            \nWelcome to the LetsTransport WhatsApp Service.
            \nAre you a Customer or a Broker ?`,
              recipientPhone: recipientPhone,
              listOfButtons: [
                {
                  title: 'Customer',
                  id: 'user_is_customer',
                },
                {
                  title: 'Broker',
                  id: 'user_is_broker',
                },
              ],
            });
          }

          else {

              if(isCustomer){

                if(isPlacingOrder){

                  console.log("Data is : ");
                  console.log(data);
                }

                if(isCheckingOrderStatus){
              
                }

              }

              if(isBroker){

              }

          }
        }

        if (typeOfMsg == 'simple_button_message') {

          let button_id = incomingMessage.button_reply.id;

          if (button_id === 'user_is_customer') {

            isCustomer = true;

            await Whatsapp.sendSimpleButtons({
              message: `What action do you want to perform ?`,
              recipientPhone: recipientPhone,
              listOfButtons: [
                {
                  title: 'Place Order',
                  id: 'place_order',
                },
                {
                  title: 'Track Order',
                  id: 'get_order_status',
                },
              ],
            });

          }

          if (button_id === 'user_is_broker') {

            isBroker = true;


          }

          if (button_id === 'place_order') {

            isPlacingOrder = true;

            await Whatsapp.sendText({
              message: ` Please revert back with the following details 
              \nCustomer ID :
              \nSource Address :
              \nDestination Address :
              \nExact Pickup Pincode :
              \nExact Destination Pincode :
              \nVolume of the Consigment :
              \nWeight of the Consigment : 
              \nSeparated by Commas between them.`,
              recipientPhone: recipientPhone
            });
          }

          if (button_id === 'get_order_status') {
            await Whatsapp.sendText({
              message: 'Please Enter Order-ID of the Order you want to Track',
              recipientPhone: recipientPhone
            });

          }

          if (button_id === 'update_order_status') {

          }

          if (button_id === 'generate_order_invoice') {

          }



        }

      }
      return res.sendStatus(200);
    } catch (error) {
      console.error({ error })
      return res.sendStatus(500);
    }

  }



  init(app) {
    app.get('/api/webhook', this.verifyCallback);
    app.post('/api/webhook', this.chatbot);
  }
}

export default new WebhooksHandler();