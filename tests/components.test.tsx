import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DetectiveConsole } from '../src/components/DetectiveConsole';
import { ClueChipsView } from '../src/components/ClueChipsView';
import { ReconstructionScreen } from '../src/components/ReconstructionScreen';

describe('DetectiveConsole Component (Step 1)', () => {
  it('renders correctly, and suggestions disappear upon typing', () => {
    const handleSubmit = vi.fn();
    render(<DetectiveConsole onSubmit={handleSubmit} isLoading={false} />);

    // Initially suggestions should be visible
    expect(screen.getByText(/Or start with a fragmented memory/i)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Describe everything you remember/i);
    
    // Type inside textarea
    fireEvent.change(textarea, { target: { value: 'Something' } });

    // Suggestions container should no longer be in the document
    expect(screen.queryByText(/Or start with a fragmented memory/i)).not.toBeInTheDocument();
  });
});

describe('ClueChipsView Component (Step 2)', () => {
  it('renders chips with statuses, allows editing, deleting, and adding chips', () => {
    const handleReconstruct = vi.fn();
    const initialClues = [
      { text: 'Sci-Fi', status: 'valid' as const },
      { text: 'Forest Whitaker', status: 'doubtful' as const }
    ];

    render(
      <ClueChipsView 
        clues={initialClues} 
        onReconstruct={handleReconstruct} 
      />
    );

    // Verify chips render
    expect(screen.getByText(/Sci-Fi/)).toBeInTheDocument();
    expect(screen.getByText(/Forest Whitaker/)).toBeInTheDocument();

    // Verify status icons or labels
    expect(screen.getAllByText(/✅/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/⚠/).length).toBeGreaterThan(0);

    // Test deleting a chip
    const deleteButtons = screen.getAllByRole('button', { name: /remove clue/i });
    fireEvent.click(deleteButtons[1]); // Delete Forest Whitaker
    expect(screen.queryByText(/Forest Whitaker/)).not.toBeInTheDocument();

    // Test adding a chip
    const addInput = screen.getByPlaceholderText(/Add another memory detail/i);
    fireEvent.change(addInput, { target: { value: 'Robot arm' } });
    fireEvent.submit(addInput);
    expect(screen.getByText(/Robot arm/)).toBeInTheDocument();

    // Test trigger reconstruction
    const reconstructBtn = screen.getByRole('button', { name: /Reconstruct Movie/i });
    fireEvent.click(reconstructBtn);
    expect(handleReconstruct).toHaveBeenCalledWith(
      expect.arrayContaining([
        { text: 'Sci-Fi', status: 'valid' },
        { text: 'Robot arm', status: 'valid' }
      ])
    );
  });
});

describe('ReconstructionScreen Component (Step 4)', () => {
  it('renders ranked candidate cards with why matches and external links', () => {
    const candidates = [
      {
        title: 'Arrival',
        year: '2016',
        director: 'Denis Villeneuve',
        confidence: 95,
        whyItMatches: 'Contains detailed bionic legs and aliens.',
        whyItMightNotMatch: 'No Forest Whitaker is in the film.',
        imdbId: 'tt2543164',
        tmdbId: '329865'
      }
    ];

    render(<ReconstructionScreen candidates={candidates} onReset={vi.fn()} />);

    expect(screen.getByText('Arrival (2016)')).toBeInTheDocument();
    expect(screen.getByText(/Contains detailed bionic legs/i)).toBeInTheDocument();
    expect(screen.getByText(/No Forest Whitaker is in the/i)).toBeInTheDocument();

    // Verify IMDb and TMDb links
    const imdbLink = screen.getByRole('link', { name: /IMDb/i }) as HTMLAnchorElement;
    expect(imdbLink.href).toContain('imdb.com/title/tt2543164');

    const tmdbLink = screen.getByRole('link', { name: /TMDb/i }) as HTMLAnchorElement;
    expect(tmdbLink.href).toContain('themoviedb.org/movie/329865');
  });
});
