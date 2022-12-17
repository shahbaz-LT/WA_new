import mongoose from 'mongoose';
import pkg from 'validator';
const {isEmail, isMobilePhone} = pkg;

const brokerSchema = mongoose.Schema({
  name: { type: String, required: [true, 'User Name required'] },
  phone: {
    type: Number,
    validate: [ isMobilePhone, 'Invalid phone number' ],
    required: [true, 'User phone number required'],
    unique: [true, 'Phone number Already Exists']
  },
  email: {
    type: String,
    required: [true, 'User Email required'],
    validate: [ isEmail, 'Invalid email address' ],
    unique: [true, 'Email ID Already Exists']
  }
},
  {
    timestamps: {
      createdAt: 'created_at'
    },
  }
);

module.exports = mongoose.model('broker', brokerSchema);