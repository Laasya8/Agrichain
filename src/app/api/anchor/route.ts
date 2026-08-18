import { NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, SUPPLY_CHAIN_ABI } from '@/lib/blockchain'

export async function POST(request: Request) {
  try {
    const { batchId, hash } = await request.json()

    if (!batchId || !hash) {
      return NextResponse.json({ success: false, error: 'batchId and hash are required' }, { status: 400 })
    }

    const rpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'
    const privateKey = process.env.PRIVATE_KEY

    if (!privateKey || !CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      console.warn('⚠️ Blockchain/PrivateKey not fully configured for server-side anchoring.')
      return NextResponse.json({ success: false, error: 'Blockchain/PrivateKey not configured' })
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, { staticNetwork: true })
    const wallet = new ethers.Wallet(privateKey, provider)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SUPPLY_CHAIN_ABI, wallet)

    console.log(`⛓️ Server anchoring record on Sepolia: batchId=${batchId}, hash=${hash}`)
    const tx = await contract.anchorRecord(batchId, hash)
    await tx.wait()
    console.log(`✅ Record anchored successfully! TxHash: ${tx.hash}`)

    return NextResponse.json({
      success: true,
      txHash: tx.hash,
      blockNumber: tx.blockNumber
    })
  } catch (error: any) {
    console.error('❌ Error anchoring batch on blockchain:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to anchor' })
  }
}
