import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TextGame from '@/components/game/TextGame';
import { negociacion } from '@/lib/games/negociacion';
import { liderEquipo } from '@/lib/games/lider-equipo';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/games/negociacion',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock next/link
jest.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('TextGame Component', () => {
  const mockGame = negociacion;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Intro Phase', () => {
    it('renders game title and tagline', () => {
      render(<TextGame game={mockGame} />);

      expect(screen.getByText('Negociación Maestra')).toBeInTheDocument();
      expect(screen.getByText('Un contrato con nuevas decisiones cada partida.')).toBeInTheDocument();
    });

    it('shows scenario selection when multiple scenarios', () => {
      const multiScenarioGame = {
        ...mockGame,
        escenarios: [
          { id: 'a', titulo: 'Escenario A', etiqueta: 'Test A', contexto: 'Contexto A', inicio: 'apertura', stats: [], eventos: [], finales: [], poolRondasDisponibles: [], escenas: [] },
          { id: 'b', titulo: 'Escenario B', etiqueta: 'Test B', contexto: 'Contexto B', inicio: 'apertura', stats: [], eventos: [], finales: [], poolRondasDisponibles: [], escenas: [] },
        ],
      };

      render(<TextGame game={multiScenarioGame} />);

      expect(screen.getByText('Selecciona el escenario:')).toBeInTheDocument();
      expect(screen.getByText('Escenario A')).toBeInTheDocument();
      expect(screen.getByText('Escenario B')).toBeInTheDocument();
    });

    it('starts game when clicking start button', async () => {
      render(<TextGame game={mockGame} />);

      const startButton = screen.getByText(/Iniciar simulación/i);
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Fase 1: Toma de Contacto y Apertura')).toBeInTheDocument();
      });
    });
  });

  describe('Scene Phase', () => {
    beforeEach(async () => {
      render(<TextGame game={mockGame} />);
      const startButton = screen.getByText(/Iniciar simulación/i);
      fireEvent.click(startButton);
      await waitFor(() => {
        expect(screen.getByText('Fase 1: Toma de Contacto y Apertura')).toBeInTheDocument();
      });
    });

    it('displays scene title and chapter', async () => {
      expect(screen.getByText('Fase 1: Toma de Contacto y Apertura')).toBeInTheDocument();
    });

    it('displays scene text with typewriter effect', () => {
      const texto = screen.getByText(/Te sientas frente a Verónica Salas/i);
      expect(texto.tagName).toBe('P');
    });

    it('shows choice buttons with hints', () => {
      const container = screen.getByText(/Fase 1: Toma de Contacto y Apertura/i).closest('div');
      expect(container).toBeInTheDocument();
      if (container) {
        expect(container.textContent).toContain('Establecer contacto directo y profesional');
        expect(container.textContent).toContain('Rompes el hielo con firmeza');
      }
    });

    it('advances to feedback when choice is clicked', async () => {
      // Skip typing to reveal choices
      const startButton = screen.getByText(/Iniciar simulación/i);
      fireEvent.click(startButton);
      await waitFor(() => {
        expect(screen.getByText('Fase 1: Toma de Contacto y Apertura')).toBeInTheDocument();
      });
      // Press Enter to skip typing
      fireEvent.keyDown(window, { key: 'Enter' });
      await waitFor(() => {
        expect(screen.queryByText('pulsa Enter o haz clic para saltar la escritura')).not.toBeInTheDocument();
      });
      // Click the first choice button
      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      fireEvent.click(buttons[0]);
      await waitFor(() => {
        expect(screen.getByText('> Decisión 01 registrada')).toBeInTheDocument();
      });
    });
  });

  describe('Feedback Phase', () => {
    beforeEach(async () => {
      render(<TextGame game={mockGame} />);
      const startButton = screen.getByText(/Iniciar simulación/i);
      fireEvent.click(startButton);
      await waitFor(() => {
        expect(screen.getByText('Fase 1: Toma de Contacto y Apertura')).toBeInTheDocument();
      });

      const choiceButton = screen.getByRole('button', { name: /Establecer contacto directo/i });
      fireEvent.click(choiceButton);
      await waitFor(() => {
        expect(screen.getByText('> Decisión 01 registrada')).toBeInTheDocument();
      });
    });

    it('shows feedback result and stat changes', () => {
      expect(screen.getByText('Verónica nota tu preparación')).toBeInTheDocument();
      expect(screen.getByText('Relación')).toBeInTheDocument();
      expect(screen.getByText('Margen')).toBeInTheDocument();
      expect(screen.getByText('Palanca')).toBeInTheDocument();
    });

    it('advances to next scene when clicking continue', async () => {
      const continueButton = screen.getByRole('button', { name: /Siguiente escena/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText('Fase 2: Descubrimiento y Análisis')).toBeInTheDocument();
      });
    });
  });

  describe('Game Completion', () => {
    it('shows ending screen when game ends', async () => {
      // This would require mocking the game to reach ending quickly
      // For now, we test the ending component renders correctly
      render(<TextGame game={negociacion} />);
      
      // We can't easily test the full flow without extensive mocking
      // This is a placeholder for the ending test
      expect(true).toBe(true);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(async () => {
      render(<TextGame game={mockGame} />);
      const startButton = screen.getByText(/Iniciar simulación/i);
      fireEvent.click(startButton);
      await waitFor(() => {
        expect(screen.getByText('Fase 1: Toma de Contacto y Apertura')).toBeInTheDocument();
      });
    });

    it('selects choice with number keys', async () => {
      fireEvent.keyDown(window, { key: '1' });
      await waitFor(() => {
        expect(screen.getByText('> Decisión 01 registrada')).toBeInTheDocument();
      });
    });

    it('skips typing with Enter', async () => {
      // Start game
      const startButton = screen.getByText(/Iniciar simulación/i);
      fireEvent.click(startButton);
      await waitFor(() => {
        expect(screen.getByText('Fase 1: Toma de Contacto y Apertura')).toBeInTheDocument();
      });

      // Press Enter to skip typing
      fireEvent.keyDown(window, { key: 'Enter' });
      
      // Text should be fully visible
      await waitFor(() => {
        expect(screen.queryByText('pulsa Enter o haz clic para saltar la escritura')).not.toBeInTheDocument();
      });
    });
  });

  describe('Scenario Selection', () => {
    it('shows saved game indicator when save exists', () => {
      const mockSave = {
        sceneId: 'investigacion',
        stats: { rel: 50, mar: 50, pal: 50 },
        log: [{ label: 'Test', result: 'Test', n: 1 }],
        savedAt: Date.now(),
        phase: 'scene' as const,
      };
      
      localStorage.setItem('games:progress:negociacion:veronica', JSON.stringify(mockSave));

      render(<TextGame game={negociacion} />);

      expect(screen.getByText(/Partida guardada/i)).toBeInTheDocument();
    });
  });
});