import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryAnalysis } from '../src/components/MemoryAnalysis.tsx';
import type { MovieRecoveryResult } from '../src/hooks/useMovieRecovery';

describe('MemoryAnalysis Component', () => {
  const mockResult: MovieRecoveryResult = {
    ruido_vs_anclas: {
      anclas: ['Green ogre', 'Swamp'],
      ruido: ['Princess saves ogre (actually ogre saves princess)']
    },
    analysis: 'The user remembered a green ogre who saved a princess.',
    confidence: 'high',
    clarification_needed: false,
    clarification_question: '',
    extracted_clues: [],
    candidates: [
      {
        title: 'Shrek',
        year: '2001',
        match: 0.99,
        why: 'Shrek is a 2001 animated movie about an ogre saving a princess.',
        possible_memory_errors: []
      }
    ]
  };

  it('renders movie title, year and analysis correctly', () => {
    render(<MemoryAnalysis result={mockResult} onReset={vi.fn()} />);

    expect(screen.getByText('Análisis de Memoria')).toBeInTheDocument();
    expect(screen.getByText('Shrek')).toBeInTheDocument();
    expect(screen.getByText('Estreno: 2001')).toBeInTheDocument();
    expect(screen.getByText(/The user remembered a green ogre/i)).toBeInTheDocument();
  });

  it('renders the anchors and noise corrections', () => {
    render(<MemoryAnalysis result={mockResult} onReset={vi.fn()} />);

    expect(screen.getByText('Green ogre')).toBeInTheDocument();
    expect(screen.getByText('Swamp')).toBeInTheDocument();
    expect(screen.getByText(/Princess saves ogre/i)).toBeInTheDocument();
  });

  it('calls onReset when clicking the reset button', () => {
    const handleReset = vi.fn();
    render(<MemoryAnalysis result={mockResult} onReset={handleReset} />);

    const button = screen.getByRole('button', { name: /Volver a investigar/i });
    fireEvent.click(button);

    expect(handleReset).toHaveBeenCalled();
  });
});
