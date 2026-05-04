import { useEffect } from "react";
import httpClient from "../lib/httpClient";

export default function GoogleAuthCallback() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");

        if (!accessToken) {
            // Sem token — volta à tela de login
            window.location.replace("/");
            return;
        }

        (async () => {
            try {
                // 1. Persiste o accessToken antes de qualquer requisição
                localStorage.setItem("accessToken", accessToken);

                // 2. Busca os dados do usuário autenticado
                const response = await httpClient.get("/api/auth/me");
                const user = response.data;

                // 3. Persiste o usuário no localStorage (padrão do AuthProvider)
                localStorage.setItem("user", JSON.stringify(user));
            } catch {
                // Se falhar, limpa tudo e redireciona para login
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
            } finally {
                // 4. Redireciona para a raiz — o AuthProvider vai ler o localStorage
                window.location.replace("/");
            }
        })();
    }, []);

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#020617",
                gap: "1rem",
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a78bfa"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: "spin 1s linear infinite" }}
            >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <p
                style={{
                    color: "#a78bfa",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    margin: 0,
                }}
            >
                Autenticando com Google...
            </p>
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}