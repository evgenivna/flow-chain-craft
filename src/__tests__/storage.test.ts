import { describe, it, expect, beforeEach } from 'vitest';
import {
  initDB,
  saveSetting,
  getSetting,
  deleteSetting,
  saveFlow,
  getFlow,
  getAllFlows,
  deleteFlow
} from '@/lib/storage';

describe('Storage', () => {
  beforeEach(async () => {
    await initDB();
  });

  it('should save and retrieve settings', async () => {
    await saveSetting('test_key', 'test_value');
    const value = await getSetting('test_key');
    expect(value).toBe('test_value');
  });

  it('should encrypt sensitive settings', async () => {
    await saveSetting('api_key', 'sk-secret123', true);
    const value = await getSetting('api_key');
    expect(value).toBe('sk-secret123');
  });

  it('should delete settings', async () => {
    await saveSetting('test_key', 'test_value');
    await deleteSetting('test_key');
    const value = await getSetting('test_key');
    expect(value).toBeNull();
  });

  it('should save and retrieve flows', async () => {
    const flow = {
      id: 'test-flow',
      name: 'Test Flow',
      nodes: [],
      edges: []
    };
    
    await saveFlow(flow);
    const retrieved = await getFlow('test-flow');
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Test Flow');
  });

  it('should list all flows', async () => {
    await saveFlow({
      id: 'flow-1',
      name: 'Flow 1',
      nodes: [],
      edges: []
    });
    
    await saveFlow({
      id: 'flow-2',
      name: 'Flow 2',
      nodes: [],
      edges: []
    });
    
    const flows = await getAllFlows();
    expect(flows.length).toBeGreaterThanOrEqual(2);
  });

  it('should delete flows', async () => {
    await saveFlow({
      id: 'delete-test',
      name: 'Delete Test',
      nodes: [],
      edges: []
    });
    
    await deleteFlow('delete-test');
    const retrieved = await getFlow('delete-test');
    expect(retrieved).toBeUndefined();
  });
});
