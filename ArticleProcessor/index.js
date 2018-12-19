module.exports = async function (context, myQueueItem) {
    context.log('JavaScript queue trigger function processed work item', myQueueItem);

    var options = {
        host: 'www.google.com',
        port: 80,
        path: '/index.html'
    };
      
    context.log('JavaScript queue trigger function processed work item', myQueueItem);
    const url = 'http://avherald.com/h?article=4c1c52bc&opt=0';

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
};