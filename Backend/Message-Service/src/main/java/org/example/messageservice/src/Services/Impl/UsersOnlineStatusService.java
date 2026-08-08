package org.example.messageservice.src.Services.Impl;

import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UsersOnlineStatusService {

    private final Set<Long> onlineUsers = ConcurrentHashMap.newKeySet();

    public void connect(Long userId) {
        onlineUsers.add(userId);
    }

    public void disconnect(Long userId) {
        onlineUsers.remove(userId);
    }

    public Set<Long> getOnlineUsers() {
        return onlineUsers;
    }

    public boolean isOnline(Long userId) {
        return onlineUsers.contains(userId);
    }

}
