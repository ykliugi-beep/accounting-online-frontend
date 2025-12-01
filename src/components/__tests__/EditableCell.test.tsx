import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EditableCell from '../Document/EditableCell';

describe('EditableCell keyboard navigation', () => {
  const baseProps = {
    value: 0,
    itemId: 1,
    field: 'quantity',
    type: 'decimal' as const,
    status: 'idle' as const,
    onValueChange: vi.fn(),
  };

  const setup = (props = {}) => {
    const onValueChange = vi.fn();
    const onMove = vi.fn();

    render(
      <EditableCell
        {...baseProps}
        {...props}
        onValueChange={onValueChange}
        onMove={onMove}
      />
    );

    return { onValueChange, onMove };
  };

  it('commits value and moves to the next column on Tab', () => {
    const { onValueChange, onMove } = setup({ value: 1 });
    const input = screen.getByRole('spinbutton');

    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.keyDown(input, { key: 'Tab' });

    expect(onValueChange).toHaveBeenCalledWith(1, 'quantity', 5);
    expect(onMove).toHaveBeenCalledWith('nextColumn');
  });

  it('moves to the previous column on Shift+Tab', () => {
    const { onMove } = setup({ value: 2 });
    const input = screen.getByRole('spinbutton');

    fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });

    expect(onMove).toHaveBeenCalledWith('prevColumn');
  });

  it('moves down on Enter and up on Shift+Enter', () => {
    const { onMove, onValueChange } = setup({ value: 3 });
    const input = screen.getByRole('spinbutton');

    fireEvent.change(input, { target: { value: '6' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onValueChange).toHaveBeenCalledWith(1, 'quantity', 6);
    expect(onMove).toHaveBeenCalledWith('nextRow');

    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(onMove).toHaveBeenCalledWith('prevRow');
  });
});
