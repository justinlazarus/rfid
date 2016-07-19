var itemSenseApi = require('itemsense-node');
var request = require('request');
var amqp = require('amqplib'); 
var urlTools = require('url');
var queue = '';

function subscribeToLicenseQueue() {
   var config = {
      username: 'listener',
      password: 'costco999',
      itemsenseUrl: 'http://172.24.142.95/itemsense'
   };
   var itemsense = new itemSenseApi(config);
   var licenseQueueConfig = {zoneTransitionsOnly: false};

   itemsense.messageQueue.configure(licenseQueueConfig)
   .then(
      function(response) {
         console.log('itemsense message queue success: ', response);
         connectToLicenseQueue(response);
      },
      function(error) {
         console.log('itemsense message queue error: ' , error)
      }
   );
}

function connectToLicenseQueue(itemsense) {
   queue = itemsense.queue;
   var parts = urlTools.parse(itemsense.serverUrl);
   var queueUrl = {
      protocol: 'amqp',
      hostname: parts.hostname,
      port: parseInt(parts.port),
      username: 'listener',
      password: 'costco999'
   };

   amqp.connect(queueUrl)
   .then(
      function(connection) {
         return connection.createChannel()
         .then(
            function(channel) {
               return channel.consume(queue, function(message) {
                  console.log(message.content.toString());
                  channel.ack(message);
               });
            },
            function(error) {
               console.log('amqp channel error: ', error);
            }
         );
      },
      function(error) {
         console.log('ampq connection error: ', error);
      }
   );
}

/**
 * Sends a collection of license keys to the 'sendLicense' REST endpoint
 */
function sendReadsToWSS() {
   var webServicesServer = 'http://dev400:10010';
   var sendLicenseService = '/web/services/INS042/sendLicense/';
   var licenses = getLicenses();

   if (licenses) {
      licenses.forEach(function(license) {
         request(webServicesServer + sendLicenseService + license,
         function(error, response, body) {
            console.log(body);
         });
      });
   };
}

/**
 * Gets any license reads from the 'Items' endpoint of the itemSense API.
 * The response returns a collection of item objects and a nextPageMarker
 * to handle pagination. 
 */
function getLicenses() {
   var config = {
      username: 'listener',
      password: 'costco999',
      itemsenseUrl: 'http://172.24.142.95/itemsense'
   };
   var itemsense = new ItemSense(config);

   itemsense.items.get().then(function(response) {
      return response.items;
   });
}

function getReads() {
  return [
     '385001714789717',
     '385001714790499'
  ];
}

module.exports = {
   sendReadsToWSS: sendReadsToWSS,
   subscribeToLicenseQueue: subscribeToLicenseQueue
};
