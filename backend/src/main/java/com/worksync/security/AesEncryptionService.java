package com.worksync.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class AesEncryptionService {

    private static final Logger log = LoggerFactory.getLogger(AesEncryptionService.class);
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12; // 96 bits recommended for GCM
    private static final int GCM_TAG_LENGTH = 128; // 128 bits auth tag

    private final SecretKey secretKey;
    private final SecureRandom secureRandom = new SecureRandom();

    public AesEncryptionService(@Value("${worksync.security.aes.secret-key}") String base64Key) {
        byte[] decodedKey = Base64.getDecoder().decode(base64Key);
        // Ensure 32 bytes (256 bits)
        byte[] key32 = new byte[32];
        System.arraycopy(decodedKey, 0, key32, 0, Math.min(decodedKey.length, 32));
        this.secretKey = new SecretKeySpec(key32, "AES");
    }

    public static class EncryptionResult {
        private final String cipherText;
        private final String iv;

        public EncryptionResult(String cipherText, String iv) {
            this.cipherText = cipherText;
            this.iv = iv;
        }

        public String getCipherText() {
            return cipherText;
        }

        public String getIv() {
            return iv;
        }
    }

    public EncryptionResult encrypt(String plainText) {
        if (plainText == null) {
            return null;
        }
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            byte[] cipherTextBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            String cipherTextBase64 = Base64.getEncoder().encodeToString(cipherTextBytes);
            String ivBase64 = Base64.getEncoder().encodeToString(iv);

            return new EncryptionResult(cipherTextBase64, ivBase64);
        } catch (Exception e) {
            log.error("AES encryption failed: {}", e.getMessage());
            throw new RuntimeException("Encryption operation failed", e);
        }
    }

    public String decrypt(String cipherTextBase64, String ivBase64) {
        if (cipherTextBase64 == null || ivBase64 == null) {
            return null;
        }
        try {
            byte[] cipherTextBytes = Base64.getDecoder().decode(cipherTextBase64);
            byte[] iv = Base64.getDecoder().decode(ivBase64);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            byte[] plainTextBytes = cipher.doFinal(cipherTextBytes);
            return new String(plainTextBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("AES decryption failed (data may have been tampered with or corrupted): {}", e.getMessage());
            throw new RuntimeException("Decryption operation failed", e);
        }
    }
}
