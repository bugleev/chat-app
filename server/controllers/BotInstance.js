const dialogflow = require("dialogflow");
const uuid = require("uuid");

class Bot {
  constructor() {
    this.name = "SRVBot";
    this.text = "";
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
  async reachAPI(projectId = "buybot-65701") {
    // A unique identifier for the given session
    const sessionId = uuid.v4();

    // Create a new session
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);

    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          // The query to send to the dialogflow agent
          text: this.text,
          languageCode: "ru-RU"
        }
      }
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log("Detected intent");
    console.log("responses:", responses);
    const result = responses[0].queryResult;
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
