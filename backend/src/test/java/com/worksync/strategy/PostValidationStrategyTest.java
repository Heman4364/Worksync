package com.worksync.strategy;

import com.worksync.entity.SocialPlatform;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PostValidationStrategyTest {

    private InstagramValidationStrategy instagramStrategy;
    private LinkedInValidationStrategy linkedInStrategy;
    private XValidationStrategy xStrategy;
    private ValidationStrategyFactory strategyFactory;

    @BeforeEach
    void setUp() {
        instagramStrategy = new InstagramValidationStrategy();
        linkedInStrategy = new LinkedInValidationStrategy();
        xStrategy = new XValidationStrategy();
        strategyFactory = new ValidationStrategyFactory(List.of(instagramStrategy, linkedInStrategy, xStrategy));
    }

    @Test
    void testStrategyFactoryResolvesCorrectStrategies() {
        assertEquals(SocialPlatform.INSTAGRAM, strategyFactory.getStrategy(SocialPlatform.INSTAGRAM).getPlatform());
        assertEquals(SocialPlatform.LINKEDIN, strategyFactory.getStrategy(SocialPlatform.LINKEDIN).getPlatform());
        assertEquals(SocialPlatform.X, strategyFactory.getStrategy(SocialPlatform.X).getPlatform());
    }

    @Test
    void testXValidationCharacterLimit() {
        String shortContent = "Short tweet for WorkSync!";
        ValidationResult shortResult = xStrategy.validate(shortContent, null);
        assertTrue(shortResult.isValid());
        assertEquals(25, shortResult.getCharacterCount());

        // Create string over 280 chars
        String longContent = "a".repeat(281);
        ValidationResult longResult = xStrategy.validate(longContent, null);
        assertFalse(longResult.isValid());
        assertTrue(longResult.getErrors().get(0).contains("exceeds X character limit"));
    }

    @Test
    void testXValidationUrlCalculation() {
        // URLs on X count as 23 characters regardless of length
        String contentWithUrl = "Check out https://very-long-domain-name-testing-url-handling.com/some/long/path/for/worksync";
        ValidationResult result = xStrategy.validate(contentWithUrl, null);
        assertTrue(result.isValid());
        // "Check out " is 10 chars + 23 URL chars = 33 chars
        assertEquals(33, result.getCharacterCount());
    }

    @Test
    void testInstagramHashtagLimit() {
        StringBuilder sb = new StringBuilder("Post caption ");
        for (int i = 0; i < 35; i++) {
            sb.append("#tag").append(i).append(" ");
        }

        ValidationResult result = instagramStrategy.validate(sb.toString(), "https://image.url");
        assertFalse(result.isValid());
        assertTrue(result.getErrors().get(0).contains("allows at most 30 hashtags"));
    }

    @Test
    void testLinkedInValidation() {
        ValidationResult emptyResult = linkedInStrategy.validate("", null);
        assertFalse(emptyResult.isValid());

        ValidationResult validResult = linkedInStrategy.validate("Excited to launch our new enterprise platform WorkSync today! #saas #productivity", null);
        assertTrue(validResult.isValid());
    }
}
