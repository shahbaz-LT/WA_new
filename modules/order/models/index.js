import mongoose from 'mongoose';
import pkg from 'validator';
const {isMongoId} = pkg;

const orderSchema = mongoose.Schema({
  customer_id: { type: String, 
    ref: 'customers',
    validate: [ isMongoId, 'Invalid MongoId' ],
    required: [true, 'CustomerId required'] },
  source_address: { type: String, required: [true, 'Source Address required'] },
  destination_address: { type: String, required:[true, 'Destination Address required']},
  exact_pickup_pincode : { type: String, required: [true, 'Pickup Pincode required'] },
  exact_destination_pincode : { type: String, required: [true, 'Destination Pincode required'] },
  volume : { type: Number, required: [true, 'Volume required'] },
  weight : { type: Number, required: [true, 'Weight required']},
  first_mile  : {type : Boolean},
  last_mile : {type : Boolean},
  discount : {type: Number},
  premium : {type: Number},
  final_amount : {type: Number},
  estimated_eta : {type: Number},
  cost_estimation: {type: Number},
},
  {
    timestamps: {
      createdAt: 'created_at'
    },
  }
);


const order = mongoose.model('order', orderSchema);
export default order;