import CustomerHandler from './handlers/customerHandler.js';

export default {
  init: app => {
    CustomerHandler.init(app);
  },
};

