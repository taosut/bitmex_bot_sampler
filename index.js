const request = require('request-promise-native')
const crypto = require('crypto')

const apiKey = ''
const apiSecret = ''


const createOrderBody = (order) => {
  if (!order.amount && !order.price && !order.symbol) {
      throw 'Invalid amount for update'
  }

  orderType = getOrderType(order)

  let body = {
      'symbol': order.symbol,
      'orderQty': order.amount,
      'ordType': orderType,
      'text':	'Powered by your awesome crypto-bot watchdog',
  }


  let execInst = getExecInst(order, orderType)
  if(execInst.length > 0) {
    body['execInst'] = execInst.join(',')
  }

  if (orderType === 'Stop') {
      body['stopPx'] = Math.abs(order.price)
  } else if(orderType === 'Limit') {
      body['price'] = Math.abs(order.price)
  }

  body['side'] = order.price < 0 ? 'Sell' : 'Buy'

  if (order.id) {
      body['clOrdID'] = order.id
  }

  return body

}

const getOrderType = (order) => {
  let orderType = undefined

  if(order['type'] == 'limit'){
    orderType = 'Limit'
  }
  if(order['type'] == 'market'){
    orderType = 'Market'
  }

  if(order['type'] == 'stop'){
    orderType = 'Stop'
  }

  if(order['type'] == undefined){
    orderType = 'Limit'
  }

  return orderType
}

const getExecInst = (order, orderType) => {
  let execInst = [];

  if (order.options && order.options.close === true &&  orderType === 'Limit') {
      execInst.push('ReduceOnly')
  }

  if (order.options && order.options.close === true && orderType === 'Stop') {
      execInst.push('Close')
  }

  // we need a trigger; else order is filled directly on: "market sell [short]"
  if (orderType === 'Stop') {
      execInst.push('LastPrice')
  }

  if (order.options && order.options.post_only === true) {
      execInst.push('ParticipateDoNotInitiate')
  }

  return execInst

}
