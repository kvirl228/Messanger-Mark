package org.example.authservice.src.Services.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;

    public void sendVerificationCode(String email, String code){

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("markmessanger@yandex.ru");
        message.setTo(email);

        message.setSubject("Mark - лучший мессенджер");


        message.setText(
                """
                Спасибо за выбор Марка

                Ваш код для подтверждения почты:

                %s

                код действует 10 минут.
                """.formatted(code)
        );
        javaMailSender.send(message);

    }

    public void sendCheckCode(String email, String code){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("markmessanger@yandex.ru");
        message.setTo(email);

        message.setSubject("Mark - лучший мессенджер");


        message.setText(
                """
                еСЛИ ВЫ ТАК СИЛЬНО ХОТИТЕ УДАЛИТЬ АККАУНТ

                Ваш код подтверждения :

                %s

                """.formatted(code)
        );
        javaMailSender.send(message);
    }

}
