package com.worksync.strategy;

import java.util.ArrayList;
import java.util.List;

public class ValidationResult {
    private boolean valid;
    private int characterCount;
    private int maxCharacters;
    private List<String> errors = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();

    public ValidationResult() {
        this.valid = true;
    }

    public ValidationResult(boolean valid, int characterCount, int maxCharacters) {
        this.valid = valid;
        this.characterCount = characterCount;
        this.maxCharacters = maxCharacters;
    }

    public void addError(String error) {
        this.errors.add(error);
        this.valid = false;
    }

    public void addWarning(String warning) {
        this.warnings.add(warning);
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public int getCharacterCount() {
        return characterCount;
    }

    public void setCharacterCount(int characterCount) {
        this.characterCount = characterCount;
    }

    public int getMaxCharacters() {
        return maxCharacters;
    }

    public void setMaxCharacters(int maxCharacters) {
        this.maxCharacters = maxCharacters;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }
}
