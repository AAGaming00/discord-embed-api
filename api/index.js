const faunadb = require('faunadb'),
  q = faunadb.query,
  client = new faunadb.Client({ secret: process.env.FAUNA_KEY })

  async function get(id) {
    let settings;
    try {
        settings = await client.query(
            q.Get(
                q.Match(
                    q.Index("embedIndex"),
                    id
                )
            )
        ) 
        } catch (error) {
            return false
        }
    return settings
  }

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = async (request, response) => {
      const url = request.url
      var embedID = url.replace('/', '').replace('embed/', '').replace(".json", "");
      if (request.headers["user-agent"].includes('Discordbot')) {
      console.log("User requested an embed: " + embedID);

      try {
        const embedreq = await get(embedID)
        const embed = embedreq.data
        console.log(embed)
        if (!url.endsWith(".json")) {
          if (embed) {
            var html =
              `
      <title>` +
              (escapeHtml(embed.title) +
              `</title>` || '') + `
      <meta content="` +
              (escapeHtml(embed.description) +
              `" property="og:description">
			<meta content="` || '') +
              ((escapeHtml(embed.image) || 'https://img.bigdumb.gq/1x1.png') +
              `" property="og:image">` || '') + `
			<link type="application/json+oembed" href="https://em.bigdumb.gq/embed/` +
              embedID +
              `.json" />
			<meta content="` +
              (escapeHtml(embed.color) +
              `" name="theme-color">
      ` || '') +
              (embed.banner
                ? `<meta name="twitter:card" content="summary_large_image">`
                : "");
            response.writeHead(200, {
              "Content-Type": "text/html"
            });
            response.end(html + "This page isn't meant to be viewed by users.");
          } else {
            response.writeHead(200, {
              "Content-Type": "text/html"
            });
            response.end("This page isn't meant to be viewed by users.");
          }
        } else {
          var json = {
            title: embed.title,
            description: embed.description,
            author_name: embed.authorName,
            author_url: embed.authorUrl,
            provider_name: embed.providerName,
            provider_url: embed.providerUrl,
            type: embed.type || embed.description || (embed.providerName && !(embed.authorName || embed.title || embed.description)) ? embed.type || embed.description || undefined : 'photo'
          };
          response.writeHead(200, {
            "Content-Type": "text/json"
          });
          response.end(JSON.stringify(json, null, 2));
        }
      } catch (e) {
        console.error(e);

        response.writeHead(200, {
          "Content-Type": "text/html"
        });
        response.end("The embed you requested is invalid or no longer exists." + e);
      }
    } else{
      response.writeHead(200, {
        "Content-Type": "text/html"
      });
      response.end("This page isn't meant to be viewed by users.");
    }
    }

console.log("Server started!");
