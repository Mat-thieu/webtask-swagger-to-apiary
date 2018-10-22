const util = require('util');
const request = require('request-promise-native');
const fury = require('fury');
fury.use(require('fury-adapter-apib-serializer'));
fury.use(require('fury-adapter-swagger'));

// TODO make sure there's a way to keep the original intorudction text.

module.exports = async (context, cb) => {
  const {
    SWAGGER_URL,
    APIARY_AUTH_TOKEN,
    APIARY_ID,
  } = context.secrets;

  const swaggerDocs = await request({
    url: SWAGGER_URL,
    json: true,
  });

  async function submitBlueprint(blueprint) {
    const apiaryRes = await request({
      method: 'POST',
      url: `https://api.apiary.io/blueprint/publish/${APIARY_ID}`,
      json: true,
      body: {
        code: blueprint,
      },
      headers: {
        'Authorization': `Bearer ${APIARY_AUTH_TOKEN}`,
        'Authentication': `Token ${APIARY_AUTH_TOKEN}`,
      }
    });

    cb(null, { data: 'Updated docs!' });
  }

  fury.parse({source: swaggerDocs}, (parseErr, res) => {
    if (parseErr) return console.error({ parseErr });
    fury.serialize({api: res.api}, (serializeErr, blueprint) => {
      if (serializeErr) return console.error({ serializeErr });
      submitBlueprint(blueprint);
    });
  });
};
