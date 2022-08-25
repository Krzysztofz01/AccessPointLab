import { catchError, firstValueFrom, of } from "rxjs";
import { AuthService } from "src/app/auth/services/auth.service";

export function appInitializer(authService: AuthService) {
    const refreshResolveObservable = authService.refreshToken()
        .pipe(catchError((error, result) => { return of(undefined) }))
    
    return (authService.getServerName() !== undefined)
        ? () => firstValueFrom(refreshResolveObservable)
        : () => Promise<null>;
}