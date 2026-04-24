package com.grupo_innovar.backend.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.StorageClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class FirebaseStorageService {

    public String uploadFile(MultipartFile file) throws Exception {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Archivo vacío");
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        Bucket bucket = StorageClient.getInstance().bucket();

        Blob blob = bucket.create(
                fileName,
                file.getBytes(),
                file.getContentType()
        );

        return String.format(
                "https://storage.googleapis.com/%s/%s",
                bucket.getName(),
                fileName
        );
    }
}