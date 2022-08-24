import { AuthService } from "src/app/auth/services/auth.service";

export function appInitializer(authService: AuthService) {
    try {
        authService.refreshToken().subscribe({
            error: () => authService.clientSideLogout()
        });

        return () => Promise<null>;
    } catch {
        return () => Promise<null>;
    }
}