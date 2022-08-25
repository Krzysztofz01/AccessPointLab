import { catchError, firstValueFrom, of } from "rxjs";
import { AuthService } from "src/app/auth/services/auth.service";

export function appInitializer(authService: AuthService) {
    if (authService.getServerName() === undefined) return () => Promise<null>;
    
    const refreshResolveObservable = authService.refreshToken()
        .pipe(catchError((_1, _2) => { 
            authService.clientSideLogout();
            return of(undefined);
        }));
    
 
    return () => (firstValueFrom(refreshResolveObservable).catch((_3) => {
        return () => Promise<null>;
    }));
}