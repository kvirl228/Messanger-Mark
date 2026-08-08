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

    @Override
    public Optional<Message> findFirstByChatidOrderBySendtimeDesc(Long chatid) {
        return messageRepository.findFirstByChatidOrderBySendtimeDesc(chatid);
    }

    public void startPrivateChat(StartPrivateChatDTO dto, Long senderId, String jwt) {
        System.out.println("is true");
        Long chatId = chatServiceClient.getOrCreatePrivateChat(senderId, dto.getRecipientId(), jwt);
        UserDTO user = userServiceClient.getUser(senderId, jwt);

        Optional<Message> message = messageRepository.findFirstByChatid(chatId);
        boolean isFirst = false;
        if (message.isEmpty()){
            isFirst = true;
            System.out.println("is true3");
            ChatRequestDTO chatRequestDTO1 = ChatRequestDTO.builder()
                    .chatId(chatId)
                    .userId(senderId)
                    .responseType("PRIVATE")
                    .title(user.getUsername())
                    .bio(user.getBio())
                    .issend(user.getIssend())
                    .build();
            if (dto.getType().equals("IMG")){
                chatRequestDTO1.setLastMessage("фото");
            }else{
                chatRequestDTO1.setLastMessage(dto.getText());
            }


            messagingTemplate.convertAndSendToUser(
                    dto.getRecipientId().toString(),
                    "/queue/chats",
                    chatRequestDTO1
            );
        }


        System.out.println(dto.getType());
        send(chatId, senderId,dto.getType(), dto.getText(), jwt, isFirst);
    }

    public void sendMessage(SendMessageDTO dto, Long senderId, String jwt) {
        send(dto.getChatId(), senderId,dto.getType(), dto.getText(), jwt, false);
    }

    private void send(Long chatId, Long senderId,String type, String text, String jwt, boolean isFirst) {
        System.out.println(text);
        Message message = Message.builder()
                .chatid(chatId)
                .senderid(senderId)
                .type(type)
                .build();
        if(type.equals("img")){
            message.setText(null);
            message.setImg(text);
        }else{
            message.setImg(null);
            message.setText(text);
        }

        Message savedMessage = messageRepository.save(message);

        List<Long> members = chatServiceClient.getMembers(chatId, jwt);

        MessageResponseDTO dto = MessageResponseDTO.builder()
                .responseType("MESSAGE")
                .type(type)
                .id(savedMessage.getId())
                .chatId(savedMessage.getChatid())
                .senderid(savedMessage.getSenderid())
                .sendtime(savedMessage.getSendtime())
                .build();
        System.out.println(dto);
        ChatSendDTO chatDTO2 = new ChatSendDTO();
        if(type.equals("img")){
            chatDTO2.setLastMessage("img");
            chatDTO2.setResponseType("MESSAGE");
            chatDTO2.setSendtime(savedMessage.getSendtime());
            chatDTO2.setChatId(savedMessage.getChatid());
            dto.setText(savedMessage.getImg());
        }else{
            chatDTO2.setLastMessage(savedMessage.getText());
            chatDTO2.setResponseType("MESSAGE");
            chatDTO2.setSendtime(savedMessage.getSendtime());
            chatDTO2.setChatId(savedMessage.getChatid());
            dto.setText(savedMessage.getText());
        }
        System.out.println(dto);
        System.out.println("готово");
        for (Long memberId : members) {
            System.out.println("SEND TO USER: " + memberId);
            messagingTemplate.convertAndSendToUser(
                    memberId.toString(),
                    "/queue/messages",
                    dto
            );
            System.out.println("MESSAGE EVENT SENT");

            messagingTemplate.convertAndSendToUser(
                    memberId.toString(),
                    "/queue/chats",
                    chatDTO2
            );
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
                .responseType("EDIT")
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
        response.put("responseType", "DELETE");
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
