import { Client } from "@stomp/stompjs";
import { message_service, auth_service } from "../properties";

class WebSocketService {

    constructor() {
        this.client = null;
        this.connected = false;
        this.subscription = null;
        this.listeners = [];
        this.chatListeners = [];
        this.tokenTimer = null;
    }

    connect(jwt) {

        if (this.client && this.connected) {
            console.log("WebSocket уже подключён");
            return;
        }

        this.startTokenTimer(jwt);

        this.client = new Client({
            brokerURL: `ws://localhost:8033/ws`,
            connectHeaders: {
                Authorization: `Bearer ${jwt}`
            },
            reconnectDelay: 5000,

            debug: (str) => {console.log(str);},
            onConnect: () => {
                console.log("WebSocket подключён!");
                this.connected = true;
                this.subscribe();
            },
            onDisconnect: () => {
                console.log("WebSocket отключён");
                this.connected = false;
                this.subscription = null;

            },
            onStompError: (frame) => {
                console.error("STOMP ERROR");
                
            }
        });
        this.client.activate();
    }

    subscribe() {
        if (!this.connected) {return;}
        if (this.subscription) {return;}
        this.subscription = this.client.subscribe(
            "/user/queue/messages",
            (message) => {
                const body = JSON.parse(message.body);
                this.listeners.forEach(listener => listener(body));

            }
        );
        console.log("Подписка создана");
    }

    getTokenExpiration(token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 1000;
    }

    startTokenTimer(token) {
        const expiresAt = this.getTokenExpiration(token);
        const timeout = expiresAt - Date.now();
        // console.log(
        //     "JWT истечёт через:",
        //     timeout / 1000,
        //     "секунд"
        // );
        if (timeout <= 0) {
            console.log("JWT уже истёк");
            return;

        }
        this.tokenTimer = setTimeout(() => {
                this.handleTokenExpired();
            },
            timeout
        );

    }

    async refresh() {
            try {
                const response = await fetch(`${auth_service}/auth/refresh`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
    
                if (response.ok) {
                    const token = await response.text()
                    localStorage.setItem("token", token)
                    this.connect(token);
                } else {
                    localStorage.clear();
                }
            } catch (error) {
                console.error("Ошибка при обновлении токена:", error);
            }
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    removeListener(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }
    addMessageListener(listener){
    this.messageListeners.push(listener);
    }


    removeMessageListener(listener){
        this.messageListeners =
            this.messageListeners.filter(
                l => l !== listener
            );
    }



    addChatListener(listener){
        this.chatListeners.push(listener);
    }


    removeChatListener(listener){
        this.chatListeners =
            this.chatListeners.filter(
                l => l !== listener
            );
    }

    disconnect() {

    console.log("DISCONNECT START");

    console.log("CLIENT:", this.client);
    console.log("CONNECTED:", this.connected);


    if (this.subscription) {

        this.subscription.unsubscribe();
        this.subscription = null;

        console.log("SUB REMOVED");
    }


    if (this.client) {

        this.client.deactivate();

        this.client = null;

        console.log("CLIENT REMOVED");
    }

    if(this.tokenTimer){
        clearTimeout(this.tokenTimer);
        this.tokenTimer = null;

    }


    this.connected = false;


    console.log("DISCONNECT END");
}

    send(destination, body) {

        if (!this.connected) {
            console.log("WebSocket не подключён");
            return;
        }

        this.client.publish({
            destination: destination,
            body: JSON.stringify(body)
        });

    }

}

export default new WebSocketService();