function UpoloadImageToBlob(imageUrl, blobName) {
  // Download the image and upload it to the Blob Storage
  var http = require('http');
  http.get("http://avherald.com/img/france_a319_f-grhx_marseille_160627_1.jpg", function (httpResponse) {
    if (200 !== httpResponse.statusCode) {
      context.log('Unexpected status code: %d', httpResponse.statusCode);
    } else {
        var writeStream = blobService.createWriteStreamToBlockBlob(
            containerName,
            "foto.jpg",
            {
                contentSettings: {
                    contentType: 'text/html'
                }
            },
            function(error, result, response){
                if(error){
                    context.log("Couldn't upload file %s from %s", fileName, domain);
                    context.error(error);
                } else {
                    context.log('File %s from %s uploaded', fileName, domain);
                }
            });
        httpResponse.pipe(writeStream);
    }
  }).on('error', function(e) {
    context.log("Got error: " + e.message);
  });
}

module.exports = async function (context, myQueueItem) {
    context.log('JavaScript queue trigger function processed work item', myQueueItem);

    var options = {
        host: 'www.google.com',
        port: 80,
        path: '/index.html'
    };
      
    // Getting the article nr that we should process
    context.log('JavaScript queue trigger function processed work item', myQueueItem);
    const url = `http://avherald.com/h?article=${myQueueItem}&opt=0`;

    // Getting the HTTP source code
    const puppeteer = require('puppeteer');
    
    puppeteer
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
        context.log(html);
      })
      .catch(function(err) {
        context.log(err)
    });

    // Downloading images and send them to the blob
    var azure = require('azure-storage');
    var imagesAccountName = process.env["imagesAccountName"];
    var imagesAccountKey = process.env["imagesAccountKey"];
    var containerName = 'images';

    // Create the container
    var blobService = azure.createBlobService(imagesAccountName, imagesAccountKey);
    blobService.createContainerIfNotExists(containerName, {
        publicAccessLevel: 'blob'
      }, function(error, result, response) {
        if (!error) {
          // if result = true, container was created.
          // if result = false, container already existed.
        }
    });
};