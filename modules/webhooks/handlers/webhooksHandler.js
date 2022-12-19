import "dotenv/config";
import webhooksHelper from "../helpers/webhooksHelper.js";
import orderHelper from "../../order/helpers/orderHelper.js";

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;
const userSession = new Map();

class WebhooksHandler {
  verifyCallback(req, res, next) {
    let mode = req.query["hub.mode"];
    let challange = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];
    console.log(mode, challange, token);
    if (mode && token) {
      if (mode === "subscribe" && token === mytoken) {
        res.status(200).send(challange);
        next();
      } else {
        console.log("WebHook Callback Failed becuase Mode/Token doenst match");
        res.status(403);
      }
    }
    else {
      console.log("WebHook Callback not verified");

      console.log(mode + " " + typeof(mode));
      console.log(token + " " + typeof(token));
      res.status(403);
    }
  }

  async chatbot(req, res, next) {
    try {
      console.log('POST: Someone is pinging me!');
      const Whatsapp = webhooksHelper.initiliazeWhatsApp();
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

        if (!userSession.get(recipientPhone)) {
          userSession.set(recipientPhone, {
            firstMessage: false,
            isCustomer: false,
            isPlacingOrder: false,
            isCheckingOrderStatus: false,
            isBroker: false,
            isUpdatingOrderStatus: false,
          });
        }

        if (typeOfMsg === 'text_message') {

          // check if user is already registered as customer/broker
          if (!userSession.get(recipientPhone).firstMessage) {

            userSession.get(recipientPhone).firstMessage = true;

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

            if (!userSession.get(recipientPhone).isCustomer) {
              if (!userSession.get(recipientPhone).isPlacingOrder) {

                const msgArr = data.message.text.body;
                console.log("Data is --> " + msgArr);
                const msgArr2 = msgArr.split(',');

                const result = await orderHelper.createOrderFromStringArray(msgArr2);
                console.log("Resut is --> " + result.message);

                if (result.status == 200) {
                  await Whatsapp.sendText({
                    message: `Order Created with Order-ID ${result._id}.`,
                    recipientPhone: recipientPhone
                  });

                  userSession.delete(recipientPhone);
                }
                else {
                  await Whatsapp.sendText({
                    message: `Order Could not be Created due to - ${result.message}.
                    Please try again with correct format and values.` ,
                    recipientPhone: recipientPhone
                  });
                }
              }

              if (!userSession.get(recipientPhone).isCheckingOrderStatus) {
                const orderId = data.message.text.body;

                const result = await orderHelper.getOrderById(orderId);

                if (result.status == 200) {
                  await Whatsapp.sendText({
                    message: `OrderID is correct , volume of parcel is ->
                    ${result.volume}.`,
                    recipientPhone: recipientPhone
                  });

                  userSession.delete(recipientPhone);
                }
                else {
                  await Whatsapp.sendText({
                    message: `Order couldnt be fetched because - ${result.message}.
                    Please try again with correct format and values.` ,
                    recipientPhone: recipientPhone
                  });

                }

              }

            }

            if (!userSession.get(recipientPhone).isBroker) {

            }

          }
        }


        //Reply for Button Messages :
        if (typeOfMsg == 'simple_button_message') {

          let button_id = incomingMessage.button_reply.id;

          if (button_id === 'user_is_customer') {

            userSession.get(recipientPhone).isCustomer = true;

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

            userSession.get(recipientPhone).isBroker = true;


          }

          if (button_id === 'place_order') {

            userSession.get(recipientPhone).isPlacingOrder = true;

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

        await Whatsapp.markMessageAsRead({
          message_id,
        });

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