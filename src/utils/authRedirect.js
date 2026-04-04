const VALID_SUBSCRIPTIONS = ["ACTIVE", "TRIAL"];

export const getPostLoginRoute = (organizations) => {
  if (!organizations || organizations.length === 0) {
    return "/create-organization";
  }

  if (organizations.length > 1) {
    return "/workspaces";
  }

  const org = organizations[0];

  if (org.role === "OWNER") {
    if (!org.is_profile_completed) {
      return "/onboarding/profile";
    }

    if (!VALID_SUBSCRIPTIONS.includes(org.subscription_status)) {
      return "/onboarding/subscription";
    }
  }

  return "/app";
};