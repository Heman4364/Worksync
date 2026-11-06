package com.worksync.strategy;

import com.worksync.entity.SocialPlatform;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class LinkedInValidationStrategy implements ValidationStrategy {

    public static final int MAX_CHARACTERS = 3000;
    public static final int RECOMMENDED_MAX_HASHTAGS = 8;
    private static final Pattern HASHTAG_PATTERN = Pattern.compile("#\\w+");

    @Override
    public SocialPlatform getPlatform() {
        return SocialPlatform.LINKEDIN;
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

        if (safeContent.trim().isEmpty()) {
            result.addError("LinkedIn post text cannot be empty.");
        }

        if (length > MAX_CHARACTERS) {
            result.addError("Post exceeds LinkedIn limit of " + MAX_CHARACTERS + " characters (" + length + " used).");
        }

        Matcher matcher = HASHTAG_PATTERN.matcher(safeContent);
        int hashtagCount = 0;
        while (matcher.find()) {
            hashtagCount++;
        }

        if (hashtagCount > RECOMMENDED_MAX_HASHTAGS) {
            result.addWarning("LinkedIn algorithms favor 3-5 focused hashtags. You have used " + hashtagCount + ".");
        }

        if (length < 100) {
            result.addWarning("Thought leadership and long-form storytelling (> 150 characters) generate higher engagement on LinkedIn.");
        }

        return result;
    }
}
