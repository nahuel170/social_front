import React from 'react';
import { Global } from '../../helpers/Global';
import useAuth from '../../hooks/useAuth';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';

export const SubscribeButton = ({ vendedorId, amount }) => {
  const { auth } = useAuth();
  // Hook para verificar el estado de suscripción (implementado más abajo)
  const { isSubscribed } = useSubscriptionStatus(vendedorId);

  const handleSubscription = async () => {
    if (!isSubscribed) {
      // Iniciar el flujo de suscripción (pago recurrente)
      try {
        const data = {
          vendedorId, // ID del vendedor al que se suscribe
          amount,     // Monto de la suscripción (por ejemplo, 100 ARS)
        };

        const response = await fetch(Global.url + 'subscription/create', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify(data),
        });
        const result = await response.json();

        if (result.status === "success") {
          // Redirigir al checkout de Mercado Pago
          window.location.href = result.init_point;
        } else {
          console.error("Error al crear la preferencia:", result);
        }
      } catch (error) {
        console.error("Error al procesar la suscripción:", error);
      }
    } else {
      // Si ya está suscrito, ejecutar la lógica para cancelar la suscripción (cancelar follow)
      console.log("Cancelar suscripción (lógica de cancelación aquí)");
      // Aquí podrías llamar a otro endpoint para cancelar la suscripción
    }
  };

  return (
    <button onClick={handleSubscription}>
      {isSubscribed ? "Cancelar suscripción" : "Suscribirse"}
    </button>
  );
};