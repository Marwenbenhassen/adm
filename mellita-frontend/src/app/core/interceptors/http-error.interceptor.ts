// src/app/interceptors/http-error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(`[HTTP REQUEST] ${req.method} ${req.url}`);
    
    return next.handle(req).pipe(
      timeout(15000),
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log(`[HTTP RESPONSE] ${event.status} - ${req.url}`);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('[HTTP ERROR]', error);
        
        let errorMessage = 'Une erreur est survenue';
        
        if (error.status === 0) {
          errorMessage = '❌ Impossible de se connecter au serveur. Vérifiez que le backend est démarré (mvn spring-boot:run)';
        } else if (error.status === 200) {
          errorMessage = '⚠️ Le serveur a retourné une réponse invalide (format JSON incorrect)';
        } else if (error.status === 401) {
          errorMessage = '🔒 Session expirée. Veuillez vous reconnecter.';
        } else if (error.status === 403) {
          errorMessage = '⛔ Accès non autorisé.';
        } else if (error.status === 404) {
          errorMessage = '🔍 Service non trouvé. Vérifiez l\'URL de l\'API.';
        } else if (error.status >= 500) {
          errorMessage = '💥 Erreur serveur. Contactez l\'administrateur.';
        }
        
        // Afficher l'erreur dans la console
        console.error(`[ERROR] ${errorMessage}`);
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}