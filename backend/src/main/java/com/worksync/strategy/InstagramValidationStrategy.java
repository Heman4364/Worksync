package com.worksync.strategy;

import com.worksync.entity.SocialPlatform;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class InstagramValidationStrategy implements ValidationStrategy {

    public static final int MAX_CHARACTERS = 2200;
    public static final int MAX_HASHTAGS = 30;
    private static final Pattern HASHTAG_PATTERN = Pattern.compile("#\\w+");

    @Override
    public SocialPlatform getPlatform() {
        return SocialPlatform.INSTAGRAM;
    }

    @Override
    public int getMaxCharacters() {
        return MAX_CHARACTERS;
    }

    @Override
    public ValidationResult validate(String content, String mediaUrls) {
        String safeContent = content != null ? content : "";
        int length = safeContent.length();
        ValidationResult result = new ValidationResult(true, length, MAX_CHARACTERS);

        if (safeContent.trim().isEmpty() && (mediaUrls == null || mediaUrls.trim().isEmpty())) {
            result.addError("Instagram post cannot be completely empty. Caption or image is required.");
        }

        if (length > MAX_CHARACTERS) {
            result.addError("Caption exceeds Instagram limit of " + MAX_CHARACTERS + " characters (" + length + " used).");
        }

        Matcher matcher = HASHTAG_PATTERN.matcher(safeContent);
        int hashtagCount = 0;
        while (matcher.find()) {
            hashtagCount++;
        }

        if (hashtagCount > MAX_HASHTAGS) {
            result.addError("Instagram allows at most " + MAX_HASHTAGS + " hashtags (found " + hashtagCount + ").");
        } else if (hashtagCount == 0) {
            result.addWarning("Adding 3-5 relevant hashtags is recommended to boost discoverability on Instagram.");
        }

        if (mediaUrls == null || mediaUrls.trim().isEmpty()) {
            result.addWarning("Instagram is a visual platform; posts perform significantly better with attached photos or reels.");
        }

        return result;
    }
}
