package com.example.fileservice.service;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryServiceIntr {

    String upload(MultipartFile file);

}
