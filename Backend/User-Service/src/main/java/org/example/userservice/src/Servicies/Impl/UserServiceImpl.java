package org.example.userservice.src.Servicies.Impl;

import lombok.AllArgsConstructor;
import org.example.userservice.src.DTO.ContactResponseDTO;
import org.example.userservice.src.DTO.SettingsDTO;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.example.userservice.src.Entities.User;
import org.example.userservice.src.Repositories.UserRepository;
import org.example.userservice.src.Servicies.UserServiceIntr;

import java.io.Console;
import java.util.*;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserServiceIntr {

    private UserRepository userRepository;

    @Override
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> findUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public List<ContactResponseDTO> findAllContactsByUser(Long id){
        User user = userRepository.findById(id).orElseThrow();
        List<Long> contactsIds = user.getContacts();
        if(contactsIds==null){
            return null;
        }else{
            List<ContactResponseDTO> dto = new ArrayList<>();
            for(Long contact : contactsIds){
                ContactResponseDTO response = new ContactResponseDTO();
                response.setContactId(contact);
                response.setUsername(userRepository.findById(contact).get().getUsername());
                dto.add(response);
            }
            return dto;
        }
    }

    @Override
    public void addContact(Long id, Long contactId) {
        User user = userRepository.findById(id).orElseThrow();
        List<Long> contacts = user.getContacts();
        if(contacts == null){
            List<Long> newContacts = new ArrayList<>();
            newContacts.add(contactId);
            user.setContacts(newContacts);
        }else{
            if (!Objects.equals(contacts, contactId)) {
                contacts.add(contactId);
                user.setContacts(contacts);
            } else {
                return;
            }

        }
        userRepository.save(user);
    }

    @Override
    public void deleteContact(Long id, Long contactId) {
        User user = userRepository.findById(id).orElseThrow();
        List<Long> contacts = user.getContacts();
        contacts.remove(contactId);
        user.setContacts(contacts);
        userRepository.save(user);
    }

    @Override
    public void createUser(User user) {
        userRepository.save(user);
    }

    @Override
    public void changeUsername(Long id, String username) {
        User user = userRepository.findById(Long.valueOf(id)).orElseThrow();
        user.setUsername(username);
        userRepository.save(user);
    }

    @Override
    public void changeSettings(Long id, SettingsDTO dto){
        User user = userRepository.findById(id).orElseThrow();
        user.setIssend(dto.getIssend());
        user.setIsadd(dto.getIsadd());
        user.setIsview(dto.getIsview());
        userRepository.save(user);
    }

    @Override
    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }
}
