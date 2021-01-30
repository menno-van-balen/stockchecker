// 'use strict';
const fetch = require('node-fetch');
const Stocks = require("../models/StocksModel");


module.exports = function (app) {


  app.route('/api/stock-prices')
    .get(function (req, res){
      // Assing variables
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const {stock, like} = req.query;

      // Actions if req for one stock or for two
      if (typeof stock === "string") { 
        fetchStockPrice(stock).then((data) => {
         setAndGetLikes(ip, data.stock, like).then(likes => {
         sendRes(res, data.stock, data.price, likes);
         })
        }).catch(error => {
          res.json({ error });
        });
      } else {
        Promise.all([fetchStockPrice(stock[0]), fetchStockPrice(stock[1])]).then((data) => {
          Promise.all([setAndGetLikes(ip, data[0].stock, like), setAndGetLikes(ip, data[1].stock, like)]).then(likes => {
            sendRes(res, [data[0].stock, data[1].stock], [data[0].price, data[1].price], [likes[0], likes[1]]);
          })
        }).catch(error => {
          res.json({ error }); 
        });
      };
    })    
};


// Helper functions
// This function returns the stock price
async function fetchStockPrice(stock) {
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
  const respons = await fetch(url);
  const result = await respons.json();

  if (result === "Unknown symbol") return { stock: result };

  return {
    stock: result.symbol,
    price: result.latestPrice
  }
}

// this function returns the amount of likes
async function setAndGetLikes(ip, stock, isLiked) {
  return await Stocks.findOne({ stock })
    .exec()
    .then(doc => {
      if (doc) {
        // TODO
        if (isLiked && !doc.ips.includes(ip)) {
          const likes = doc.likes + 1;

          doc.ips.push(ip);
          doc.likes += 1;
          doc
            .save()
            .catch(error => {
              console.log(error);
            });

          return likes;
        } else {
          return doc.likes;
        }
      } else {
        if (isLiked) {
          const stocks = new Stocks({
            stock,
            likes: 1,
            ips: [ip]
          });
          stocks
            .save()
            .catch(error => console.log(error));

          return 1;
        } else {
          const stocks = new Stocks({
            stock,
            likes: 0,
            ips: []
          });
          stocks
            .save()
            .catch(error => console.log(error));

          return 0;
        }
      }
    })

}

// This function creates the respons object and sends it
function sendRes(res, stock, price, likes) {
  if (typeof stock === "string") {
    res.json({
        stockData: {
          stock: stock,
          price: price,
          likes: likes
        }       
    });
  } else {
    res.json({
      stockData: [
        {
          stock: stock[0],
          price: price[0],
          rel_likes: likes[0] - likes[1]
        },
        {
          stock: stock[1],
          price: price[1],
          rel_likes: likes[1] - likes[0]
        }
      ]
    })
  }
}
