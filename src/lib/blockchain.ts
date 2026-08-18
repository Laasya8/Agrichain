import { ethers } from 'ethers'

// Smart Contract ABI for Supply Chain Anchoring
export const SUPPLY_CHAIN_ABI = [
  "function anchorRecord(string memory batchId, string memory hash) public",
  "function getRecord(string memory batchId) public view returns (string memory hash, uint256 timestamp, address sender)",
  "event RecordAnchored(string indexed batchId, string hash, uint256 timestamp, address sender)"
]

// Contract address (will be set after deployment)
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

// Initialize provider and signer
export const getProvider = () => {
  const rpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'
  return new ethers.JsonRpcProvider(rpcUrl, undefined, { staticNetwork: true })
}

export const getContract = () => {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    console.warn('⚠️ Contract address not configured. Blockchain features will be disabled.')
    return null
  }
  const provider = getProvider()
  return new ethers.Contract(CONTRACT_ADDRESS, SUPPLY_CHAIN_ABI, provider)
}

// Generate hash for batch data
export const generateBatchHash = (batchData: {
  batchId: string
  cropName: string
  location: string
  harvestDate: string
  quantity: number
  farmerId: string
}) => {
  const dataString = JSON.stringify(batchData)
  return ethers.keccak256(ethers.toUtf8Bytes(dataString))
}

// Verify Firebase Batch against blockchain hash
export const verifyBatchHash = (firebaseBatch: any, blockchainHash: string) => {
  const currentHash = generateBatchHash({
    batchId: firebaseBatch.batch_id,
    cropName: firebaseBatch.crop_name,
    location: firebaseBatch.location,
    harvestDate: firebaseBatch.harvest_date,
    quantity: Number(firebaseBatch.quantity),
    farmerId: firebaseBatch.farmer_id
  })
  return {
    isMatch: currentHash.toLowerCase() === blockchainHash.toLowerCase(),
    currentHash,
    blockchainHash
  }
}

export interface TamperDiff {
  step: string
  field: string
  from: string
  to: string
}

export const detectTamperedFields = (batch: any, events: any[] = []): TamperDiff[] => {
  const diffs: TamperDiff[] = []
  const initial = batch.initial_data
  const harvestEvent = Array.isArray(events) ? events.find((e: any) => e.event_type === 'harvest') : null

  // Check location (using initial_data or original harvest event location)
  const originalLocation = initial?.location || harvestEvent?.location
  if (originalLocation && originalLocation !== batch.location) {
    diffs.push({
      step: 'Step 1: Initial Harvest & Farm Origin',
      field: 'Farm Harvest Location',
      from: `${originalLocation} (Original Farm Location)`,
      to: `${batch.location} (Tampered Current Location)`
    })
  }

  // Check quantity
  const originalQuantity = initial?.quantity
  if (originalQuantity !== undefined && Number(originalQuantity) !== Number(batch.quantity)) {
    diffs.push({
      step: 'Step 1: Initial Harvest & Farm Origin',
      field: 'Harvest Crop Quantity',
      from: `${originalQuantity} ${initial?.unit || batch.unit} (Original Quantity)`,
      to: `${batch.quantity} ${batch.unit} (Tampered Quantity)`
    })
  }

  // Check crop name
  const originalCrop = initial?.crop_name
  if (originalCrop && originalCrop !== batch.crop_name) {
    diffs.push({
      step: 'Step 1: Initial Harvest & Farm Origin',
      field: 'Crop Name Specification',
      from: `${originalCrop} (Original Crop)`,
      to: `${batch.crop_name} (Tampered Crop)`
    })
  }

  // Check harvest date
  const originalDate = initial?.harvest_date
  if (originalDate && originalDate !== batch.harvest_date) {
    diffs.push({
      step: 'Step 1: Initial Harvest & Farm Origin',
      field: 'Harvest Date Timestamp',
      from: `${originalDate} (Original Date)`,
      to: `${batch.harvest_date} (Tampered Date)`
    })
  }

  if (diffs.length === 0) {
    diffs.push({
      step: 'Step 1: Initial Harvest & Farm Origin',
      field: 'Farm Origin Data Specs',
      from: `Anchored Blockchain Record`,
      to: `Current Database Value (${batch.location}, ${batch.quantity} ${batch.unit})`
    })
  }

  return diffs
}

// Generate hash for event data
export const generateEventHash = (eventData: {
  batchId: string
  eventType: string
  actorId: string
  location: string
  timestamp: string
  temperature?: number
  humidity?: number
}) => {
  const dataString = JSON.stringify(eventData)
  return ethers.keccak256(ethers.toUtf8Bytes(dataString))
}

// Anchor record to blockchain (requires wallet connection)
export const anchorRecord = async (
  batchId: string, 
  hash: string, 
  signer: ethers.Signer
) => {
  try {
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      return {
        success: false,
        error: 'Smart contract not deployed. Please deploy the contract first or set NEXT_PUBLIC_CONTRACT_ADDRESS.'
      }
    }
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SUPPLY_CHAIN_ABI, signer)
    const tx = await contract.anchorRecord(batchId, hash)
    await tx.wait()
    return {
      success: true,
      txHash: tx.hash,
      blockNumber: tx.blockNumber
    }
  } catch (error) {
    console.error('Error anchoring record:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Get record from blockchain
export const getRecord = async (batchId: string) => {
  try {
    const contract = getContract()
    if (!contract) {
      return {
        success: false,
        error: 'Blockchain features disabled - contract not configured'
      }
    }
    const record = await contract.getRecord(batchId)
    return {
      success: true,
      hash: record[0],
      timestamp: record[1],
      sender: record[2]
    }
  } catch (error) {
    console.error('Error getting record:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
