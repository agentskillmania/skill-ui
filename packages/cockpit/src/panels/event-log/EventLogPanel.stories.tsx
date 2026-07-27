/**
 * EventLogPanel stories — demonstrate virtual scrolling with large event lists
 */
import { useCallback, useEffect, useState, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { EventLogPanel } from './EventLogPanel.js';
import { ThemeProvider } from '@agentskillmania/skill-ui-theme';
import type { CockpitEvent, CockpitEventType } from './types.js';

/**
 * Decorator that overlays a live counter showing virtual scroll efficiency.
 * Displays "DOM nodes: X / Total: Y" — where X = actual rendered [data-index]
 * elements and Y = total events. With virtual scrolling, X << Y.
 */
function VirtualScrollCounter({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState({ dom: 0, total: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const updateCount = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const dom = panel.querySelectorAll('[data-index]').length;
    // Find the virtual scroll spacer: the scroll container's first child div
    // It uses Emotion CSS, so read computed height via getBoundingClientRect
    const scrollContainer = panel.querySelector('[data-testid="event-log-scroll"]');
    let total = dom;
    if (scrollContainer && scrollContainer.firstElementChild instanceof HTMLElement) {
      const h = scrollContainer.firstElementChild.getBoundingClientRect().height;
      if (h > 500) {
        // If the spacer is tall (>500px), we have virtual scrolling — compute total
        total = Math.round(h / 48);
      }
    }
    setCount({ dom, total: Math.max(total, dom) });
  }, []);

  useEffect(() => {
    // Initial count after render
    const timer = setTimeout(updateCount, 200);
    // Observe DOM changes for live updates
    const mo = new MutationObserver(updateCount);
    if (panelRef.current) {
      mo.observe(panelRef.current, { subtree: true, childList: true });
    }
    return () => {
      clearTimeout(timer);
      mo.disconnect();
    };
  }, [updateCount]);

  return (
    <div ref={panelRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.75)',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: 6,
          fontFamily: 'monospace',
          fontSize: 13,
          lineHeight: 1.5,
          pointerEvents: 'none',
          userSelect: 'none',
          backdropFilter: 'blur(4px)',
        }}
      >
        DOM nodes: {count.dom}
        <br />
        Total events: {count.total}
        <br />
        <span style={{ color: count.dom < count.total ? '#4ade80' : '#94a3b8' }}>
          {count.dom < count.total
            ? `✓ Virtual scroll (${Math.round((1 - count.dom / count.total) * 100)}% DOM saved)`
            : '○ All items rendered (fits viewport)'}
        </span>
      </div>
    </div>
  );
}

const WIDTH = '480px';
const HEIGHT = '600px';

const ALL_EVENT_TYPES: CockpitEventType[] = [
  'step-start',
  'step-end',
  'phase-change',
  'thinking',
  'token',
  'llm-request',
  'llm-response',
  'tool-start',
  'tool-end',
  'skill-start',
  'skill-end',
  'subagent-start',
  'subagent-end',
  'subagent-token',
  'subagent-thinking',
  'subagent-tool-start',
  'subagent-tool-end',
  'compressing',
  'compressed',
  'waiting-human',
  'error',
];

