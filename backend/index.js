const cron = require("node-cron");
const express = require("express");
const dotenv = require("dotenv").config({
  path: require("find-config")(".env"),
});
const fs = require("node:fs");
const RtcTokenBuilder = require("./helpers/RtcTokenBuilder").RtcTokenBuilder;
const RtcRole = require("./helpers/RtcTokenBuilder").Role;

const app = express();
app.use(express.json());

const saveOutputsToFile = (outputs) => {
  fs.writeFileSync("outputs.json", JSON.stringify(outputs, null, 2));
};

const readOutputsFromFile = () => {
  if (fs.existsSync("outputs.json")) {
    const data = fs.readFileSync("outputs.json");
    return JSON.parse(data);
  }
  return null;
};

// Function to check the pipeline status
async function checkPipelineStatus(runId) {
  const url = `https://api.gumloop.com/api/v1/get_pl_run?run_id=${runId}&user_id=hZ7iXCy8iDWSksDEOpeObIvGmoG2`;
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer 06696e2506bd40e6be67cc7a4252f2ad`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(url, options);
    console.log(response);
    const data = await response.json();

    // fs.writeFile('outputData.json', data, (err) => {
    //   if (err) {
    //     console.error('Error writing file:', err);
    //   } else {
    //     console.log('File written successfully!');
    //   }
    // });    
    console.log("Pipeline status:", data);

    // Check if the state is RUNNING
    if (data.state === "RUNNING") {
      console.log("Pipeline still running. Retrying in 10 seconds...");
      setTimeout(() => checkPipelineStatus(runId), 10000); // Retry after 10 seconds
    } else {
      console.log("Pipeline completed:", data);
      saveOutputsToFile(data.outputs);
    }
  } catch (error) {
    console.error("Error checking pipeline status:", error);
  }
}

// Cron job to trigger the pipeline
cron.schedule("* * * * *", async () => {
  const options = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer 06696e2506bd40e6be67cc7a4252f2ad',
      'Content-Type': 'application/json'
    },
    body: '{"user_id":"hZ7iXCy8iDWSksDEOpeObIvGmoG2","saved_item_id":"s2ouPQ1E7wT3vwTTA1cn4p","pipeline_inputs":[{"input_name":"input","value":"https://www.bell.ca/Bell_Internet/Internet_access;https://fizz.ca/en/internet;https://www.videotron.com/en/internet/unlimited-internet-plans;https://www.telus.com/en/internet/forfaits"}]}'
  };
  
  fetch('https://api.gumloop.com/api/v1/start_pipeline', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));

  try {
    const response = await fetch(
      "https://api.gumloop.com/api/v1/start_pipeline",
      options
    );
    const data = await response.json();
    console.log("Pipeline started:", data);

    const runId = data.run_id;
    if (runId) {
      // Start checking the pipeline status
      checkPipelineStatus(runId);
    } else {
      console.error("No run_id received in the response:", data);
    }
  } catch (error) {
    console.error("Error starting pipeline:", error);
  }
});

app.get("/", (req, res) => {
  res.send("Express backend with cron job running");
});

app.get("/get-data", (req, res) => {
  const outputs = readOutputsFromFile();
  if (outputs) {
    res.json(outputs);
  } else {
    res.status(404).send("Outputs not found");
  }
});

app.post("/generate-token", (req, res) => {
  const { uid, role } = req.body;
  const appId = process.env.VITE_AGORA_APP_ID;
  const appCertificate = process.env.VITE_AGORA_APP_CERTIFICATE;
  const channelName = "channelName";
  // Fill in your actual user ID (0 for users without authentication)
  // const uid = req.body.uid;
  // Set streaming permissions, PUB = 1, SUB = 2, set PUB for most cases, only special cases need to set SUB
  // const role = req.body.RtcTole;
  // Token validity time in seconds
  const tokenExpirationInSecond = 3600;
  // The validity time of all permissions in seconds
  const privilegeExpirationInSecond = 3600;
  console.log("App Id:", appId);
  console.log("App Certificate:", appCertificate);
  if (appId == undefined || appId == "" || appCertificate == undefined || appCertificate == "") {
    console.log("Need to set environment variable AGORA_APP_ID and AGORA_APP_CERTIFICATE");
    process.exit(1);
  }
  // Generate Token
  const tokenWithUid = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, tokenExpirationInSecond, privilegeExpirationInSecond);
  console.log("Token with int uid:", tokenWithUid);
  res.status(200).json({ token: tokenWithUid });
});


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
