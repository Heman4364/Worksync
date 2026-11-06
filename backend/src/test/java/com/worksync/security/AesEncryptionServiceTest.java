package com.worksync.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AesEncryptionServiceTest {

    private AesEncryptionService encryptionService;

    @BeforeEach
    void setUp() {
        // Base64 encoded 32-byte key
        String testKey = "d29ya3N5bmMtYWVzLTI1Ni1nY20ta2V5LXNlY3JldA==";
        encryptionService = new AesEncryptionService(testKey);
    }

    @Test
    void testEncryptAndDecrypt() {
        String plainSecret = "secret_client_token_abc123!@#$";
        AesEncryptionService.EncryptionResult enc = encryptionService.encrypt(plainSecret);

        assertNotNull(enc);
        assertNotNull(enc.getCipherText());
        assertNotNull(enc.getIv());
        assertNotEquals(plainSecret, enc.getCipherText());

        String decrypted = encryptionService.decrypt(enc.getCipherText(), enc.getIv());
        assertEquals(plainSecret, decrypted);
    }

    @Test
    void testDifferentIvForEachEncryption() {
        String plainSecret = "fixed_string";
        AesEncryptionService.EncryptionResult enc1 = encryptionService.encrypt(plainSecret);
        AesEncryptionService.EncryptionResult enc2 = encryptionService.encrypt(plainSecret);

        assertNotEquals(enc1.getIv(), enc2.getIv());
        assertNotEquals(enc1.getCipherText(), enc2.getCipherText());
    }

    @Test
    void testTamperedCipherTextFailsDecryption() {
        String plainSecret = "sensitive_data";
        AesEncryptionService.EncryptionResult enc = encryptionService.encrypt(plainSecret);

        // Tamper with cipher text
        String tampered = enc.getCipherText().substring(0, enc.getCipherText().length() - 4) + "AAAA";

        assertThrows(RuntimeException.class, () -> {
            encryptionService.decrypt(tampered, enc.getIv());
        });
    }
}
