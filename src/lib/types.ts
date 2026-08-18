// AgriChain Domain Data Interfaces

export interface User {
  id: string;
  email: string;
  role: 'farmer' | 'aggregator' | 'retailer' | 'consumer' | string;
  name: string;
  organization?: string;
  created_at: string;
}

export interface Batch {
  id: string;
  batch_id: string;
  farmer_id: string;
  crop_name: string;
  location: string;
  harvest_date: string;
  quantity: number;
  unit: string;
  qr_code: string;
  ipfs_hash?: string;
  blockchain_hash?: string;
  blockchain_tx_hash?: string;
  initial_data?: Record<string, any>;
  status: 'active' | 'recalled' | 'completed' | string;
  created_at: string;
  updated_at: string;
}

export interface TraceEvent {
  id: string;
  batch_id: string;
  event_type: 'harvest' | 'transport' | 'processing' | 'storage' | 'retail' | string;
  actor_id: string;
  actor_role: 'farmer' | 'aggregator' | 'retailer' | 'consumer' | string;
  location: string;
  timestamp: string;
  temperature?: number;
  humidity?: number;
  notes?: string;
  blockchain_tx_hash?: string;
  created_at: string;
}

export interface BlockchainAnchor {
  id: string;
  batch_id: string;
  event_id?: string;
  hash: string;
  tx_hash: string;
  block_number: number;
  timestamp: string;
  created_at: string;
}
