import React, { useCallback } from "react";
import uniqid from "uniqid";
import useSyncedLocalState from "./../../hooks/useSyncedLocalState";

const NotificationsContext = React.createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useSyncedLocalState("notifications", []);
  const [unseenNotifications, setUnseenNotifications] = useSyncedLocalState(
    "Unseen-notifications",
    []
  );

  const addNotification = useCallback(
    async (noti, status, nameSuffix, text) => {
      await new Promise((resolve, reject) => {
        try {
          const newNotifications = [...unseenNotifications];

          newNotifications.push(noti);

          const existingNotifications = [...notifications];
          noti.date = new Date();
          noti.key = uniqid(noti.id, new Date().getTime()) + status;
          noti.status = status;
          noti.nameSuffix = nameSuffix;
          noti.text = text;

          existingNotifications.unshift(noti);

          if (existingNotifications && existingNotifications.length > 101)
            existingNotifications.splice(100);

          resolve({ notifications: existingNotifications, newNotifications });
        } catch (e) {
          console.log("addNotification error", e);
          reject(e);
        }
      }).then((res) => {
        setUnseenNotifications(res.newNotifications);
        setNotifications(res.notifications);
      });
    },
    [notifications, setNotifications, setUnseenNotifications, unseenNotifications]
  );

  const clearUnseenNotifications = useCallback(() => {
    setUnseenNotifications([]);
  }, [setUnseenNotifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnseenNotifications([]);
  }, [setNotifications, setUnseenNotifications]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications: notifications,
        addNotification: addNotification,
        clearNotifications: clearNotifications,
        unseenNotifications: unseenNotifications,
        setUnseenNotifications: setUnseenNotifications,
        clearUnseenNotifications,
      }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsContext;
