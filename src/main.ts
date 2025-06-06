import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { HttpEventType, HttpHandlerFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { tap } from 'rxjs';

function loggingInterceptor(request : HttpRequest<unknown>, next : HttpHandlerFn) {
  console.log('Request made with URL:', request.url);
  const req = request.clone({
    // headers: request.headers.set('X-DEBUG', 'Testing')
  });
  return next(req).pipe(
    tap({
      next:event =>{
        if(event.type ===  HttpEventType.Response) {
          console.log('Request sent successfully!');
          console.log('Response status:', event.status);
          console.log('Response body:', event.body);
        }
      }
    })
  )
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([loggingInterceptor])
    )
  ]
}).catch((err) => console.error(err));

// Besides defining HTTP interceptors as functions (which is the modern, recommended way of doing it), you can also define HTTP interceptors via classes.

// For example, the loggingInterceptor from the previous lecture could be defined like this (when using this class-based approach):

// import {
//   HttpEvent,
//   HttpHandler,
//   HttpInterceptor,
//   HttpRequest,
// } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable()
// class LoggingInterceptor implements HttpInterceptor {
//   intercept(req: HttpRequest<unknown>, handler: HttpHandler): Observable<HttpEvent<any>> {
//     console.log('Request URL: ' + req.url);
//     return handler.handle(req);
//   }
// }
// An interceptor defined like this, must be provided in a different way than before though.

// Instead of providing it like this:

// providers: [
//   provideHttpClient(
//     withInterceptors([loggingInterceptor]),
//   )
// ],
// You now must use withInterceptorsFromDi() and set up a custom provider, like this:

// providers: [
//   provideHttpClient(
//     withInterceptorsFromDi()
//   ),
//   { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true }
// ]
