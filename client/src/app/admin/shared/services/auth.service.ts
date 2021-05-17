import { Injectable } from "@angular/core";
import {HttpClient, HttpErrorResponse} from '@angular/common/http'
import { dbAuthResponse, User } from "../../../shared/interfaces";
import { Observable, Subject, throwError } from "rxjs";
import {catchError, tap} from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable() 

export class AuthService {

    public error$: Subject<string> = new Subject<string>()

    constructor(private http: HttpClient) {}

    get token(): string | null{
        const expDate = new Date("localStorage.getItem('db-token-exp')")
        if (new Date() > expDate)
        {
            this.logout()
            return null
        }
        return localStorage.getItem('db-token')
    }

    login(user: User): Observable<any> {
        user.returnSecureToken = true
        return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.apiKey}`, user)
        .pipe(
            tap<any>(this.setToken),
            catchError(this.handleError.bind(this))
        )
    }

    logout() {
        this.setToken(null)
    }

    isAuthenticated(): boolean {
        return !!this.token
    }

    private handleError(error: HttpErrorResponse) {
       const {message} = error.error.error

       switch (message) {
           case 'EMAIL_NOT_FOUND':
               this.error$.next('Email not found')
               break
           case 'INVALID_EMAIL':
               this.error$.next('Incorrect email')
               break
           case 'INVALID_PASSWORD':
               this.error$.next('Incorrect password')
           break
       }
       return throwError(error)
    }

    private setToken(response: dbAuthResponse | null) {
        if (response) {
        const expDate = new Date(new Date().getTime() + +response.expiresIn * 1000)
        localStorage.setItem('db-token', response.idToken)
        localStorage.setItem('db-toke-exp', expDate.toString()) 
        } else {
            localStorage.clear()
        }
    }
}