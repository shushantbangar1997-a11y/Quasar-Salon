const base = require('./app.json');

module.exports = ({ config }) => {
  const projectId = process.env.EAS_PROJECT_ID;

  const expo = {
    ...config,
    ...base.expo,
    extra: {
      ...(base.expo.extra ?? {}),
      eas: projectId ? { projectId } : undefined,
    },
  };

  if (!projectId) {
    delete expo.extra.eas;
  }

  return { ...config, ...expo };
};
