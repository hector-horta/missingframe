import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DetectiveConsole } from '../src/components/DetectiveConsole';
import { SettingsModal } from '../src/components/SettingsModal';
import { FollowUpModal } from '../src/components/FollowUpModal';

describe('DetectiveConsole Component', () => {
  it('renders correctly and handles submission', () => {
    const handleSubmit = vi.fn();
    render(<DetectiveConsole onSubmit={handleSubmit} isLoading={false} />);

    // Check placeholder
    const textarea = screen.getByPlaceholderText(/Whisper your fragments/i);
    expect(textarea).toBeInTheDocument();

    // Fill in textarea
    fireEvent.change(textarea, { target: { value: 'Inception dreams' } });
    
    // Click submit button
    const submitBtn = screen.getByRole('button', { name: /Reconstruct Memory/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith('Inception dreams');
  });

  it('renders loading console during analysis phase', () => {
    render(<DetectiveConsole onSubmit={vi.fn()} isLoading={true} />);
    expect(screen.getByText(/Detective Engine Active/i)).toBeInTheDocument();
  });
});

describe('SettingsModal Component', () => {
  it('saves keys to localStorage upon save', () => {
    localStorage.clear();
    const handleClose = vi.fn();
    
    render(<SettingsModal isOpen={true} onClose={handleClose} />);

    const geminiInput = screen.getByLabelText(/Gemini API Key/i);
    const tmdbInput = screen.getByLabelText(/TMDB API Key/i);

    fireEvent.change(geminiInput, { target: { value: 'gemini-secret-123' } });
    fireEvent.change(tmdbInput, { target: { value: 'tmdb-secret-456' } });

    const saveBtn = screen.getByRole('button', { name: /Save Credentials/i });
    fireEvent.click(saveBtn);

    expect(localStorage.getItem('MF_GEMINI_API_KEY')).toBe('gemini-secret-123');
    expect(localStorage.getItem('MF_TMDB_API_KEY')).toBe('tmdb-secret-456');
  });
});

describe('FollowUpModal Component', () => {
  it('renders inquiry query and submits response', () => {
    const handleSubmit = vi.fn();
    render(<FollowUpModal question="Do you remember the ending?" onSubmit={handleSubmit} isLoading={false} />);

    expect(screen.getByText(/"Do you remember the ending\?"/)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Answer the inquiry/i);
    fireEvent.change(textarea, { target: { value: 'Yes, it was in a desert.' } });

    const resolveBtn = screen.getByRole('button', { name: /Resolve Synapse/i });
    fireEvent.click(resolveBtn);

    expect(handleSubmit).toHaveBeenCalledWith('Yes, it was in a desert.');
  });
});
