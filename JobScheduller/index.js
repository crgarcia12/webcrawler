function DownloadWebPageProcessedSourceCode(context, url) {
    // Getting the HTTP source code
    const puppeteer = require('puppeteer');
      
    return puppeteer
      .launch()
      .then(function(browser) {
        return browser.newPage();
      })
      .then(function(page) {
        return page.goto(url).then(function() {
          return page.content();
        });
      })
      .then(function(html) {
        return html;
      })
      .catch(function(err) {
        context.log(err)
    });
  }
  
function AddMessageToQueue(context, articleId, articleNumber) {
    var azure = require('azure-storage');
    var imagesAccountName = process.env["imagesAccountName"];
    var imagesAccountKey = process.env["imagesAccountKey"];

    var queueSvc = azure.createQueueService(imagesAccountName, imagesAccountKey);

    var articleMessage = {
        ArticleId : articleId,
        ArticleNumber : articleNumber
    };

    var serializedMessage = JSON.stringify(articleMessage);
    var encodedMessage = Buffer.from(serializedMessage).toString("base64");
    queueSvc.createMessage('articlestoprocess', encodedMessage, function(error, results, response){
        if(!error){
            context.log(error);
        }
    });
}

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    DownloadWebPageProcessedSourceCode(context, "http://avherald.com")
    .then(function(htmlContent){
        var articleIds = new Array();
        //http://avherald.com/h?article=40fc7579/0002&amp;=0
        var regExPattern = new RegExp("article=([\\w-_.\\/]+)&amp;opt=0", "g");
        while(match = regExPattern.exec(htmlContent)) {
            articleIds.push(match[1]);
        }
        return articleIds;
    }).then(function(articleIds){
        var articleNumber = 1;
        articleIds.forEach(articleId => {
            AddMessageToQueue(context, articleId, articleNumber++);
        });
    });

    if (req.query.name || (req.body && req.body.name)) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Hello " + (req.query.name || req.body.name)
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
};