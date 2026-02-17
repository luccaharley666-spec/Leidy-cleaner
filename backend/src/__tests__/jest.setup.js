// Jest global setup to provide a safe placeholder object referenced by tests
global.PLACEHOLDER = global.PLACEHOLDER || {}; 
global.PLACEHOLDER.sendNotification = global.PLACEHOLDER.sendNotification || undefined;
global.PLACEHOLDER.getNotifications = global.PLACEHOLDER.getNotifications || undefined;
