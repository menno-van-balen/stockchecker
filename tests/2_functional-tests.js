const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  test('1 stock', function(done) {
  chai.request(server)
    .get('/api/stock-prices')
    .query({stock: 'goog'})
    .end(function(err, res){
      assert.equal(res.body['stockData']['stock'], 'GOOG');
      assert.isNotNull(res.body['stockData']['price']);
      assert.isNotNull(res.body['stockData']['likes']);
      done();
    });
  });

  test('1 stock with like', function(done) {
    chai.request(server)
    .get('/api/stock-prices')
    .query({stock: 'aapl', like: true})
    .end(function(err, res){
      assert.equal(res.body['stockData']['stock'], 'AAPL');
      assert.equal(res.body['stockData']['likes'], 1);
      done();
    });
  });

  test('Same stock with like again (ensure likes arent double counted)', function(done) {
    chai.request(server)
    .get('/api/stock-prices')
    .query({stock: 'aapl', like: true})
    .end(function(err, res){
      assert.equal(res.body['stockData']['stock'], 'AAPL');
      assert.equal(res.body['stockData']['likes'], 1);
      done();
    });
  });

  test('2 stocks not liked', function(done) {
    chai.request(server)
    .get('/api/stock-prices')
    .query({stock: ['aapl', 'amzn']})
    .end(function(err, res){
      let stockData = res.body['stockData']
      assert.isArray(stockData)
      assert.equal(stockData[0]['stock'], 'AAPL')
      assert.equal(stockData[0]['rel_likes'], 1)
      assert.equal(stockData[1]['stock'], 'AMZN')
      assert.equal(stockData[1]['rel_likes'], -1)
      done()
    });
  });
  
  test('2 stocks with like', function(done) {
    chai.request(server)
    .get('/api/stock-prices')
    .query({stock: ['aapl', 'amzn'], like: true})
    .end(function(err, res){
      let stockData = res.body['stockData']
      assert.isArray(stockData)
      assert.equal(stockData[0]['stock'], 'AAPL')
      assert.equal(stockData[0]['rel_likes'], 0)
      assert.equal(stockData[1]['stock'], 'AMZN')
      assert.equal(stockData[1]['rel_likes'], 0)
      done()
    });
  });

});
