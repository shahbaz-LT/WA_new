import order from '../models/index.js';

class OrderHandler {
  async create(req,res,next){
    try {
      const body = req.body;
      const resp = await order.create(body);
      res.status(200).json({ message: resp});
      //next();
    }
    catch (err) {
      res.status(400).json({ message: err.message});
    }
  }

  init(app) {
    app.post('/api/order', this.create);
  }
}

export default new OrderHandler();