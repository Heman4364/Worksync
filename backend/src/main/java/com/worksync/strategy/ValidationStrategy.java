package com.worksync.strategy;

import com.worksync.entity.SocialPlatform;

public interface ValidationStrategy {
    SocialPlatform getPlatform();
    int getMaxCharacters();
    ValidationResult validate(String content, String mediaUrls);
}
