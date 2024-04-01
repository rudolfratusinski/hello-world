const express = require("express");
const { Client } = require("pg");
const { Signer } = require("@aws-sdk/rds-signer");
const {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  SendMessageCommand
} = require("@aws-sdk/client-sqs");

require("dotenv").config();
var app = express();

const sqsClient = new SQSClient();
const queueUrl = process.env.SQS_QUEUE_1_URL;


// Function to send a message
const sendMessage = async (messageBody) => {
  const params = {
    QueueUrl: queueUrl,
    MessageBody: messageBody,
  };

  try {
    const data = await sqsClient.send(new SendMessageCommand(params));
    console.log("Message sent, ID:", data.MessageId);
  } catch (err) {
    console.error("Error", err.stack);
  }
};

// Function to receive messages
const receiveMessages = async () => {
  const params = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10, // Adjusted to receive up to 10 messages at once
    VisibilityTimeout: 30,
    WaitTimeSeconds: 20,
  };

  let messagesContent = [];

  try {
    const data = await sqsClient.send(new ReceiveMessageCommand(params));
    if (data.Messages && data.Messages.length > 0) {
      for (let message of data.Messages) {
        console.log("Message Received:", message.Body);
        messagesContent.push(message.Body);

        // Optionally delete the message if you don't need it in the queue anymore
        // await deleteMessage(message.ReceiptHandle);
      }
    } else {
      console.log("No messages received");
    }
  } catch (err) {
    console.error("Error", err.stack);
  }

  return messagesContent;
};

// Function to delete a message
const deleteMessage = async (receiptHandle) => {
  const deleteParams = {
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  };

  try {
    const data = await sqsClient.send(new DeleteMessageCommand(deleteParams));
    console.log("Message Deleted", data);
  } catch (err) {
    console.error("Delete Error", err.stack);
  }
};


app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.get("/database", async (req, res) => {
  try {
    const signer = new Signer({
      region: process.env.DATABASE_REGION,
      hostname: process.env.DATABASE_URL,
      port: 5432,
      username: process.env.DATABASE_USERNAME,
    });

    const token = await signer.getAuthToken({
      username: process.env.DATABASE_USERNAME,
    });

    const client = new Client({
      host: process.env.DATABASE_URL,
      port: 5432,
      ssl: {
        rejectUnauthorized: false,
      },
      user: process.env.DATABASE_USERNAME,
      password: token,
      database: process.env.DATABASE_NAME,
    });

    await client.connect();
    const result = await client.query("SELECT NOW()");
    await client.end();

    res.send(`Database time: ${result.rows[0].now}`);
  } catch (error) {
    console.error("Database connection failed", error);
    res.status(500).send("Failed to connect to the database");
  }
});

app.get("/sqs-send", async (req, res) => {
  await sendMessage('Hello, this is a test message!');
  res.send("Sent a test SQS message")
});

app.get("/sqs-receive", async (req, res) => {
  const messages = await receiveMessages();
  res.send("Received SQS messages: " + messages);
});


app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});
