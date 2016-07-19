function LicenseQueue() {
}

function  = function() {
   var ItemSense = require('itemsense-node');
   var itemsenseConfiguration = {
      username: 'listener',
      password: 'costco999',
      itemSenseUrl = 'http://172.24.142.95/itemsense'
   };
   var licenseQueueConfiguration = {zoneTransitionsOnly: false};

   itemsenseApi.messageQueue.configure(licenseQueueConfiguration);
   .then(
      function(response) {
         console.log('itemsense queue success: ', response);
      },
      function(error) {
         console.log('itemsense queue error: ', error);
      }
   );
};

LicenseQueue.prototype.setQueue = function(queue) {
   this.queue = queue;
};

function subscribe(itemSenseQueue) {
   var user = 'listener';
   var pass = 'costco999';
   var amqp = require('amqplib');
   var URL = require('url');
   var parts = URL.parse(itemSenseQueue.serverUrl, true);
   var protocol = parts.protocol;
   var host = parts.hostname;
   var port = parseInt(parts.port) || ((protocol === 'amqp:') ? 5672 : 5671);
   var vhost = parts.pathname ? parts.pathname.substr(1) : null;
   var amqpUrl = protocol + '//' + user + ':' + pass + '@'
      + host + ':' + port + '/' + vhost;

   console.log(amqpUrl);

   amqp.connect(amqpUrl).then(
      function(response) {
         return response.createChannel();
      },
      function(error) {
         console.log(error);
      }
   ).then(
      function(response) {
         console.log(response);
      }
   );
};

module.exports = {
   LicenseQueue: LicenseQueue
};
