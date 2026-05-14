package com.grupo_innovar.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import java.io.ByteArrayInputStream;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

   @Value("${FIREBASE_CONFIG_JSON}")
    private String firebaseConfigJson;

    @PostConstruct
    public void init() throws Exception {

        if (!FirebaseApp.getApps().isEmpty()) {
            return; // ya inicializado
        }

        InputStream serviceAccount =
                new ByteArrayInputStream(firebaseConfigJson.getBytes());

        GoogleCredentials credentials =
                GoogleCredentials.fromStream(serviceAccount);

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .build();

        FirebaseApp.initializeApp(options);

        System.out.println("Firebase inicializado correctamente");
    } 

}
