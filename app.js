const bodyParser = require("body-parser")
const express = require("express")
const request = require("request")
const https = require("https")
const client = require("mailchimp-marketing")
const port = process.env.PORT || 3000
const app = express()


client.setConfig({
  apiKey: "9f33a377acd117cd87ae6b2e4b2bb13e-us9",
  server: "us9",
});

app.use(express.static("public"))
app.use(bodyParser.urlencoded({
  extended: true
}))

app.get(`/`, function(req, res) {
  res.sendFile(`${__dirname}/signup.html`)
})

async function run() {
  const response = await client.ping.get();
  console.log(response);
}

run();


app.post("/", function(req, res) {
  const firstName = req.body.firstName
  const lastName = req.body.lastName
  const email = req.body.email
  const id = "b741e4135b"

  const sub = async () => {
    const resp = await client.lists.batchListMembers(id, {
      members: [{
        email_address: email,
        status: `subscribed`,
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }],
    });

    if (Number(resp.error_count) > 0) {
      console.log(`Error Count: ${resp.error_count}`)
      console.log(resp.errors);
      res.sendFile(`${__dirname}/failure.html`)
      app.post("/failure", function(req, res) {
        res.redirect("/")
      })
    } else {
      console.log(`Total Created: ${resp.total_created}\nTotal Updated: ${resp.total_updated}\nError Count: ${resp.error_count}`);
      console.log(resp.new_members);
      res.sendFile(`${__dirname}/success.html`)
    }
  };

  sub()
})



app.listen(port, function() {
  console.log(`server is running on port ${port}`);
})
