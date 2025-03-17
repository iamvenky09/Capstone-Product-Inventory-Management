import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map((users) => {
        const user = users.find(
          (u: any) => u.email === email && u.password === password
        );
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          return true;
        }
        return false;
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
  }


  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  register(user: any): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      switchMap((users) => {
        const existingUser = users.find((u) => u.email === user.email);
        if (existingUser) {
          return throwError(() => new Error('Email already exists! Please use a different email.'));
        }
        return this.http.post(`${this.apiUrl}/users`, user);
      }),
      catchError(this.handleError)
    );
  }
  
  

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Network Error:', error.error);
      return throwError(() => new Error('Network error! Please check your connection.'));
    } else if (error.status >= 400 && error.status < 500) {
      return throwError(() => new Error('Client-side error! Check your request.'));
    } else {
      return throwError(() => new Error('Email already exists! Please use a different email.'));
    }
  }
}
