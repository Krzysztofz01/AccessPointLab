import { catchError, firstValueFrom, of } from "rxjs";
import { AuthService } from "src/app/auth/services/auth.service";

export function appInitializer(authService: AuthService) {
    const refreshResolveObservable = authService.refreshToken()
        .pipe(catchError((_1, _2) => { 
            authService.clientSideLogout();
            return of(undefined);
        }))
    
    return (authService.getServerName() !== undefined)
        ? () => firstValueFrom(refreshResolveObservable)
        : () => Promise<null>;
}