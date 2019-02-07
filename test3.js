const talib = require('talib')
const request = require('request-promise-native')
const WebSocket = require('ws');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
var bodyParser = require("body-parser");
var crypto = require('crypto')

const apiKey = {

                key :'FESoGY6GyzOUxPTaGu2ffJun',
                secret:'_z1wXdGHULlooE9wy8FMp7NXtGu2ve6BzABtTtqny7MMEcNc',
                path : {
                    orders : '/api/v1/order',
                    position : '/api/v1/position',
                    balance : '/api/v1/user/margin',
                }


}


const endpoint = 'https://testnet.bitmex.com'

var app = express();
//var io = require('socket.io')(app);
const http = require('http')
var server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))

app.use(express.static(path.join(__dirname, 'public')))
 // .set('views', path.join(__dirname, 'views'))
  //.set('view engine', 'ejs')
  //.get('/', (req, res) => res.render('pages/index'))
 .get("/", function(req, res) {

 	res.send("pong");
 	res.end()
 })


 function buildRequestQuery(data, command, method){

   expires = Math.round(new Date().getTime() / 1000) + 60 // 1 min in the future
   var postBody = JSON.stringify(data);
   var signature = crypto
                   .createHmac('sha256', apiKey['secret'])
                   .update(method + apiKey['path'][command] + expires + postBody)
                   .digest('hex');


   var headers = {
     'content-type' : 'application/json',
     'Accept': 'application/json',
     'X-Requested-With': 'XMLHttpRequest',
     'api-expires': expires,
     'api-key': apiKey['key'],
     'api-signature': signature
   };

   const requestOptions = {
     headers: headers,
     url:endpoint+apiKey['path'][command],
     method: method,
     body: postBody
   };

   return requestOptions

 }


 app.get("/position", function(req,res){
   data = {}
   result = buildRequestQuery(data, 'position', 'GET')
   request(result, function(error, response, body) {
 if (error) { console.log(error); }
 res.send(body);
 });


 })
 app.get("/balance", function(req,res){
   data = {"currency":"all"}
   result = buildRequestQuery(data, 'balance','GET')
   request(result, function(error, response, body) {
 if (error) { console.log(error); }
 res.send(body);
 });


 })




//connected to ws
//get 200 last prices
//get latest last price from ws
//put into list delete the oldest
//calculate the latest rsi
//sends away!


const dd =async ()=>{
  obj = {
    method : 'GET',
    uri : 'https://www.bitmex.com/api/v1/trade/bucketed?binSize=1m&partial=false&count=200&reverse=true&symbol=XBTUSD'
  }
  result=  await request(obj)


    _list = JSON.parse(result).reverse();
    close =[]
    for(let _property in _list){
      close.push(_list[_property]['close']);
    }

    return await close
}


const cc = async (url="wss://www.bitmex.com/realtime?subscribe=tradeBin1m:XBTUSD")=>{
  const ws = new WebSocket(url)
  recent = await dd()

ws.on('message', function incoming(data) {
      obj = JSON.parse(data);
      if (obj.table){
        close = obj.data[0].close
        recent.push(close)
        recent.shift()


         talib.execute({
            name: "RSI",
            startIdx: 0,
            endIdx: recent.length - 1,//min length = 15
            inReal: recent,
            optInTimePeriod: 14
        }, function (err, result) {

            // Show the result array
            console.log("RSI Function Results:");
            console.log((result.result.outReal.toString()));
        })
        console.log(dd);



        //  talib.execute({
        //     name: "SMA",
        //     startIdx: 0,
        //     endIdx: recent.length - 1,//min length = 15
        //     inReal: recent,
        //     optInTimePeriod: 20
        // }, function (err, result) {
        //
        //     // Show the result array
        //     console.log("SMA Function Results:");
        //     console.log((result.result.outReal.toString()));
        // })



        // talib.execute({
        //     name: "EMA",
        //     startIdx: 0,
        //     endIdx: recent.length - 1,//min length = 15
        //     inReal: recent,
        //     optInTimePeriod: 20
        // }, function (err, result) {
        //
        //     // Show the result array
        //     console.log("EMA Function Results:");
        //     console.log((result.result.outReal.toString()));
        // })
          }

  });

}


app.get("/test", function(req,res){
  const getbit = async (url="wss://www.bitmex.com/realtime?subscribe=tradeBin1m:XBTUSD")=>{
    const ws = new WebSocket(url)
    recent = await dd()

  ws.on('message', function incoming(data) {
        obj = JSON.parse(data);
        if (obj.table){
          close = obj.data[0].close
          console.log(close);
          recent.push(close)
          recent.shift()


          talib.execute({
              name: "RSI",
              startIdx: 0,
              endIdx: recent.length - 1,//min length = 15
              inReal: recent,
              optInTimePeriod: 14
          }, function (err, result) {

              // Show the result array
              console.log("RSI Function Results:");
              res.write((result.result.outReal.toString()));

          })

            }

    });

  }
  getbit()

})
