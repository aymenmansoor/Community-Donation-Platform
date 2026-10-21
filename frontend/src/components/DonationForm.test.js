import { vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import DonationForm from './DonationForm';
vi.mock('../api', () => ({__esModule:true, default:{post:vi.fn()}}));
beforeEach(() => {
  localStorage.setItem('user',JSON.stringify({email:'donor@example.test'}));
  URL.createObjectURL = vi.fn(() => 'blob:local-preview');
  URL.revokeObjectURL = vi.fn();
});
test('a selected photo is previewed and object URLs are released on unmount', () => {
  render(<DonationForm onPostSuccess={vi.fn()} />);
  fireEvent.change(screen.getByLabelText('Item Image'), {target:{files:[new File(['test'], 'photo.webp', {type:'image/webp'})]}});
  expect(screen.getByAltText('Selected donation photograph')).toHaveAttribute('src','blob:local-preview');
  cleanup(); expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:local-preview');
});
test('unsafe/oversized file choices show useful feedback without a preview', () => {
  render(<DonationForm onPostSuccess={vi.fn()} />);
  fireEvent.change(screen.getByLabelText('Item Image'), {target:{files:[new File(['<svg/>'], 'photo.svg', {type:'image/svg+xml'})]}});
  expect(screen.getByRole('alert')).toHaveTextContent('up to 5 MiB');
  expect(screen.queryByAltText('Selected donation photograph')).not.toBeInTheDocument();
});
