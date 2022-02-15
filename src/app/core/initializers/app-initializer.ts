import { firstValueFrom } from "rxjs";
import { AuthService } from "src/app/auth/services/auth.service";

export function appInitializer(authService: AuthService) {
    return () => firstValueFrom(authService.refreshToken());
}