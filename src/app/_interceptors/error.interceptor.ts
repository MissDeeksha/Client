import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(error => {
        if(error){
          switch(error.status){
            case 400:
              if(error.error.errors){
                  const modelStateErrors = [];
                  for(const key in error.error.errors){
                     if(error.error.errors[key]){
                        modelStateErrors.push(error.error.errors[key])
                      }
                  }
                   throw modelStateErrors.flat();
              }
              else if(typeof(error.error) === 'object'){
                this.toastr.error(error.statusText, error.status);
              }
              else{
                this.toastr.error(error.error, error.status);
              }
              break;
              case 401:
                debugger;
                this.toastr.error(error.statusText, error.status);
                break;
              case 404:
                this.router.navigateByUrl('/not-found');
                break;
              case 500:
                const navigationExtras: NavigationExtras = {state : {error: error.error}}
                this.router.navigateByUrl('/server-error', navigationExtras);
                break;
              default:
                this.toastr.error('something unexpected went wrong');
                break;  
          }
        }
        return throwError(error);
      })
    );
  }
}
