const _ = require("lodash");
const services = require("../services/login");

module.exports = {
  createLogin: async (req, res) => {
    const email = _.get(req, "body.email");
    const password = _.get(req, "body.password");

    await services.createLogin(email, password);

    var login = await services.getLogin(email);

    if (!_.isNil(login) && _.isArray(login)) login = login[0];

    res.send(login);
  },

  getLoginByEmail: async (req, res) => {
    const email = _.get(req, "params.email");
    var login = await services.getLogin(email);

    if (!_.isNil(login) && _.isArray(login)) login = login[0];

    res.send(login);
  },

  updateLogin: async (req, res) => {
    const email = _.get(req, "body.email");
    var oParams = new Object();

    _.forIn(req.body, function(value, key) {
      if (!_.isEqual(key, "email"))
        _.set(oParams, key, _.get(req, `body.${key}`));
    });

    if (!_.isNil(oParams)) await services.updateLogin(email, oParams);

    var login = await services.getLogin(req.body.email);

    if (!_.isNil(login) && _.isArray(login)) login = login[0];

    res.send(login);
  }
};
