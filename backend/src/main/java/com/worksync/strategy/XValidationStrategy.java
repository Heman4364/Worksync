package com.worksync.strategy;

import com.worksync.entity.SocialPlatform;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class XValidationStrategy implements ValidationStrategy {

    public static final int MAX_CHARACTERS = 280;
    public static final int TCO_URL_LENGTH = 23;
    private static final Pattern URL_PATTERN = Pattern.compile("https?://\\S+");

    @Override
    public SocialPlatform getPlatform() {
        return SocialPlatform.X;
    }

    @Override
    public int getMaxCharacters() {
        return MAX_CHARACTERS;
    }

    @Override
    public ValidationResult validate(String content, String mediaUrls) {
        String safeContent = content != null ? content : "";

        // On X (Twitter), URLs are counted as fixed 23 characters regardless of length
        Matcher urlMatcher = URL_PATTERN.matcher(safeContent);
        int urlCount = 0;
        int rawUrlCharacters = 0;
        while (urlMatcher.find()) {
            urlCount++;
            rawUrlCharacters += urlMatcher.group().length();
        }

        int calculatedLength = safeContent.length() - rawUrlCharacters + (urlCount * TCO_URL_LENGTH);
        ValidationResult result = new ValidationResult(true, calculatedLength, MAX_CHARACTERS);

        if (safeContent.trim().isEmpty() && (mediaUrls == null || mediaUrls.trim().isEmpty())) {
            result.addError("Post cannot be empty. Text or media is required on X.");
        }

        if (calculatedLength > MAX_CHARACTERS) {
            result.addError("Post exceeds X character limit of " + MAX_CHARACTERS + " characters (" + calculatedLength + " used). Consider creating a thread.");
        }

        if (urlCount > 2) {
            result.addWarning("Multiple links may reduce post reach on X. Consider consolidating links.");
        }

        return result;
    }
}
