package com.worksync.strategy;

import com.worksync.entity.SocialPlatform;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
public class ValidationStrategyFactory {

    private final Map<SocialPlatform, ValidationStrategy> strategyMap = new EnumMap<>(SocialPlatform.class);

    public ValidationStrategyFactory(List<ValidationStrategy> strategies) {
        for (ValidationStrategy strategy : strategies) {
            strategyMap.put(strategy.getPlatform(), strategy);
        }
    }

    public ValidationStrategy getStrategy(SocialPlatform platform) {
        ValidationStrategy strategy = strategyMap.get(platform);
        if (strategy == null) {
            throw new IllegalArgumentException("No validation strategy registered for platform: " + platform);
        }
        return strategy;
    }
}
