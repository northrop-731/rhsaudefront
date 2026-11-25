/*import type { LoginData, LoginResponse } from "../types/auth.types";
import { api } from "./api";

export async function loginRequest(data: LoginData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth", data);
    return response.data;
} */

import type { LoginData, LoginResponse } from "../types/auth.types";

// autenticação mock para o desenvolvimento do front
export async function loginRequest(
    data: LoginData
): Promise<LoginResponse> {
    // simular o delay de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        user: {
            name: "Administrador",
            email: data.email,
            role: "admin",
        },
        token: "mock-token-123",
    };
}