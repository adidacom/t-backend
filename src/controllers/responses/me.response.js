export default function meResponse(user, dashboard) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    companyName: user.companyName,
    city: user.city,
    state: user.state,
    country: user.country,
    industry: user.industry,
    practiceArea: user.practiceArea,
    industriesEnabled: user.industriesEnabled,
    profileComplete: user.isProfileComplete(),
    emailVerified: user.isEmailVerified(),
    preferences: user.preferences,
    subscription: user.subscription,
    searchCount: user.searchCount,
    role: user.role,
    dashboard,
  };
}
