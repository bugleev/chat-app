const dialogflow = require("dialogflow");
const uuid = require("uuid");

class Bot {
  constructor() {
    this.name = "SRVBot";
    this.text = "";
    this.initConnection();
  }

  async checkMessage(msg) {
    if (msg.match(/@Srvbot/i)) {
      this.extractText(msg);
      return await this.reachAPI();
    }
  }
  extractText(msg) {
    this.text = msg.replace(/@\w+,/i, "").trim();
  }
  loadDataFromServer(data) {
    if (this.data) return;
    this.data = data;
  }
  initConnection(projectId = "buybot-65701") {
    // A unique identifier for the given session
    const sessionId = uuid.v4();
    const privateKey = process.env.GOOGLE_SERVICE_KEY.replace(
      new RegExp("\\\\n", "g"),
      "\n"
    );
    const privateEmail = process.env.GOOGLE_EMAIL;
    let config = {
      credentials: {
        private_key: privateKey,
        client_email: privateEmail
      }
    };
    // Create a new session
    this.sessionClient = new dialogflow.SessionsClient(config);
    this.sessionPath = this.sessionClient.sessionPath(projectId, sessionId);

    // read yandex data from file
    // if (
    //   fs.existsSync(path.join(serverPath, process.env.UPLOADS_DIR, "yandex"))
    // ) {
    //   fs.readFile(
    //     path.join(serverPath, process.env.UPLOADS_DIR, "yandex"),
    //     "utf8",
    //     (err, data) => {
    //       if (err) {
    //         console.log(err);
    //       } else {
    //         const obj = JSON.parse(data);
    //         this.data = obj;
    //       }
    //     }
    //   );
    // }
  }
  async reachAPI() {
    // The text query request.
    const request = {
      session: this.sessionPath,
      queryInput: {
        text: {
          // The query to send to the dialogflow agent
          text: this.text,
          languageCode: "ru-RU"
        }
      }
    };

    // Send request and log result
    const responses = await this.sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    if (result.webhookPayload) {
      return result.webhookPayload.fields.webChat.structValue.fields.messages;
    }
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);
    }
    return result.fulfillmentText;
  }
}
module.exports = new Bot();
