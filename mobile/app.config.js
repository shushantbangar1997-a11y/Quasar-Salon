const base = require('./app.json');

module.exports = ({ config }) => {
  const projectId = process.env.EAS_PROJECT_ID;

  // EXPO_PUBLIC_API_BASE_URL is set in the workflow to https://$REPLIT_DEV_DOMAIN
  // and must be set as an EAS secret (EXPO_PUBLIC_API_BASE_URL) for production builds.
  const apiBase = (process.env.EXPO_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  const privacyPolicyUrl = apiBase ? `${apiBase}/privacy-policy` : undefined;

  const expo = {
    ...config,
    ...base.expo,
    ios: {
      ...base.expo.ios,
      ...(privacyPolicyUrl ? { privacyPolicyUrl } : {}),
    },
    android: {
      ...base.expo.android,
      ...(privacyPolicyUrl ? { privacyPolicyUrl } : {}),
    },
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
