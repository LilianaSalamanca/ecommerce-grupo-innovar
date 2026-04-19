import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private API_URL = `${environment.apiUrl}/api/usuarios`;

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.API_URL}/update-profile`, data);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.API_URL}/me`);
  }

}
