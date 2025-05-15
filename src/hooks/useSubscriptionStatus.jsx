import { useState, useEffect } from 'react';
import { Global } from '../helpers/Global';

export const useSubscriptionStatus = (vendedorId) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${Global.url}subscription/status?vendedorId=${vendedorId}`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        const data = await response.json();
        if (data.status === "success") {
          setIsSubscribed(data.isSubscribed);
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      }
    };

    fetchStatus();
  }, [vendedorId]);

  return { isSubscribed };
};