
const faunadb = require('faunadb'),
  q = faunadb.query,
  client = new faunadb.Client({ secret: process.env.FAUNA_KEY })

  function randomString(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async function write(obj) {
    await client.query(
        q.Create(
            q.Collection('embedCollection'),
            { data: obj },
        )
        )
  }

module.exports = async (request, response) => {
var url = decodeURIComponent(request.url);

  console.log("embed created: " + url);

  var requestData = "";
  requestData = request.body;
  console.log(requestData)
    if (requestData != "") {
      try {
        var embedID = randomString(10);
        
        if (!requestData || Object.keys(requestData).length === 0) {
          response.writeHead(400, {
            "Content-Type": "text/json"
          });
          response.end(JSON.stringify({error: 'empty request object'}))
        }

        embedJSON = requestData;

        embedJSON.id = embedID;
  
        await write(embedJSON)

        response.writeHead(200, {
          "Content-Type": "text/json"
        });
        response.end(JSON.stringify(embedJSON));
        console.log("Saved embed at ID: " + embedID);
      } catch (e) {
        response.writeHead(200, {
          "Content-Type": "text/json"
        });
        response.end("Invalid POST JSON." + e);
      }
    } else {
      response.writeHead(200, {
        "Content-Type": "text/json"});
      response.end("Invalid POST JSON.");
    }
}