function generateEvents(count: number): CockpitEvent[] {
  const events: CockpitEvent[] = [];
  const tokenPhrases = [
    'The agent is processing',
    'analyzing the request',
    'checking available tools',
    'found relevant skill',
    'executing operation',
    'verifying results',
    'operation completed successfully',
    'an error occurred during processing',
    'initializing sub-agent for task',
    'compressing conversation context',
    'waiting for human input',
  ];

  for (let i = 0; i < count; i++) {
    const type = ALL_EVENT_TYPES[Math.floor(Math.random() * ALL_EVENT_TYPES.length)];
    let label = `Event #${i}`;
    let payload: Record<string, unknown> | undefined;

    switch (type) {
      case 'step-start':
        label = `Step ${(i % 5) + 1}`;
        payload = { step: (i % 5) + 1, name: `step-${(i % 5) + 1}` };
        break;
      case 'step-end':
        label = `Step ${(i % 5) + 1} done`;
        payload = { step: (i % 5) + 1, duration: Math.floor(Math.random() * 5000) };
        break;
      case 'phase-change':
        payload = {
          from: 'processing',
          to: ['done', 'error', 'waiting'][Math.floor(Math.random() * 3)],
        };
        break;
      case 'thinking':
        label = tokenPhrases[i % tokenPhrases.length];
        payload = { content: `The agent is thinking about ${label.toLowerCase()}...` };
        break;
      case 'token':
        payload = { token: `word_${i}` };
        break;
      case 'tool-start':
        label = ['read_file', 'write_file', 'search_web', 'run_command'][
          Math.floor(Math.random() * 4)
        ];
        payload = { name: label };
        break;
      case 'error':
        label = `Error: ${['timeout', 'rate_limit', 'invalid_input'][Math.floor(Math.random() * 3)]}`;
        payload = { message: label };
        break;
      default:
        break;
    }

    events.push({
      id: `event-${i}`,
      timestamp: Date.now() + i * 100,
      type,
      label,
      payload,
    });
  }
  return events;
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

const meta = {
  title: 'panels/event-log/EventLogPanel',
  component: EventLogPanel,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Container>
          <VirtualScrollCounter>
            <Story />
          </VirtualScrollCounter>
        </Container>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof EventLogPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 20 events — trivial, no virtual scroll needed */
export const FewEvents: Story = {
  args: {
    events: generateEvents(20),
  },
};

/** 100 events — moderate, virtual scroll starts to matter */
export const HundredEvents: Story = {
  args: {
    events: generateEvents(100),
  },
};

/** 1000 events — virtual scroll in action */
export const ThousandEvents: Story = {
  args: {
    events: generateEvents(1000),
  },
};

/** 10000 events — stress test virtual scroll performance */
export const TenThousandEvents: Story = {
  args: {
    events: generateEvents(10000),
  },
};

/**
 * Live streaming demo — events are appended in real time.
 * Simulates agent execution: random events + token bursts.
 */
export const LiveStreaming = {
  render: () => {
    const [events, setEvents] = useState<CockpitEvent[]>([]);
    const counterRef = useRef(0);
    const isStreamingTokensRef = useRef(false);
    const tokenCountRef = useRef(0);

    const addEvent = useCallback(
      (type: CockpitEventType, label: string, payload?: Record<string, unknown>) => {
        setEvents((prev) => [
          ...prev,
          {
            id: `live-${counterRef.current++}`,
            timestamp: Date.now(),
            type,
            label,
            payload,
          },
        ]);
      },
      []
    );

    // Simulate agent execution loop
    useEffect(() => {
      const phases: Array<{
        type: CockpitEventType;
        label: string;
        payload?: Record<string, unknown>;
      }> = [
        { type: 'phase-change', label: '', payload: { from: 'idle', to: 'processing' } },
        { type: 'step-start', label: 'Step 1', payload: { step: 1, name: 'analyze' } },
        {
          type: 'thinking',
          label: 'Analyzing the request...',
          payload: { content: 'Analyzing the request...' },
        },
        {
          type: 'tool-start',
          label: 'read_file',
          payload: { name: 'read_file', args: 'src/main.ts' },
        },
        {
          type: 'tool-end',
          label: 'read_file done',
          payload: { name: 'read_file', duration: 320 },
        },
        {
          type: 'thinking',
          label: 'Checking available tools...',
          payload: { content: 'Checking available tools...' },
        },
        {
          type: 'tool-start',
          label: 'search_web',
          payload: { name: 'search_web', query: 'react-virtual' },
        },
        {
          type: 'tool-end',
          label: 'search_web done',
          payload: { name: 'search_web', duration: 1500 },
        },
        {
          type: 'thinking',
          label: 'Synthesizing results...',
          payload: { content: 'Synthesizing results...' },
        },
        { type: 'step-end', label: 'Step 1 done', payload: { step: 1, duration: 2800 } },
        { type: 'step-start', label: 'Step 2', payload: { step: 2, name: 'implement' } },
        { type: 'compressing', label: '', payload: {} },
        { type: 'compressed', label: '', payload: { tokensBefore: 4520, tokensAfter: 2100 } },
        { type: 'step-end', label: 'Step 2 done', payload: { step: 2, duration: 1500 } },
        {
          type: 'error',
          label: 'Error: rate_limit',
          payload: { message: 'Rate limit exceeded', retryAfter: 5 },
        },
      ];

      let idx = 0;
      const interval = setInterval(() => {
        if (idx < phases.length) {
          const p = phases[idx];
          addEvent(p.type, p.label, p.payload);
          idx++;

          // Occasionally simulate token streaming after a thinking event
          if (p.type === 'thinking' && Math.random() > 0.5) {
            isStreamingTokensRef.current = true;
            tokenCountRef.current = 0;
          }
        } else {
          // Restart the cycle
          idx = 0;
          addEvent('phase-change', '', { from: 'done', to: 'processing' });
        }
      }, 600);

      return () => clearInterval(interval);
    }, [addEvent]);

    // Token streaming — bursts of token events after thinking events
    useEffect(() => {
      const tokenInterval = setInterval(() => {
        if (isStreamingTokensRef.current) {
          const word = [
            'The',
            ' agent',
            ' is',
            ' processing',
            ' the',
            ' request',
            '...',
            ' done',
            '.',
          ][tokenCountRef.current % 9];
          addEvent('token', '', { token: word });
          tokenCountRef.current++;

          if (tokenCountRef.current >= 30) {
            isStreamingTokensRef.current = false;
          }
        }
      }, 80);

      return () => clearInterval(tokenInterval);
    }, [addEvent]);

    return (
      <div style={{ width: WIDTH, height: HEIGHT }}>
        <EventLogPanel events={events} />
      </div>
    );
  },
};
