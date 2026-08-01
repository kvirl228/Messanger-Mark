package org.example.messageservice.src.Services.Impl;

import lombok.RequiredArgsConstructor;
import org.example.messageservice.src.DTO.MessageResponseDTO;
import org.example.messageservice.src.DTO.SendMessageDTO;
import org.example.messageservice.src.DTO.StartPrivateChatDTO;
import org.example.messageservice.src.Entities.Message;
import org.example.messageservice.src.Repositories.MessageRepository;
import org.example.messageservice.src.Services.MessageServiceIntr;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Timestamp;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageServiceImpl implements MessageServiceIntr {

    private final MessageRepository messageRepository;

    private final ChatServiceClient chatServiceClient;

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public List<Message> findAllByChatid(Long chatid) {
        return messageRepository.findAllByChatid(chatid);
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
        Long chatId = chatServiceClient.getOrCreatePrivateChat(senderId, dto.getRecipientId(), jwt);
        send(chatId, senderId, dto.getText(), jwt);
    }

    public void sendMessage(SendMessageDTO dto, Long senderId, String jwt) {
        send(dto.getChatId(), senderId, dto.getText(), jwt);
    }

    private void send(Long chatId, Long senderId, String text, String jwt) {
        Message message = Message.builder()
                .chatid(chatId)
                .senderid(senderId)
                .text(text)
                .messagestatus(false)
                .build();

        Message savedMessage = messageRepository.save(message);

        List<Long> members = chatServiceClient.getMembers(chatId, jwt);

        MessageResponseDTO dto = MessageResponseDTO.builder()
                .id(savedMessage.getId())
                .chatId(savedMessage.getChatid())
                .senderId(savedMessage.getSenderid())
                .text(savedMessage.getText())
//                .sendTime(savedMessage.getSendtime())
                .build();

        for (Long memberId : members) {

            messagingTemplate.convertAndSendToUser(
                    memberId.toString(),
                    "/queue/messages",
                    dto
            );
        }
    }
}
