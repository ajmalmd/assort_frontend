let notificationSummary = {};

export const setNotificationSummary = (summary) => {
  notificationSummary = summary;
};

export const getOrgNotificationUnread = (id) => notificationSummary.organizations.filter(o=>o.organization_id===id).unread || 0;