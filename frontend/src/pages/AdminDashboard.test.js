import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';
import api from '../api';
vi.mock('../api', () => ({ __esModule: true, default: { get: vi.fn(), patch: vi.fn() } }));
beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockImplementation(url => Promise.resolve({ data: url.endsWith('/stats') ? { users: 4, donors: 1, requesters: 2, donations: 6, requests: 3, suspended: 0, categories: [{_id:'Books',count:2}], statuses: [{_id:'Pending',count:1}] } : { items: [{_id:'1',fullName:'Rowan Vale',email:'rowan@example.test',role:'Requester',status:'active'}], total:1, page:1, pages:1 } }));
});
test('admin overview displays statistics in the shared application interface', async () => {
  render(<AdminDashboard />);
  expect(await screen.findByText('Total users')).toBeInTheDocument();
  expect(screen.getByRole('heading', {name:'Donation categories'})).toBeInTheDocument();
  expect(screen.getByText('Books')).toBeInTheDocument();
});
test('user search and suspension use protected admin endpoints', async () => {
  window.confirm = vi.fn(() => true); api.patch.mockResolvedValue({data:{}});
  render(<AdminDashboard />);
  fireEvent.click(screen.getByRole('button', {name:'users'}));
  expect(await screen.findByText('Rowan Vale')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Search users'), { target: {value:'Rowan'} });
  fireEvent.click(screen.getByRole('button', {name:'Search'}));
  await waitFor(() => expect(api.get).toHaveBeenCalledWith('/api/admin/users', {params:{page:1,search:'Rowan'}}));
  fireEvent.click(await screen.findByRole('button', {name:'Suspend'}));
  await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/api/admin/users/1', {status:'suspended'}));
});
