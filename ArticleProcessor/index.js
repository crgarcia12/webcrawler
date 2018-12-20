function UpoloadImageToBlob(imageUrl, containerName, blobName) {
  var blobService = CreateBlobService(containerName);

  // Download the image and upload it to the Blob Storage
  var http = require('http');
  http.get(imageUrl, function (httpResponse) {
    if (200 !== httpResponse.statusCode) {
      context.log('Unexpected status code: %d', httpResponse.statusCode);
    } else {
        var writeStream = blobService.createWriteStreamToBlockBlob(
            containerName,
            blobName,
            {
                contentSettings: {
                    contentType: 'text/html'
                }
            },
            function(error, result, response){
                if(error){
                    context.log("Couldn't upload file %s from %s", blobName, imageUrl);
                    context.error(error);
                } else {
                    context.log('File %s from %s uploaded', blobName, imageUrl);
                }
            });
        httpResponse.pipe(writeStream);
    }
  }).on('error', function(e) {
    context.log("Got error: " + e.message);
  });
}

function DownloadWebPageProcessedSourceCode(url) {
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

function CreateBlobService (containerName){
  var azure = require('azure-storage');
  var imagesAccountName = process.env["imagesAccountName"];
  var imagesAccountKey = process.env["imagesAccountKey"];


  // Create the container if it does not exist
  var blobService = azure.createBlobService(imagesAccountName, imagesAccountKey);
  blobService.createContainerIfNotExists(containerName, {
      publicAccessLevel: 'blob'
    }, function(error, result, response) {
      if (!error) {
        // if result = true, container was created.
        // if result = false, container already existed.
      }
  });
  return blobService;
}

module.exports = async function (context, myQueueItem) {
    var containerName = 'images';

    // Getting the article nr that we should process
    context.log('JavaScript queue trigger function processed work item', myQueueItem);
    const url = `http://avherald.com/h?article=${myQueueItem}&opt=0`;

    // Download HTML code and execute all the JS on it. We need a full DOM
    var htmlCode = DownloadWebPageProcessedSourceCode(url)
    .then(function(htmlContent) {
      var imageUrls = htmlContent.match('http://avherald.com\\/img\\/[\\w-_.]+');
      context.log(imageUrls);
      return imageUrls;
    }).then(function(imageUrls) {
      imageUrls.forEach(url => {
        UpoloadImageToBlob(url, containerName, "foto2.jpg");
      });
    });

    // Create a blob service and make sure the container is in place
    //



};