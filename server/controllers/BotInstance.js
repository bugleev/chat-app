const dialogflow = require("dialogflow");
const uuid = require("uuid");
const fs = require("fs");
const path = require("path");
const serverPath = require("../util/path");
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
    console.log("text:", this.text);
  }
  loadDataFromServer(data) {
    if (this.data) return;
    this.data = data;
  }
  initConnection(projectId = "buybot-65701") {
    // A unique identifier for the given session
    const sessionId = uuid.v4();
    // Create a new session
    this.sessionClient = new dialogflow.SessionsClient();
    this.sessionPath = this.sessionClient.sessionPath(projectId, sessionId);

    // read yandex data from file
    fs.readFile(
      path.join(serverPath, process.env.UPLOADS_DIR, "yandex"),
      "utf8",
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          const obj = JSON.parse(data);
          this.data = obj;
        }
      }
    );
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
    if (result.allRequiredParamsPresent) {
      if (this.data) {
        let fromCode = this.data.find(
          el => el.value === result.parameters.fields.from.stringValue
        ).code;
        let toCode = this.data.find(
          el => el.value === result.parameters.fields.to.stringValue
        ).code;
        let date = new Date(
          result.parameters.fields.date.stringValue
        ).toISOString();
        let yandexURL = `https://api.rasp.yandex.net/v3.0/search/?apikey=ebf316c3-0577-46c4-93b3-cd3ef3e5feea&format=json&from=${fromCode}&to=${toCode}&lang=ru_RU&page=1&date=${date}
        `;
        return yandexURL;
      }
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
