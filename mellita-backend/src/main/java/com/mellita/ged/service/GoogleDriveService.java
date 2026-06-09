package com.mellita.ged.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;
import java.io.*;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class GoogleDriveService {

    @Value("${file.storage.local.path:./uploads}")
    private String localStoragePath;

    private Path localPath;

    @PostConstruct
    public void init() throws IOException {
        localPath = Paths.get(localStoragePath).toAbsolutePath();
        Files.createDirectories(localPath);
        System.out.println("📁 Stockage local: " + localPath);
    }

    public String uploadFile(MultipartFile file, String fileName) throws IOException {
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        Path targetDir = localPath.resolve(datePath);
        Files.createDirectories(targetDir);

        String uniqueFileName = System.currentTimeMillis() + "_" + fileName;
        Path filePath = targetDir.resolve(uniqueFileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        System.out.println("✅ Fichier sauvegardé: " + filePath);
        return filePath.toString();
    }

    public InputStream downloadFile(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        if (Files.exists(path)) {
            return Files.newInputStream(path);
        }
        throw new FileNotFoundException("Fichier non trouvé: " + filePath);
    }

    public void deleteFile(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        Files.deleteIfExists(path);
    }
}