import {
  Navigate,
} from "react-router-dom";

export function handleApiError(error,showLogin) {
  if (error.status === 401) {
    alert("Sessione scaduta. Effettua nuovamente il login.");
    showLogin();
  } else if (error.status === 400) {
    alert(error.message || "Richiesta non valida.");
  } else if (error.status === 409) {
    alert("Questo account risulta già registrato.");
  }
  else {
    alert("Si è verificato un errore imprevisto. Prova a ricaricare la pagina");
  }
}
