package org.example.messageservice.src.Services.Impl;

import lombok.RequiredArgsConstructor;
import org.example.messageservice.src.DTO.*;
import org.example.messageservice.src.Entities.Message;
import org.example.messageservice.src.Repositories.MessageRepository;
import org.example.messageservice.src.Services.MessageServiceIntr;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Timestamp;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageServiceImpl implements MessageServiceIntr {

    private final MessageRepository messageRepository;

    private final ChatServiceClient chatServiceClient;

    private final SimpMessagingTemplate messagingTemplate;

    private final UserServiceClient userServiceClient;

    @Override
    public List<Message> findAllByChatid(Long chatid) {
        return messageRepository.findAllByChatidOrderByIdAsc(chatid);
    }

    @Override
    public void deleteAllByChatid(Long chatid) {
        messageRepository.deleteAllByChatid(chatid);
    }

    @Override
    public void deleteById(Long id) {
        messageRepository.deleteById(id);
    }

    @Override
    public void save(Message message) {
        messageRepository.save(message);
    }

    public void startPrivateChat(StartPrivateChatDTO dto, Long senderId, String jwt) {
        System.out.println("is true");
        Long chatId = chatServiceClient.getOrCreatePrivateChat(senderId, dto.getRecipientId(), jwt);
        UserDTO user = userServiceClient.getUser(senderId, jwt);

        Optional<Message> message = messageRepository.findFirstByChatid(chatId);

        if (message.isEmpty()){
            System.out.println("is true3");
            ChatRequestDTO chatRequestDTO1 = ChatRequestDTO.builder()
                    .chatId(chatId)
                    .lastMessage(dto.getText())
                    .userId(senderId)
                    .type("PRIVATE")
                    .title(user.getUsername())
                    .bio(user.getBio())
                    .issend(user.getIssend())
                    .build();


            messagingTemplate.convertAndSendToUser(
                    dto.getRecipientId().toString(),
                    "/queue/chats",
                    chatRequestDTO1
            );
        }



        send(chatId, senderId, dto.getText(), jwt);
    }

    public void sendMessage(SendMessageDTO dto, Long senderId, String jwt) {
        send(dto.getChatId(), senderId, dto.getText(), jwt);
    }

    private void send(Long chatId, Long senderId, String text, String jwt) {
        System.out.println("is true2");
        Message message = Message.builder()
                .chatid(chatId)
                .senderid(senderId)
                .text(text)
                .messagestatus(false)
                .build();

        Message savedMessage = messageRepository.save(message);

        List<Long> members = chatServiceClient.getMembers(chatId, jwt);

        MessageResponseDTO dto = MessageResponseDTO.builder()
                .type("MESSAGE")
                .id(savedMessage.getId())
                .chatId(savedMessage.getChatid())
                .senderid(savedMessage.getSenderid())
                .text(savedMessage.getText())
//                .sendTime(savedMessage.getSendtime())
                .build();

        for (Long memberId : members) {

            System.out.println("BEFORE SEND");

            messagingTemplate.convertAndSendToUser(
                    memberId.toString(),
                    "/queue/messages",
                    dto
            );

            System.out.println("AFTER SEND");
        }
    }

    public void editMessage(Long messageId, String text, Long senderId, String jwt){
        Message message = messageRepository.findById(messageId).orElseThrow();
        if(!message.getSenderid().equals(senderId)){
            return;
        }
        Long chatId = message.getChatid();
        message.setText(text);
        messageRepository.save(message);
//        Map<String, Object> response = new HashMap<>();
        MessageResponseDTO dto = MessageResponseDTO.builder()
                .type("EDIT")
                .id(message.getId())
                .senderid(message.getSenderid())
                .chatId(message.getChatid())
                .text(message.getText())
                .build();
//        response.put("type", "EDIT");
//        response.put("messageId", messageId);
        List<Long> members = chatServiceClient.getMembers(chatId, jwt);
        for (Long id : members){
            messagingTemplate.convertAndSendToUser(
                    id.toString(),
                    "/queue/messages",
                    dto
            );
        }
    }


    public void deleteMessage(Long messageId, Long senderId, String jwt){
        Message message = messageRepository.findById(messageId).orElseThrow();
        if(!message.getSenderid().equals(senderId)){
            return;
        }
        Long chatId = message.getChatid();
        messageRepository.deleteById(messageId);
        Map<String, Object> response = new HashMap<>();
        response.put("type", "DELETE");
        response.put("messageId", messageId);
        List<Long> members = chatServiceClient.getMembers(chatId, jwt);
        for (Long ids : members){
            messagingTemplate.convertAndSendToUser(
                    ids.toString(),
                    "/queue/messages",
                    response
            );
        }
    }


}
