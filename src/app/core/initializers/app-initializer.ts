import { catchError, firstValueFrom, of } from "rxjs";
import { AuthService } from "src/app/auth/services/auth.service";

export function appInitializer(authService: AuthService) {
    if (authService.getServerName() === undefined) return () => Promise<null>;
    
    const refreshResolveObservable = authService.refreshToken()
        .pipe(catchError((_) => {
            authService.clientSideLogout();
            // TODO: Maybe still return the original error?
            return of(null)
        }));
        
    return () => (firstValueFrom(refreshResolveObservable).catch((_3) => {
        return () => Promise<null>;
    }));
}