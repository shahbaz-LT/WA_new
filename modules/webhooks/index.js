import WebhooksHandler from './handlers/webhooksHandler.js';

export default {
  init: app => {
    WebhooksHandler.init(app);
  },
};

