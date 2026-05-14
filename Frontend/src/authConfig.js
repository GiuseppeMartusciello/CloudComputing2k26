/*
 * Configurazione MSAL per Microsoft Entra ID
 */

export const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID, // ID Applicazione (client) di "Bizment-Frontend"
        authority: `https://login.microsoftonline.com/common`, // Permette l'accesso a tutti (Multitenant + Personal)
        redirectUri: window.location.origin, // Prende l'URL corrente (localhost o Azure)
        postLogoutRedirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: "sessionStorage", // Dove salvare il token
        storeAuthStateInCookie: false,
    },
};

// Scope richiesti per ottenere il token per il backend
export const loginRequest = {
    scopes: [import.meta.env.VITE_AZURE_BACKEND_SCOPE], // api://<backend-client-id>/access_as_user
};

export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};
