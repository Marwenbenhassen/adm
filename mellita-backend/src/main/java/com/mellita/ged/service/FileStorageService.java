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
public class FileStorageService {

    @Value("${file.storage.local.path:./uploads}")
    private String localStoragePath;

    private Path localPath;

    @PostConstruct
    public void init() throws IOException {
        // Utiliser un chemin absolu pour éviter les problèmes
        String baseDir = System.getProperty("user.dir");
        localPath = Paths.get(baseDir, localStoragePath);
        Files.createDirectories(localPath);
        System.out.println("📁 Stockage local: " + localPath.toAbsolutePath());
    }

    public String saveFile(MultipartFile file) throws IOException {
        // Créer le dossier par année/mois
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        Path targetDir = localPath.resolve(datePath);
        Files.createDirectories(targetDir);

        // Générer un nom unique
        String timestamp = String.valueOf(System.currentTimeMillis());
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String fileName = timestamp + "_" + originalName;
        Path filePath = targetDir.resolve(fileName);

        // Sauvegarder le fichier
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        System.out.println("✅ Fichier sauvegardé: " + filePath.toString());
        return filePath.toString();
    }

    public InputStream loadFile(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        if (!Files.exists(path)) {
            // Essayer avec le chemin absolu
            String baseDir = System.getProperty("user.dir");
            path = Paths.get(baseDir, filePath);
        }
        if (Files.exists(path)) {
            return Files.newInputStream(path);
        }
        throw new FileNotFoundException("Fichier non trouvé: " + filePath);
    }

    public void deleteFile(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        if (Files.exists(path)) {
            Files.delete(path);
        }
    }
}