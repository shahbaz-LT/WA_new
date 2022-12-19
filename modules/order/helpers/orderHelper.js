import order from '../models/index.js';

class OrderHelper {

  async createOrderFromStringArray(msgArr) {
    const result = {
      'status': 400,
      'message': 'Missing Paramters',
    };

    let arrSize = msgArr.length;

    if (arrSize < 7) {
      return result;
    }

    if (arrSize > 7) {
      result.message = "Too many parameters to create order";
      return result;
    }

    const body = {};
    body['customer_id'] = msgArr[0];
    body['source_address'] = msgArr[1];
    body['destination_address'] = msgArr[2];
    body['exact_pickup_pincode'] = msgArr[3];
    body['exact_destination_pincode'] = msgArr[4];
    body['volume'] = parseInt(msgArr[5]);
    body['weight'] = parseInt(msgArr[6]);

    try{
      const newOrder = await order.create(body);
      result.status = 200;
      result.message = "Success";
      result['_id'] = newOrder._id;
    }
    catch(err){
      result.message = err.message;
    }

    return result;
  }
}


export default new OrderHelper();