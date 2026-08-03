import { Client } from "@stomp/stompjs";
import { auth_service } from "../properties";

class WebSocketService {

    constructor() {
        this.client = null;
        this.connected = false;

        this.messageSubscription = null;
        this.chatSubscription = null;

        this.listeners = [];
        this.chatListeners = [];

        this.tokenTimer = null;
    }

    connect(jwt) {

        if (!jwt) {
            console.error("JWT отсутствует");
            return;
        }

        // Если уже подключены — сначала отключаемся
        if (this.client) {
            this.disconnect();
        }

        this.startTokenTimer(jwt);

        this.client = new Client({
            brokerURL: "ws://localhost:8033/ws",

            connectHeaders: {
                Authorization: `Bearer ${jwt}`
            },

            reconnectDelay: 5000,

            debug: console.log,

            onConnect: () => {
                console.log("WebSocket подключён");
                this.connected = true;
                this.subscribe();
            },

            onDisconnect: () => {
                console.log("WebSocket отключён");
                this.connected = false;
            },

            onStompError: frame => {
                console.error(frame);
            }
        });

        this.client.activate();
    }

    subscribe() {

        if (!this.connected) return;

        this.messageSubscription = this.client.subscribe(
            "/user/queue/messages",
            message => {
                const body = JSON.parse(message.body);
                this.listeners.forEach(listener => listener(body));
            }
        );

        this.chatSubscription = this.client.subscribe(
            "/user/queue/chats",
            message => {
                const body = JSON.parse(message.body);
                this.chatListeners.forEach(listener => listener(body));
            }
        );

        console.log("Подписки созданы");
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    removeListener(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    addChatListener(listener) {
        this.chatListeners.push(listener);
    }

    removeChatListener(listener) {
        this.chatListeners =
            this.chatListeners.filter(l => l !== listener);
    }

    send(destination, body) {

        if (!this.connected) {
            console.log("WebSocket не подключён");
            return;
        }

        this.client.publish({
            destination,
            body: JSON.stringify(body)
        });
    }

    disconnect() {

        if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
            this.messageSubscription = null;
        }

        if (this.chatSubscription) {
            this.chatSubscription.unsubscribe();
            this.chatSubscription = null;
        }

        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }

        if (this.tokenTimer) {
            clearTimeout(this.tokenTimer);
            this.tokenTimer = null;
        }

        this.connected = false;
    }

    getTokenExpiration(token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 1000;
    }

    startTokenTimer(token) {

        if (this.tokenTimer) {
            clearTimeout(this.tokenTimer);
        }

        const timeout = this.getTokenExpiration(token) - Date.now();

        if (timeout <= 0) {
            this.refresh();
            return;
        }

        // обновляем немного заранее
        this.tokenTimer = setTimeout(() => {
            this.refresh();
        }, timeout - 5000);
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

            if (!response.ok) {
                localStorage.clear();
                this.disconnect();
                return;
            }

            const token = await response.text();

            localStorage.setItem("token", token);

            console.log("JWT обновлён. Переподключаем WebSocket.");

            this.connect(token);

        } catch (e) {
            console.error(e);
        }
    }
}

export default new WebSocketService();