import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import axios  from "axios";

const app = express().use(bodyParser.json());
app.listen(8080,()=>{
  console.log("WebHook server listening on 8080");
});

const token = process.env.TOKEN;



app.get("/webhook",(req,res)=>{
 let mode =  req.query["hub.mode"];
 let challenge = req.query["hub.challenge"];
 let token = req.query["hub.verify_token"];

  if(mode && token){

    if(mode == "subscribe" && token== process.env.MYTOKEN){
      res.status(200).send(challenge);
    }
    else{
      res.status(403);
    }
  }
});


app.post("/webhook",(req,res)=>{
  
  let body = req.body;
  console.log(JSON.stringify(body, null,2));

  if(body.object){
    if(body.entry && 
      body.entry[0].changes
      && body.entry[0].changes[0].value.messages
      && body.entry[0].changes[0].value.messages[0]){

        let phone_number_id  = body.entry[0].changes[0].value.metadata.phone_number_id;
        let from = body.entry[0].changes[0].value.messages[0].from;
        let msg_body = body.entry[0].changes[0].value.messages[0].text_body;


        axios({
          method: "POST",
          url : "https://graph.facebook.com/v15.0/" + phone_number_id + "/messages?access_token="  + token,
          data : {
            messaging_product : "whatsapp",
            to:from,
            text: {
              body : "Hi.. Shahbaz here"
            }
          },
          headers : {
            "Content-Type": "application/json"
          }
        });

        res.sendStatus(200);
      }

      else{
        res.sendStatus(404);
      }


  }
});

app.get("/",(req, res) => {
    res.status(200).send("WhatsApp WebHook Setup");
});


