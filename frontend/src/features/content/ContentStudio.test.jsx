import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import postReducer from '../../store/slices/postSlice';
import authReducer from '../../store/slices/authSlice';
import uiReducer from '../../store/slices/uiSlice';
import draftReducer from '../../store/slices/draftSlice';
import ContentStudio from './ContentStudio';

const createMockStore = () =>
  configureStore({
    reducer: {
      posts: postReducer,
      auth: authReducer,
      ui: uiReducer,
      drafts: draftReducer,
    },
  });

describe('ContentStudio Multi-Platform Strategy Component', () => {
  it('renders target platforms and initial character counter', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ContentStudio />
      </Provider>
    );

    expect(screen.getByText('Content Studio')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('X (Twitter)')).toBeInTheDocument();
  });

  it('switches dynamic character limits when selecting X (Twitter)', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ContentStudio />
      </Provider>
    );

    // Switch to X
    const xButton = screen.getByText('X (Twitter)');
    fireEvent.click(xButton);

    // X character limit is 280
    expect(screen.getByText(/280/)).toBeInTheDocument();
  });
});
