# 🌾 AgriChain
**Blockchain-Enabled Agricultural Supply Chain Transparency Platform**

AgriChain is a full-stack web application that provides end-to-end traceability of agricultural products using QR codes, real-time databases, and optional blockchain verification.

---

## 🚀 Overview

AgriChain enables farmers, aggregators, retailers, and consumers to track agricultural produce from farm to table.  
Each product batch is uniquely identifiable and verifiable through QR scanning and immutable event records.

---

## ✨ Features

- 🔐 Role-Based Access Control (Farmer, Aggregator, Retailer, Consumer)
- 📦 Product Batch Creation with QR Code Generation
- 📸 Real-Time QR Code Scanning via Camera
- 🧾 Complete Supply Chain Event Logging
- 🔗 Optional Blockchain Verification (Ethereum / Polygon)
- 🔥 Firebase Realtime Database Synchronization
- 📊 Dashboard Analytics & Batch Monitoring
- 📱 Mobile-First Responsive UI (Tailwind CSS)

---

## 🛠 Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Radix UI

### Backend & Database
- Firebase Realtime Database
- Firebase Authentication
- Supabase (future/optional)

### Blockchain
- Solidity Smart Contracts
- ethers.js
- Polygon Mumbai Testnet

### QR & Camera
- qrcode.react
- qr-scanner
- jsQR

---

## 📦 Prerequisites

- Node.js 18+
- Firebase account with Realtime Database enabled
- Modern browser with camera access
- (Optional) Polygon Mumbai testnet wallet

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
