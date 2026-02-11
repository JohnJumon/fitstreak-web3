# FitStreak

Workout Streak + Badge Minting dApp built with Next.js, Supabase, and Solidity.

## Core flow

1. Connect wallet (MetaMask)
2. Log workout (type + duration + notes)
3. Store workout logs in Supabase
4. Track streak milestones (3/7/14/30)
5. Mint milestone badge NFT on Sepolia

## Pages

- `/` Landing page + connect wallet
- `/log` Workout logs, streak stats, mint flow
- `/profile` Wallet info + unlockable badges

## Tech stack

- Next.js (App Router, TypeScript)
- Tailwind CSS
- viem (wallet + contract calls)
- Supabase (Postgres + API)
- Solidity + Hardhat (Sepolia)

## Environment variables

Create `Workout Logging with Blockchain/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_BADGE_CONTRACT=
NEXT_PUBLIC_RPC_URL=

SEPOLIA_RPC_URL=
PRIVATE_KEY=
```

Notes:
- `NEXT_PUBLIC_RPC_URL` and `SEPOLIA_RPC_URL` can be the same Sepolia endpoint.
- `PRIVATE_KEY` is only for local Hardhat deployment.
- Never commit `.env.local`.

## Local setup

1. Install dependencies
```bash
npm install
```

2. Create Supabase schema
- Open Supabase SQL editor
- Run `supabase/schema.sql`

3. Compile + deploy contract to Sepolia
```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
```

4. Set deployed contract address in `.env.local`
```env
NEXT_PUBLIC_BADGE_CONTRACT=0x...
```

5. Run app
```bash
npm run dev
```

## Fast testing without waiting days

Seed logs directly in Supabase SQL using your wallet address:

```sql
insert into public.workout_logs (wallet_address, workout_type, duration_min, notes, workout_date)
values
('0xyourwallet...', 'Cardio', 20, 'Seed day -2', current_date - interval '2 day'),
('0xyourwallet...', 'Strength', 30, 'Seed day -1', current_date - interval '1 day'),
('0xyourwallet...', 'Mobility', 25, 'Seed today', current_date);
```

This immediately gives a 3-day streak for mint testing.

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add Vercel env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_BADGE_CONTRACT`
   - `NEXT_PUBLIC_RPC_URL`
4. Deploy

## Important behavior

- Mint flow includes step states:
  `Prepare -> Sign -> Confirm -> Minted`
- Success modal appears after onchain confirmation.
- Log/profile auto-refresh after mint.
- Sticky mint reminder only appears when milestone is unlocked and not yet minted.
