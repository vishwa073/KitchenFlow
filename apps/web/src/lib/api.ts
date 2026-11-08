// import { useAuth } from "@clerk/react";

// const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// export function useApi() {
//   const { getToken } = useAuth();

//   async function apiFetch(
//     path: string,
//     options: RequestInit = {},
//   ): Promise<Response> {
//     const token = await getToken();
    

//     const headers = new Headers(options.headers);

//     if (token) {
//       headers.set("Authorization", `Bearer ${token}`);
//     }

//     if (options.body && !headers.has("Content-Type")) {
//       headers.set("Content-Type", "application/json");
//     }

//     return fetch(`${API_URL}${path}`, {
//       ...options,
//       headers,
//     });
//   }

//   return { apiFetch };
// }older one is important still adding new for checking


import { useCallback } from "react";
import { useAuth } from "@clerk/react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export function useApi() {
  const { getToken } = useAuth();

  const apiFetch = useCallback(
    async (
      path: string,
      options: RequestInit = {},
    ): Promise<Response> => {
      const token = await getToken();

      const headers = new Headers(options.headers);

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      return fetch(`${API_URL}${path}`, {
        ...options,
        headers,
      });
    },
    [getToken],
  );

  return { apiFetch };
}
