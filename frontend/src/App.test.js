import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import api from './api';
import DonorRequests from './pages/DonorRequests';
import MyRequests from './pages/MyRequests';
jest.mock('./api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn() }, imageUrl: jest.fn(() => '/donation-fallback.svg') }));
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  api.get.mockResolvedValue({ data: [] });
});
test('signed-out visitors see registration and can switch to login', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Create an Account' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Login Here' }));
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
});
test('a donor sees their home page and donation form', async () => {
  localStorage.setItem('user', JSON.stringify({ id: 'donor', fullName: 'Mira Willow', email: 'mira@example.test', role: 'Donor' }));
  localStorage.setItem('token', 'test-session');
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Welcome, Mira Willow!' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: /Donate Now/ }));
  expect(screen.getByLabelText('Item Name')).toBeInTheDocument();
  await waitFor(() => expect(api.get).toHaveBeenCalledWith('/api/donations'));
});
test('donor approval and rejection persist through API calls and update the status', async () => {
  localStorage.setItem('user', JSON.stringify({ email: 'mira@example.test' }));
  const request = { _id: 'request-1', itemId: { itemName: 'Textbooks', donorEmail: 'mira@example.test' }, requesterName: 'Rowan Vale', reason: 'For study', status: 'Pending' };
  api.get.mockResolvedValue({ data: [request] });
  api.put.mockImplementation((url, body) => Promise.resolve({ data: { ...request, ...body } }));
  render(<DonorRequests />);
  fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));
  expect(await screen.findByText('Approved')).toBeInTheDocument();
  expect(api.put).toHaveBeenCalledWith('/api/requests/request-1', { status: 'Approved' });
  fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
  expect(await screen.findByText('Rejected')).toBeInTheDocument();
});
test('request history renders all three supported statuses', async () => {
  localStorage.setItem('user', JSON.stringify({ id: 'requester' }));
  api.get.mockResolvedValue({ data: ['Pending','Approved','Rejected'].map((status,i) => ({ _id: String(i), itemId: { itemName: `Item ${i}`, category: 'Books' }, reason: 'For study', status, createdAt: '2026-10-21T00:00:00Z' })) });
  render(<MyRequests />);
  for (const status of ['Pending','Approved','Rejected']) expect(await screen.findByText(status)).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledTimes(1);
});
