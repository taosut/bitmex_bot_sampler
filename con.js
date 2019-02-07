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




var cors = require('cors');
app.use(cors({credentials: true, origin: '*'}));

app.get("/api/iv", function(req, res) {

	var implied = iv.getImpliedVolatility(2, 101, 100, .1, .0015, "call");

	res.send({msg:implied})

	return;
});




//Ignore this
function findPattern(whenSubject, preposition, prepositionObject, secondSubject, doesWhat){
	//loook at data for this event
}

/*
close processed
{"e":"bitmex-testnet", "s":"ethusd", "c":"position", "p":"100"}

market-buy processed
{"e":"bitmex-testnet", "s":"ethusd", "b":"Buy", "t":"market", "q":"1"}
market-sell processed
{"e":"bitmex-testnet", "s":"ethusd", "b":"Sell", "t":"market", "q":"1"}


limit-buy Processed
{"e":"bitmex-testnet", "s":"ethusd", "b":"Buy", "t":"limit", "q":"1", "p":"115.35"}
limit-sell Processed
{"e":"bitmex-testnet", "s":"ethusd", "b":"Sell", "t":"limit", "q":"1", "p":"115.35"}
*/

function convert(payload){
  guide = {
    symbol : payload.s.toUpperCase(),
  }

  if (payload.c){
      guide["execInst"] = "Close",
      guide["price"] = payload.p
  }
  if (payload.b && payload.t == 'market'){
    guide["orderQty"] = payload.q
    guide["ordType"] = "Market"
    guide["side"] = payload.b

  }
  if (payload.b && payload.t == 'limit'){
    //    guide["side"] = payload.b
    guide["side"] = payload.b
    guide['price'] = payload.p
    guide["orderQty"] = payload.q
    guide["ordType"] = "Limit"
  }
  return guide
  }




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


app.get("/payload/:payload", function(req, res){

  payload = req.params.payload

  if (payload.includes("favicon")==false){
    order = JSON.parse(payload)
    converted = convert(order)
    result = buildRequestQuery(converted, 'orders', 'POST')

    request(result, function(error, response, body) {
  if (error) { console.log(error); }
  console.log(body);
  res.send(body)
});


  }
})




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
