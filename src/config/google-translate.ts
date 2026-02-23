import config from '.';

const { Translate } = require('@google-cloud/translate').v2;

// Initialize the client once
const translate = new Translate({
  projectId: config.google.translate_project_id,
  key: config.google.translate_api_key,
});

export default translate;
