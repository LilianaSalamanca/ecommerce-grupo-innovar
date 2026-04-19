import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class WebSocketService {

  private client!: Client;

  connect(callback: (data: any) => void) {

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${environment.apiUrl}/ws-dashboard`),
      reconnectDelay: 5000,
      debug: (str) => console.log(str)
    });

    this.client.onConnect = () => {
      this.client.subscribe('/topic/dashboard', (message) => {
        callback(JSON.parse(message.body));
      });
    };

    this.client.activate();
  }
}