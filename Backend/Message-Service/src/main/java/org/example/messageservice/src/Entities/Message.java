package org.example.messageservice.src.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.Timestamp;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Table(name = "messages", schema = "app_schema")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    Long id;

    @Column(name = "c_senderid")
    Long senderid;

    @Column(name = "c_chatid")
    Long chatid;

    @Column(name = "c_text")
    String text;

//    @Column(name = "c_sendtime")
//    Timestamp sendtime;

    @Column(name = "c_messagestatus")
    boolean messagestatus;

}
