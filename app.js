// create modules for use
const express = require("express");
const bodyParse = require("body-parser");
const https = require("https");

const app = express();
app.use(bodyParse.urlencoded({extend: true}));

// set up app to use static resource in local drive
// provide path for static files
app.use(express.static("public"));

app.get("/", function (req, res){
  console.log(" get endpoint running");
  res.sendFile(__dirname + "/signup.html");
});

// post user input data to mail chimp server
app.post("/", function (req, res) {
  // using body parser to parse input data by name attribute in request body
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;
  // assemble data based on api documentation by mailchimp
  // https://mailchimp.com/developer/marketing/api/abuse-reports/
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        // set up merge_field per MERGEO info
        // https://us21.admin.mailchimp.com/lists/settings/merge-tags?id=2157
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };
  // convert user input to json format
  const jsonData = JSON.stringify(data);
  // send request to mailchimp msapplication
  // https://nodejs.org/api/https.html#httpsrequesturl-options-callback
  // last portion is audience list id from mailchimp
  const url = "https://us21.api.mailchimp.com/3.0/lists/9228a05d57";
  // compose options for https request method as doc in nodejs in link above
  // api key for mailchimp
  // b46de64179e2c7003212665906a1548e-us21
  const options = {
    method: "POST",
    auth: "wan:b46de64179e2c7003212665906a1548e-us21"
  };
  // make assemble request as required by https module
  // https://nodejs.org/api/https.html#httpsrequesturl-options-callback
  // https://stackoverflow.com/questions/40537749/how-do-i-make-a-https-post-in-node-js-without-any-third-party-module
  // call back function will be executed when response received
  const request = https.request(url, options, function(response) {
    // display page base on resposnse from api call
    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }
    // print response body once received
    response.on("data", function(data) {
      // from hex to string
      console.log(JSON.parse(data));
    });
  });
  // write request data in request and send request to api endpoint in mailchimp
  request.write(jsonData);
  request.end();

  const statusCode = res.statusCode;
});

// when click the button with post method
// will call this endpoint and redirect to home route if reached endponint /failure
app.post("/failure", function(req, res) {
  res.redirect("/");
});

// use port dynamically assigned by heroku after deployment or 3000 when locally
app.listen(process.env.PORT || 3000, function (req, res) {
  console.log("Server up and running on port 3000");
});
