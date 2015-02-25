var MockRequest = function(url, userAgent, ip) {
  this.url = url;
  this.ip = ip;
  this.headers = [];

  this.headers['user-agent'] = userAgent;

}

var MockResponse = function() {
    this.statusValue = "";
    this.url = "";
    this.content = "";
}



MockResponse.prototype.redirect = function(statusValue, url) {
  this.statusValue = statusValue;
  this.url = url;
  return this;

}

MockResponse.prototype.status = function(statusValue) {
  this.statusValue = statusValue;
  return this;

}


MockResponse.prototype.send = function(content) {
  this.content = content;
  return this;

}

module.exports.MockRequest = MockRequest;
module.exports.MockResponse = MockResponse;
